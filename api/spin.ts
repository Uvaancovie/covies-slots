import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../drizzle/index';
import { gameRounds, userBonusClaims } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../lib/auth';
import { createTransaction, getUserBalance } from '../lib/db-helpers';
import { SlotGameEngine } from '../core/evaluator';
import { cache, CACHE_TTL, cacheKeys } from '../lib/cache';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const { betAmount, betPerLine, linesPlayed = 20 } = req.body;
    const finalBetPerLine = betPerLine || betAmount;

    if (!finalBetPerLine || finalBetPerLine <= 0) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }

    const totalBet = finalBetPerLine * linesPlayed;
    let isFreeSpin = false;
    let userBonusClaimId: string | null = null;
    let multiplier = 1;

    // ⚡ Read balance once up-front; we keep a running balance and avoid re-summing the ledger.
    let runningBalance = await getUserBalance(authUser.userId);

    // ⚡ Check for active free spins bonus with caching
    let activeFreeSpinsBonus = null;
    
    // Skip free spins check if we know balance is sufficient (optimization)
    if (runningBalance < totalBet) {
      const bonusCacheKey = cacheKeys.activeBonus(authUser.userId);
      const cachedBonus = cache.get<any>(bonusCacheKey);
      
      if (cachedBonus !== null) {
        activeFreeSpinsBonus = cachedBonus;
      } else {
        const [bonus] = await db
          .select()
          .from(userBonusClaims)
          .where(
            and(
              eq(userBonusClaims.userId, authUser.userId),
              eq(userBonusClaims.status, 'ACTIVE')
            )
          )
          .limit(1);
        
        activeFreeSpinsBonus = bonus || null;
        // Cache active bonus for 1 minute
        cache.set(bonusCacheKey, activeFreeSpinsBonus, CACHE_TTL.BONUS);
      }
    }

    if (activeFreeSpinsBonus && activeFreeSpinsBonus.freeSpinsRemaining && activeFreeSpinsBonus.freeSpinsRemaining > 0) {
      // Use free spin
      isFreeSpin = true;
      userBonusClaimId = activeFreeSpinsBonus.id;
      multiplier = 1; // Could be higher for bonus spins
      
      // Decrement free spins
      const remaining = activeFreeSpinsBonus.freeSpinsRemaining - 1;
      await db
        .update(userBonusClaims)
        .set({
          freeSpinsRemaining: remaining,
          status: remaining === 0 ? 'COMPLETED' : 'ACTIVE',
          completedAt: remaining === 0 ? new Date() : null,
        })
        .where(eq(userBonusClaims.id, activeFreeSpinsBonus.id));
      
      // ⚡ Invalidate bonus cache after update
      cache.delete(cacheKeys.activeBonus(authUser.userId));
    } else {
      // Regular spin - check balance
      if (runningBalance < totalBet) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      // Deduct bet
      const betTx = await createTransaction(
        authUser.userId,
        'BET',
        totalBet,
        'Slot Spin',
        'COMPLETED',
        { betAmount: finalBetPerLine, linesPlayed },
        runningBalance
      );

      runningBalance = betTx.balanceAfter;
    }

    // Run slot engine (server-side RNG)
    const engine = new SlotGameEngine();
    const result = engine.spin(finalBetPerLine, totalBet);

    const winAmount = result.totalWin * multiplier;

    // Credit win if any
    if (winAmount > 0) {
      const winTx = await createTransaction(
        authUser.userId,
        'WIN',
        winAmount,
        'Slot Win',
        'COMPLETED',
        { betAmount: finalBetPerLine, linesPlayed, multiplier },
        runningBalance
      );

      runningBalance = winTx.balanceAfter;
    }

    // Save game round
    const [round] = await db
      .insert(gameRounds)
      .values({
        userId: authUser.userId,
        betAmount: totalBet.toFixed(2),
        winAmount: winAmount.toFixed(2),
        isFreeSpin,
        multiplier: multiplier.toFixed(2),
        resultGrid: result,
        userBonusClaimId,
      })
      .returning();

    return res.status(200).json({
      round: {
        id: round.id,
        betAmount: totalBet,
        winAmount,
        isFreeSpin,
        multiplier,
        result,
        createdAt: round.createdAt,
      },
      balance: runningBalance,
      freeSpinsRemaining: isFreeSpin
        ? (activeFreeSpinsBonus?.freeSpinsRemaining || 0) - 1
        : 0,
    });
  } catch (error: any) {
    console.error('Spin error:', error);
    return res.status(500).json({ error: error.message || 'Spin failed' });
  }
}
