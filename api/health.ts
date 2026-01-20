import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMissingServerEnv } from '../lib/server-config';
import postgres from 'postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const missing = getMissingServerEnv();

  const result: any = {
    serverTime: new Date().toISOString(),
    missingEnv: missing,
    clerkSecretPresent: Boolean(process.env.CLERK_SECRET_KEY),
    database: { reachable: false, detail: null },
  };

  // If there's no DATABASE_URL, short-circuit the DB test
  if (!missing.includes('DATABASE_URL')) {
    try {
      const sql = postgres(process.env.DATABASE_URL as string, { prepare: false, ssl: 'require' });
      // run a lightweight query
      await sql`select 1 as ok`;
      result.database.reachable = true;
      await sql.end?.();
    } catch (err: any) {
      result.database.detail = err?.message || String(err);
      console.error('Health check DB error:', err);
    }
  }

  // If there are missing env vars, return 500 to indicate misconfiguration
  if (missing.length > 0) {
    return res.status(500).json(result);
  }

  return res.status(200).json(result);
}
