import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../drizzle/index';
import { bonuses, userBonusClaims } from '../../drizzle/schema';
import { eq, and, or, isNull, gte } from 'drizzle-orm';
import { requireAuth } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    // Get all active bonuses
    const allBonuses = await db
      .select()
      .from(bonuses)
      .where(
        and(
          eq(bonuses.isActive, true),
          or(isNull(bonuses.expiresAt), gte(bonuses.expiresAt, new Date()))
        )
      );

    // Get user's claims
    const userClaims = await db
      .select()
      .from(userBonusClaims)
      .where(eq(userBonusClaims.userId, authUser.userId));

    const claimsByBonusId = new Map(userClaims.map(c => [c.bonusId, c]));

    // Merge bonus data with claim status
    const bonusesWithStatus = allBonuses.map(bonus => {
      const claim = claimsByBonusId.get(bonus.id) as typeof userClaims[0] | undefined;
      return {
        ...bonus,
        claimed: !!claim,
        claimStatus: claim?.status || null,
        freeSpinsRemaining: claim?.freeSpinsRemaining || 0,
        claimedAt: claim?.claimedAt || null,
      };
    });

    return res.status(200).json({ bonuses: bonusesWithStatus });
  } catch (error) {
    console.error('Get bonuses error:', error);
    return res.status(500).json({ error: 'Failed to fetch bonuses' });
  }
}
