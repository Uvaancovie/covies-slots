import type { VercelRequest, VercelResponse } from '@vercel/node';
import walletHandler from './wallet';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure request query contains action=deposit
  if (!req.query) req.query = {} as any;
  (req.query as any).action = 'deposit';
  return walletHandler(req, res);
}
