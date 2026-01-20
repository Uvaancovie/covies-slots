import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../drizzle/index';
import { bonuses, userBonusClaims } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../../lib/auth';
import { createTransaction } from '../../lib/db-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const { bonusId } = req.body;

    if (!bonusId) {
      return res.status(400).json({ error: 'Bonus ID is required' });
    }

    // Get bonus details
    const [bonus] = await db.select().from(bonuses).where(eq(bonuses.id, bonusId)).limit(1);

    if (!bonus) {
      return res.status(404).json({ error: 'Bonus not found' });
    }

    if (!bonus.isActive) {
      return res.status(400).json({ error: 'Bonus is not active' });
    }

    if (bonus.expiresAt && bonus.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Bonus has expired' });
    }

    // Check if already claimed
    const existingClaim = await db
      .select()
      .from(userBonusClaims)
      .where(
        and(
          eq(userBonusClaims.userId, authUser.userId),
          eq(userBonusClaims.bonusId, bonusId)
        )
      )
      .limit(1);

    if (existingClaim.length > 0) {
      return res.status(400).json({ error: 'Bonus already claimed' });
    }

    // Calculate expiry (if applicable)
    let expiresAt: Date | null = null;
    if (bonus.rules && typeof bonus.rules === 'object' && 'validForDays' in bonus.rules) {
      const days = (bonus.rules as any).validForDays as number;
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    // Create claim
    const creditAmount = parseFloat(bonus.creditAmount || '0');
    const freeSpinsCount = bonus.freeSpinsCount || 0;

    const [claim] = await db
      .insert(userBonusClaims)
      .values({
        userId: authUser.userId,
        bonusId: bonus.id,
        status: 'ACTIVE',
        creditedAmount: creditAmount.toFixed(2),
        freeSpinsTotal: freeSpinsCount,
        freeSpinsRemaining: freeSpinsCount,
        expiresAt,
      })
      .returning();

    // Credit balance if applicable
    if (creditAmount > 0) {
      await createTransaction(
        authUser.userId,
        'BONUS_CREDIT',
        creditAmount,
        bonus.name,
        'COMPLETED',
        { bonusId: bonus.id, claimId: claim.id }
      );
    }

    return res.status(200).json({
      claim,
      message: `Bonus claimed successfully! ${
        creditAmount > 0 ? `R${creditAmount} credited. ` : ''
      }${freeSpinsCount > 0 ? `${freeSpinsCount} free spins added.` : ''}`,
    });
  } catch (error) {
    console.error('Claim bonus error:', error);
    return res.status(500).json({ error: 'Failed to claim bonus' });
  }
}
