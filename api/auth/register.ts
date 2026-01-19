import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../drizzle/index';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, signToken, setAuthCookie } from '../../lib/auth';
import { generateReferralCode, createTransaction } from '../../lib/db-helpers';
import { GAME_CONFIG } from '../../core/config';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const referralCode = await generateReferralCode();

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        name,
        referralCode,
        isAdmin: false,
      })
      .returning();

    // Create welcome bonus transaction
    const welcomeAmount = GAME_CONFIG?.INITIAL_BALANCE || 1000;
    await createTransaction(
      newUser.id,
      'BONUS_CREDIT',
      welcomeAmount,
      'Welcome Bonus',
      'COMPLETED'
    );

    // Generate JWT
    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    });

    // Set cookie
    setAuthCookie(res, token);

    return res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        referralCode: newUser.referralCode,
        isAdmin: newUser.isAdmin,
        joinedDate: newUser.joinedDate,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}
