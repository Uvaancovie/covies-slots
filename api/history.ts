import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../drizzle/index';
import { gameRounds } from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const { limit = '50', offset = '0' } = req.query;

    const history = await db
      .select()
      .from(gameRounds)
      .where(eq(gameRounds.userId, authUser.userId))
      .orderBy(desc(gameRounds.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    return res.status(200).json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
}
