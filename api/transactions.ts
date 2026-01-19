import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../drizzle/index';
import { transactions as transactionsTable } from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../lib/auth';
import { getUserBalance } from '../lib/db-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authUser = requireAuth(req, res);
  if (!authUser) return;

  if (req.method === 'GET') {
    try {
      const { limit = '50', offset = '0' } = req.query;

      const transactions = await db
        .select()
        .from(transactionsTable)
        .where(eq(transactionsTable.userId, authUser.userId))
        .orderBy(desc(transactionsTable.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      const balance = await getUserBalance(authUser.userId);

      return res.status(200).json({
        transactions,
        balance,
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
