import type { VercelRequest, VercelResponse } from '@vercel/node';
import historyHandler from './history';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!req.query) req.query = {} as any;
  (req.query as any).action = 'analysis';
  return historyHandler(req, res);
}
