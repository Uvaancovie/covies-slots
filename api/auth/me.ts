import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../drizzle/index';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../lib/auth';
import { getUserBalance } from '../../lib/db-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const [user] = await db.select().from(users).where(eq(users.id, authUser.userId)).limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const balance = await getUserBalance(user.id);

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        referralCode: user.referralCode,
        isAdmin: user.isAdmin,
        joinedDate: user.joinedDate,
        balance,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to get user data' });
  }
}
