import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../drizzle/index';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, signToken, setAuthCookie } from '../../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    // Set cookie
    setAuthCookie(res, token);

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        referralCode: user.referralCode,
        isAdmin: user.isAdmin,
        joinedDate: user.joinedDate,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}
