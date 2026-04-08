import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SlotGameEngine } from '../core/evaluator';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { betPerLine = 1, linesPlayed = 20, betAmount } = req.body || {};
    const finalBetPerLine = Number(betPerLine);
    const finalLinesPlayed = Number(linesPlayed);

    if (!Number.isFinite(finalBetPerLine) || finalBetPerLine <= 0) {
      return res.status(400).json({ error: 'Invalid betPerLine' });
    }

    if (!Number.isFinite(finalLinesPlayed) || finalLinesPlayed <= 0) {
      return res.status(400).json({ error: 'Invalid linesPlayed' });
    }

    const totalBet = Number.isFinite(Number(betAmount)) && Number(betAmount) > 0
      ? Number(betAmount)
      : finalBetPerLine * finalLinesPlayed;

    const engine = new SlotGameEngine();
    const result = engine.spin(finalBetPerLine, totalBet);

    return res.status(200).json({
      round: {
        id: `test_${Date.now()}`,
        betAmount: totalBet,
        winAmount: result.totalWin,
        isFreeSpin: false,
        multiplier: 1,
        result,
        createdAt: new Date().toISOString(),
      },
      balance: 0,
      mode: 'diagnostic',
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Spin test failed',
      ...(process.env.NODE_ENV !== 'production' ? { detail: error?.message || String(error) } : {}),
    });
  }
}
