import type { VercelRequest, VercelResponse } from '@vercel/node';

import { db } from '../drizzle/index';
import { users } from '../drizzle/schema';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const all = await db.select().from(users);
    return res.status(200).json(all);
  } catch {
    return res.status(500).json({ error: 'Database error' });
  }
}
