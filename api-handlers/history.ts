import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../drizzle/index';
import { gameRounds } from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../lib/auth';
import { GoogleGenAI } from '@google/genai';

function historyFallback(summary: any) {
  const totalSpins = summary?.totalSpins || 0;
  const totalBets = summary?.totalBets || 0;
  const profit = summary?.profit || 0;
  const winRate = summary?.winRate || 0;
  if (totalSpins === 0) return 'No history yet—start spinning to unlock insights.';
  const roi = totalBets > 0 ? (profit / totalBets) * 100 : 0;
  const pnl = profit >= 0 ? `up ${profit.toFixed(2)} ZAR` : `down ${Math.abs(profit).toFixed(2)} ZAR`;
  return `So far you’re ${pnl} over ${totalSpins} spins (${winRate.toFixed(1)}% win rate, ${roi.toFixed(1)}% ROI).`;
}

function getAction(req: VercelRequest): string {
  const actionRaw = req.query?.action;
  const action = Array.isArray(actionRaw) ? actionRaw[0] : actionRaw;
  return String(action || '');
}

async function handleHistory(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const { limit = '50', offset = '0' } = req.query;

    const history = await db
      .select()
      .from(gameRounds)
      .where(eq(gameRounds.userId, authUser.userId))
      .orderBy(desc(gameRounds.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    return res.status(200).json({ history });
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
}

async function handleHistoryAnalysis(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const summary = (req.body as any)?.summary || {};
  const transactionCount = Number((req.body as any)?.transactionCount || 0);

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return res.json({ text: historyFallback(summary), source: 'fallback' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are a casino analyst. Analyze this player's slot machine history.

- Total spins: ${summary.totalSpins}
- Total bets: ${Number(summary.totalBets || 0).toFixed(2)} ZAR
- Total wins: ${Number(summary.totalWins || 0).toFixed(2)} ZAR
- Wins: ${summary.winCount}, Losses: ${summary.lossCount}
- Win rate: ${Number(summary.winRate || 0).toFixed(1)}%
- Net profit/loss: ${Number(summary.profit || 0).toFixed(2)} ZAR
- Transactions: ${transactionCount}

Provide a short, insightful analysis (under 50 words) with responsible advice.
`;

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash',
      contents: prompt,
    });
    const text = result.text || historyFallback(summary);

    return res.json({ text: text.trim(), source: 'gemini' });
  } catch (err: any) {
    console.error('History Analysis Agent Error:', err);
    return res.json({ text: historyFallback(summary), source: 'fallback' });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = getAction(req);
  if (action === 'analysis') {
    return handleHistoryAnalysis(req, res);
  }
  return handleHistory(req, res);
}
