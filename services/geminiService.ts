
import { API_BASE_URL } from '../lib/api-config';

type LuckyStoryResponse = {
  text: string;
  source?: 'gemini' | 'cache' | 'fallback' | 'rate_limited';
  retryAfterSeconds?: number;
};

type HistoryAnalysisResponse = {
  text: string;
  source?: 'gemini' | 'cache' | 'fallback' | 'rate_limited';
  retryAfterSeconds?: number;
};

let cooldownUntilMs = 0;

const memoryCache = new Map<string, { value: string; expiresAt: number }>();

function nowMs() {
  return Date.now();
}

function getCached(key: string): string | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= nowMs()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(key: string, value: string, ttlMs: number) {
  memoryCache.set(key, { value, expiresAt: nowMs() + ttlMs });
}

function isCoolingDown() {
  return nowMs() < cooldownUntilMs;
}

function bumpCooldown(seconds: number | undefined) {
  if (!seconds || Number.isNaN(seconds)) return;
  cooldownUntilMs = Math.max(cooldownUntilMs, nowMs() + seconds * 1000);
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Let callers handle non-2xx.
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

function fallbackLuckyStory(winAmount: number, streak: number): string {
  if (streak >= 3) return `You're on fire — ${streak} wins straight!`;
  if (winAmount >= 500) return 'Massive hit! The reels are in your favor.';
  if (winAmount >= 100) return 'Nice win — keep the momentum going!';
  return 'Solid win. Small steps, big streaks.';
}

export async function generateLuckyStory(winAmount: number, streak: number): Promise<string> {
  const winBucket = winAmount >= 500 ? '500+' : winAmount >= 100 ? '100-499' : winAmount >= 20 ? '20-99' : '0-19';
  const key = `lucky:${winBucket}:${Math.round(winAmount)}:${streak}`;

  const cached = getCached(key);
  if (cached) return cached;

  if (isCoolingDown()) {
    const text = fallbackLuckyStory(winAmount, streak);
    setCached(key, text, 60_000);
    return text;
  }

  try {
    const data = await postJson<LuckyStoryResponse>('/api/lucky-story', { winAmount, streak });
    if (data.retryAfterSeconds) bumpCooldown(data.retryAfterSeconds);
    const text = data.text || fallbackLuckyStory(winAmount, streak);
    setCached(key, text, 6 * 60 * 60 * 1000); // 6h
    return text;
  } catch (error) {
    console.error('Error generating lucky story:', error);
    const text = fallbackLuckyStory(winAmount, streak);
    setCached(key, text, 60_000);
    return text;
  }
}

function fallbackHistoryAnalysis(summary: {
  totalSpins: number;
  totalBets: number;
  totalWins: number;
  winCount: number;
  lossCount: number;
  profit: number;
  winRate: number;
}): string {
  const { totalSpins, profit, winRate, totalBets } = summary;
  if (totalSpins === 0) return 'No history yet—start spinning to unlock insights.';
  const roi = totalBets > 0 ? (profit / totalBets) * 100 : 0;
  const pnl = profit >= 0 ? `up ${profit.toFixed(2)} ZAR` : `down ${Math.abs(profit).toFixed(2)} ZAR`;
  const roiText = `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}% ROI`;
  return `So far you’re ${pnl} over ${totalSpins} spins (${winRate.toFixed(1)}% win rate, ${roiText}). Consider lowering bets during cold streaks.`;
}

export async function generateHistoryAnalysis(gameHistory: any[], transactions: any[]): Promise<string> {
  const totalSpins = gameHistory.length;
  const totalBets = gameHistory.reduce((sum: number, g: any) => sum + (g.bet || 0), 0);
  const totalWins = gameHistory.reduce((sum: number, g: any) => sum + (g.win || 0), 0);
  const winCount = gameHistory.filter((g: any) => (g.win || 0) > 0).length;
  const lossCount = totalSpins - winCount;
  const profit = totalWins - totalBets;
  const winRate = totalSpins > 0 ? (winCount / totalSpins) * 100 : 0;

  const signature = `hist:${totalSpins}:${Math.round(totalBets)}:${Math.round(totalWins)}:${Math.round(profit)}`;
  const cached = getCached(signature);
  if (cached) return cached;

  const fallback = fallbackHistoryAnalysis({ totalSpins, totalBets, totalWins, winCount, lossCount, profit, winRate });

  if (isCoolingDown()) {
    setCached(signature, fallback, 60_000);
    return fallback;
  }

  try {
    const data = await postJson<HistoryAnalysisResponse>('/api/history-analysis', {
      summary: { totalSpins, totalBets, totalWins, winCount, lossCount, profit, winRate },
      transactionCount: transactions.length,
    });
    if (data.retryAfterSeconds) bumpCooldown(data.retryAfterSeconds);
    const text = data.text || fallback;
    setCached(signature, text, 15 * 60 * 1000); // 15m
    return text;
  } catch (error) {
    console.error('Error generating history analysis:', error);
    setCached(signature, fallback, 60_000);
    return fallback;
  }
}
