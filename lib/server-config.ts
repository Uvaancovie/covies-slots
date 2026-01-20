import type { VercelResponse } from '@vercel/node';

export function getMissingServerEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  return missing;
}

export function ensureServerConfigured(res: VercelResponse): boolean {
  const missing = getMissingServerEnv();
  if (missing.length === 0) return true;

  res.status(500).json({
    error: 'Server misconfigured',
    missing,
    hint: 'Set these Environment Variables in Vercel Project Settings (Production + Preview as needed).',
  });
  return false;
}
