import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

function luckyFallback(winAmount: number, streak: number) {
  if (streak >= 3) return `You're on fire — ${streak} wins straight!`;
  if (winAmount >= 500) return 'Massive hit! The reels are in your favor.';
  if (winAmount >= 100) return 'Nice win — keep the momentum going!';
  return 'Solid win. Small steps, big streaks.';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const winAmount = Number((req.body as any)?.winAmount || 0);
  const streak = Number((req.body as any)?.streak || 0);

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    return res.json({ text: luckyFallback(winAmount, streak), source: 'fallback' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const promptContext = streak > 1
      ? `The player is on a HOT STREAK of ${streak} wins in a row!`
      : 'This is a fresh win after a break.';

    const prompt = `
You are an enthusiastic casino host.
The player just won ${winAmount.toFixed(2)} ZAR.
${promptContext}
Generate a very short, punchy, exciting congratulatory message (under 25 words).
If it's a streak, mention the heat!
`;

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash',
      contents: prompt,
    });
    const text = result.text || luckyFallback(winAmount, streak);

    return res.json({ text: text.trim(), source: 'gemini' });
  } catch (err: any) {
    console.error('Lucky Story Agent Error:', err);
    return res.json({ text: luckyFallback(winAmount, streak), source: 'fallback' });
  }
}
