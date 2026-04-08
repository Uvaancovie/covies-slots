import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API_BASE_URL } from '../lib/api-config';
import { EvaluationResult, SymbolId } from '../types';
import { PAYTABLE, SCATTER_PAY, FREE_SPINS_AWARD, GAME_CONFIG, PAYLINES, SYMBOLS } from '../core/config';

/* ── Types ─────────────────────────────────────────────── */

type SpinApiResponse = {
  round: {
    id: string;
    betAmount: number;
    winAmount: number;
    isFreeSpin: boolean;
    multiplier: number;
    result: EvaluationResult;
    createdAt: string;
  };
  balance: number;
};

type HealthResponse = {
  serverTime: string;
  database?: { reachable?: boolean; responseTime?: string; detail?: string | null };
  performance?: { avgResponseTime?: string; requests?: number; uptime?: string; cacheSize?: number };
  memory?: { used?: number; total?: number; unit?: string };
  missingEnv?: string[];
};

type WinTier = { label: string; min: number; max: number; count: number; color: string };

const ALL_SYMBOLS: SymbolId[] = ['W', 'S', 'A', 'B', 'C', 'D', '10', '9'];
const SYMBOL_NAMES: Record<SymbolId, string> = {
  W: 'Wild', S: 'Scatter', A: 'Cherry', B: 'Lemon',
  C: 'Watermelon', D: 'Grapes', '10': 'Ten', '9': 'Nine',
};
const SYMBOL_COLORS: Record<SymbolId, string> = {
  W: '#22d3ee', S: '#eab308', A: '#ef4444', B: '#facc15',
  C: '#22c55e', D: '#a855f7', '10': '#9ca3af', '9': '#fb923c',
};

/* ── Main Component ────────────────────────────────────── */

const EngineTest: React.FC = () => {
  // Config state
  const [betPerLine, setBetPerLine] = useState(1);
  const [linesPlayed, setLinesPlayed] = useState(30);
  const [intervalMs, setIntervalMs] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'distribution' | 'paytable' | 'health'>('overview');

  // Stats state
  const [totalSpins, setTotalSpins] = useState(0);
  const [hitSpins, setHitSpins] = useState(0);
  const [totalBet, setTotalBet] = useState(0);
  const [totalWin, setTotalWin] = useState(0);
  const [totalLatency, setTotalLatency] = useState(0);
  const [maxWin, setMaxWin] = useState(0);
  const [freeSpinTriggers, setFreeSpinTriggers] = useState(0);
  const [lastRound, setLastRound] = useState<SpinApiResponse['round'] | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLatency, setHealthLatency] = useState<number | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Distribution tracking
  const [symbolCounts, setSymbolCounts] = useState<Record<SymbolId, number>>(() => {
    const init: any = {};
    ALL_SYMBOLS.forEach(s => init[s] = 0);
    return init;
  });
  const [winTiers, setWinTiers] = useState<WinTier[]>([
    { label: '0x (Loss)', min: 0, max: 0, count: 0, color: '#6b7280' },
    { label: '0.1x–1x', min: 0.01, max: 1, count: 0, color: '#3b82f6' },
    { label: '1x–5x', min: 1.01, max: 5, count: 0, color: '#22c55e' },
    { label: '5x–20x', min: 5.01, max: 20, count: 0, color: '#eab308' },
    { label: '20x–50x', min: 20.01, max: 50, count: 0, color: '#f97316' },
    { label: '50x+', min: 50.01, max: Infinity, count: 0, color: '#ef4444' },
  ]);
  const [lineWinCounts, setLineWinCounts] = useState<Record<number, number>>({});
  const [scatterHits, setScatterHits] = useState<number[]>([0, 0, 0, 0, 0, 0]); // 0-5 scatters

  // RTP convergence tracking
  const [rtpHistory, setRtpHistory] = useState<number[]>([]);
  const rtpCanvasRef = useRef<HTMLCanvasElement>(null);
  const runGuard = useRef(false);

  /* ── Spin Logic ──────────────────────────────────────── */

  const runSingleSpin = useCallback(async () => {
    if (runGuard.current) return;
    runGuard.current = true;
    setIsSpinning(true);
    setLastError(null);

    const spinStart = performance.now();
    const betAmount = betPerLine * linesPlayed;

    try {
      const response = await fetch(`${API_BASE_URL}/api/spin-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betPerLine, linesPlayed, betAmount }),
      });

      const latency = performance.now() - spinStart;
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Spin request failed' }));
        throw new Error(errorBody.error || 'Spin request failed');
      }

      const data: SpinApiResponse = await response.json();
      const r = data.round;
      const winMultiple = r.betAmount > 0 ? r.winAmount / r.betAmount : 0;

      setLastRound(r);
      setTotalSpins(p => p + 1);
      setTotalBet(p => p + r.betAmount);
      setTotalWin(p => p + r.winAmount);
      setTotalLatency(p => p + latency);
      setMaxWin(p => Math.max(p, r.winAmount));
      if (r.winAmount > 0) setHitSpins(p => p + 1);
      if (r.result.freeSpinsTriggered > 0) setFreeSpinTriggers(p => p + 1);

      // RTP history
      setRtpHistory(prev => {
        const newTotalBet = prev.length > 0 ? totalBet + r.betAmount : r.betAmount;
        const newTotalWin2 = prev.length > 0 ? totalWin + r.winAmount : r.winAmount;
        const rtp = newTotalBet > 0 ? (newTotalWin2 / newTotalBet) * 100 : 0;
        const next = [...prev, rtp];
        if (next.length > 500) next.shift();
        return next;
      });

      // Symbol distribution
      setSymbolCounts(prev => {
        const next = { ...prev };
        r.result.grid.forEach(row => row.forEach(sym => { next[sym] = (next[sym] || 0) + 1; }));
        return next;
      });

      // Win tier distribution
      setWinTiers(prev => prev.map(tier => {
        if (winMultiple === 0 && tier.max === 0) return { ...tier, count: tier.count + 1 };
        if (winMultiple >= tier.min && winMultiple <= tier.max) return { ...tier, count: tier.count + 1 };
        return tier;
      }));

      // Line win frequency
      setLineWinCounts(prev => {
        const count = r.result.lineWins.length;
        return { ...prev, [count]: (prev[count] || 0) + 1 };
      });

      // Scatter tracking
      const scatCount = r.result.grid.flat().filter(s => s === 'S').length;
      setScatterHits(prev => {
        const next = [...prev];
        if (scatCount < next.length) next[scatCount]++;
        return next;
      });

    } catch (error: any) {
      setLastError(error?.message || 'Unknown spin error');
      setIsRunning(false);
    } finally {
      runGuard.current = false;
      setIsSpinning(false);
    }
  }, [betPerLine, linesPlayed, totalBet, totalWin]);

  /* ── Health Check ────────────────────────────────────── */

  const fetchHealth = useCallback(async () => {
    setHealthError(null);
    const start = performance.now();
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      setHealthLatency(performance.now() - start);
      if (!response.ok) throw new Error('Health endpoint returned non-200');
      setHealth(await response.json());
    } catch (error: any) {
      setHealthError(error?.message || 'Failed to fetch health');
    }
  }, []);

  useEffect(() => { fetchHealth(); const t = setInterval(fetchHealth, 8000); return () => clearInterval(t); }, [fetchHealth]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => { runSingleSpin(); }, Math.max(100, intervalMs));
    return () => clearInterval(interval);
  }, [isRunning, intervalMs, runSingleSpin]);

  /* ── RTP Chart ───────────────────────────────────────── */

  useEffect(() => {
    const canvas = rtpCanvasRef.current;
    if (!canvas || rtpHistory.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width, h = rect.height;

    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Target RTP line at 96%
    const targetRTP = 96;
    const minRTP = Math.min(...rtpHistory, targetRTP - 10);
    const maxRTP = Math.max(...rtpHistory, targetRTP + 10);
    const range = maxRTP - minRTP || 1;

    const targetY = h - ((targetRTP - minRTP) / range) * h;
    ctx.strokeStyle = 'rgba(234,179,8,0.5)';
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, targetY); ctx.lineTo(w, targetY); ctx.stroke();
    ctx.setLineDash([]);

    // Label
    ctx.fillStyle = 'rgba(234,179,8,0.7)';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`Target: ${targetRTP}%`, 8, targetY - 6);

    // RTP line
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(0.5, '#8b5cf6');
    grad.addColorStop(1, '#22d3ee');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    rtpHistory.forEach((rtp, i) => {
      const x = (i / (rtpHistory.length - 1)) * w;
      const y = h - ((rtp - minRTP) / range) * h;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Current value label
    const lastRtp = rtpHistory[rtpHistory.length - 1];
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(`${lastRtp.toFixed(2)}%`, w - 60, 16);

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(`${maxRTP.toFixed(0)}%`, 4, 12);
    ctx.fillText(`${minRTP.toFixed(0)}%`, 4, h - 4);
  }, [rtpHistory]);

  /* ── Computed Stats ──────────────────────────────────── */

  const observedRtp = useMemo(() => totalBet > 0 ? (totalWin / totalBet) * 100 : 0, [totalBet, totalWin]);
  const hitRate = useMemo(() => totalSpins > 0 ? (hitSpins / totalSpins) * 100 : 0, [hitSpins, totalSpins]);
  const avgLatency = useMemo(() => totalSpins > 0 ? totalLatency / totalSpins : 0, [totalLatency, totalSpins]);
  const houseEdge = useMemo(() => 100 - observedRtp, [observedRtp]);
  const totalSymbolsSeen = useMemo(() => (Object.values(symbolCounts) as number[]).reduce((a, b) => a + b, 0), [symbolCounts]);
  const volatilityIndex = useMemo(() => {
    if (totalSpins < 10) return 'N/A';
    const avgWin = totalWin / totalSpins;
    const bigWinRatio = maxWin / (betPerLine * linesPlayed);
    if (bigWinRatio > 100) return 'Very High';
    if (bigWinRatio > 50) return 'High';
    if (bigWinRatio > 20) return 'Medium-High';
    if (bigWinRatio > 5) return 'Medium';
    return 'Low';
  }, [totalSpins, totalWin, maxWin, betPerLine, linesPlayed]);

  const freeSpinFreq = useMemo(() => {
    if (freeSpinTriggers === 0) return 'N/A';
    return `1 in ${Math.round(totalSpins / freeSpinTriggers)}`;
  }, [totalSpins, freeSpinTriggers]);

  /* ── Reset ───────────────────────────────────────────── */

  const resetStats = () => {
    setIsRunning(false);
    setTotalSpins(0); setHitSpins(0); setTotalBet(0); setTotalWin(0);
    setTotalLatency(0); setMaxWin(0); setFreeSpinTriggers(0);
    setLastRound(null); setLastError(null); setRtpHistory([]);
    const init: any = {}; ALL_SYMBOLS.forEach(s => init[s] = 0); setSymbolCounts(init);
    setWinTiers(prev => prev.map(t => ({ ...t, count: 0 })));
    setLineWinCounts({}); setScatterHits([0, 0, 0, 0, 0, 0]);
  };

  /* ── Render ──────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#0f172a_0%,_#020617_50%,_#000_100%)] text-white">
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');`}</style>

      {/* ── Header ─────────────────────────────────────── */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 flex items-center justify-center text-black font-black text-lg shadow-lg shadow-amber-500/20" style={{ fontFamily: 'Inter' }}>C</div>
            <div>
              <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Inter' }}>Covies Slots — Engine Certification Suite</h1>
              <p className="text-[11px] text-gray-500 tracking-wide">RNG Verification • Mathematical Model Audit • GLI-11 Compliance Ready</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${isRunning ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`}></span>
              {isRunning ? 'SIMULATION ACTIVE' : 'IDLE'}
            </div>
            <a href="/" className="text-xs text-gray-500 hover:text-white transition px-3 py-1.5 rounded-lg border border-gray-800 hover:border-gray-600">← Back to Game</a>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>

        {/* ── Control Panel ─────────────────────────────── */}
        <section className="bg-gradient-to-r from-gray-900/80 to-gray-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
            <InputField label="Bet Per Line (ZAR)" value={betPerLine} onChange={v => setBetPerLine(Math.max(0.1, v))} min={0.1} step={0.1} />
            <InputField label="Active Paylines" value={linesPlayed} onChange={v => setLinesPlayed(Math.min(30, Math.max(1, v)))} min={1} max={30} step={1} />
            <InputField label="Interval (ms)" value={intervalMs} onChange={v => setIntervalMs(Math.max(100, v))} min={100} step={50} />
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Total Bet / Spin</span>
              <div className="bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-white font-bold text-center" style={{ fontFamily: 'JetBrains Mono' }}>
                {(betPerLine * linesPlayed).toFixed(2)} ZAR
              </div>
            </div>
            <button onClick={() => setIsRunning(p => !p)}
              className={`px-4 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-300 ${isRunning ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/30' : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-600/30'}`}>
              {isRunning ? '■ Stop' : '▶ Start Simulation'}
            </button>
            <div className="flex gap-2">
              <button onClick={runSingleSpin} disabled={isSpinning}
                className="flex-1 px-3 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider bg-blue-600 hover:bg-blue-500 disabled:opacity-40 transition shadow-lg shadow-blue-600/20">
                Single Spin
              </button>
              <button onClick={resetStats}
                className="flex-1 px-3 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-wider bg-gray-800 hover:bg-gray-700 border border-white/5 transition">
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* ── Error Banner ──────────────────────────────── */}
        {(lastError || healthError) && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm flex items-center gap-2">
            <span className="text-red-400">⚠</span>
            {lastError && <span>Spin: {lastError}</span>}
            {healthError && <span>Health: {healthError}</span>}
          </div>
        )}

        {/* ── KPI Cards ────────────────────────────────── */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Total Spins" value={totalSpins.toLocaleString()} icon="🎰" />
          <KpiCard label="Observed RTP" value={`${observedRtp.toFixed(2)}%`} icon="📊"
            accent={observedRtp > 94 && observedRtp < 98 ? '#22c55e' : observedRtp === 0 ? '#6b7280' : '#f59e0b'}
            sub={`House Edge: ${houseEdge.toFixed(2)}%`} />
          <KpiCard label="Hit Frequency" value={`${hitRate.toFixed(1)}%`} icon="🎯"
            sub={`${hitSpins} / ${totalSpins} wins`} />
          <KpiCard label="Volatility" value={volatilityIndex} icon="📈"
            accent={volatilityIndex === 'High' || volatilityIndex === 'Very High' ? '#ef4444' : '#3b82f6'} />
          <KpiCard label="Max Win" value={`${maxWin.toFixed(2)}`} icon="🏆"
            accent="#a855f7" sub={`${(maxWin / Math.max(betPerLine * linesPlayed, 0.01)).toFixed(1)}x bet`} />
          <KpiCard label="Free Spin Freq" value={freeSpinFreq} icon="🌟"
            sub={`${freeSpinTriggers} triggers`} />
        </section>

        {/* ── Tabs ──────────────────────────────────────── */}
        <div className="flex gap-1 bg-black/40 rounded-xl p-1 border border-white/5 w-fit">
          {(['overview', 'distribution', 'paytable', 'health'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              {tab === 'overview' ? '📊 Overview' : tab === 'distribution' ? '📈 Distribution' : tab === 'paytable' ? '💎 Paytable' : '🖥 Health'}
            </button>
          ))}
        </div>

        {/* ── Tab: Overview ─────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-4">
            {/* RTP Convergence Chart */}
            <div className="lg:col-span-2 bg-black/40 border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">RTP Convergence</h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">Observed RTP trending toward theoretical target over {totalSpins.toLocaleString()} spins</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black" style={{ fontFamily: 'JetBrains Mono', color: observedRtp > 94 && observedRtp < 98 ? '#22c55e' : '#f59e0b' }}>
                    {observedRtp.toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-gray-500">CURRENT RTP</div>
                </div>
              </div>
              <canvas ref={rtpCanvasRef} className="w-full rounded-xl bg-black/40" style={{ height: 220 }} />
              <div className="flex items-center gap-6 mt-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded"></span> Observed RTP</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-yellow-500/50 rounded" style={{ borderTop: '1px dashed #eab308' }}></span> Target (96%)</span>
              </div>
            </div>

            {/* Last Spin Grid */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Last Spin Result</h2>
              {!lastRound ? (
                <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No spins yet — press Start</div>
              ) : (
                <div className="space-y-3">
                  {/* 5x5 Grid Visualization */}
                  <div className="grid grid-cols-5 gap-1">
                    {lastRound.result.grid.map((row, ri) =>
                      row.map((sym, ci) => {
                        const isWinning = lastRound.result.lineWins.some(lw => lw.positions.some(p => p[0] === ri && p[1] === ci))
                          || (lastRound.result.scatterWin?.positions.some(p => p[0] === ri && p[1] === ci));
                        return (
                          <div key={`${ri}-${ci}`}
                            className={`aspect-square rounded-lg flex items-center justify-center text-xs font-black transition-all duration-300 ${isWinning ? 'bg-yellow-500/20 border-2 border-yellow-400 shadow-lg shadow-yellow-500/20 scale-105' : 'bg-white/5 border border-white/10'}`}
                            style={{ color: SYMBOL_COLORS[sym] }}>
                            {SYMBOLS[sym]?.display || sym}
                          </div>
                        );
                      })
                    )}
                  </div>
                  {/* Round Info */}
                  <div className="space-y-1.5 text-xs" style={{ fontFamily: 'JetBrains Mono' }}>
                    <InfoRow label="Round ID" value={lastRound.id} />
                    <InfoRow label="Bet" value={`${lastRound.betAmount.toFixed(2)} ZAR`} />
                    <InfoRow label="Win" value={`${lastRound.winAmount.toFixed(2)} ZAR`} accent={lastRound.winAmount > 0 ? '#22c55e' : undefined} />
                    <InfoRow label="Win Lines" value={`${lastRound.result.lineWins.length}`} />
                    <InfoRow label="Scatter" value={lastRound.result.scatterWin ? `${lastRound.result.scatterWin.count} hits` : 'None'} />
                    <InfoRow label="Free Spins" value={`${lastRound.result.freeSpinsTriggered}`} accent={lastRound.result.freeSpinsTriggered > 0 ? '#eab308' : undefined} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Distribution ─────────────────────────── */}
        {activeTab === 'distribution' && (
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Symbol Distribution */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Symbol Distribution</h2>
              <div className="space-y-2.5">
                {ALL_SYMBOLS.map(sym => {
                  const count = symbolCounts[sym];
                  const pct = totalSymbolsSeen > 0 ? (count / totalSymbolsSeen) * 100 : 0;
                  return (
                    <div key={sym} className="flex items-center gap-3">
                      <div className="w-8 text-center text-lg">{SYMBOLS[sym]?.display}</div>
                      <div className="w-20 text-xs text-gray-400 truncate">{SYMBOL_NAMES[sym]}</div>
                      <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden relative">
                        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${Math.min(pct * 3, 100)}%`, backgroundColor: SYMBOL_COLORS[sym], opacity: 0.7 }} />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/80" style={{ fontFamily: 'JetBrains Mono' }}>
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-16 text-right text-[11px] text-gray-500" style={{ fontFamily: 'JetBrains Mono' }}>{count.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Win Tier Distribution */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Win Tier Breakdown</h2>
              <div className="space-y-2.5">
                {winTiers.map((tier, i) => {
                  const pct = totalSpins > 0 ? (tier.count / totalSpins) * 100 : 0;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-20 text-xs text-gray-400 truncate">{tier.label}</div>
                      <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden relative">
                        <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: tier.color, opacity: 0.7 }} />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/80" style={{ fontFamily: 'JetBrains Mono' }}>
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-16 text-right text-[11px] text-gray-500" style={{ fontFamily: 'JetBrains Mono' }}>{tier.count.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>

              {/* Scatter Frequency */}
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mt-6 mb-3">Scatter Frequency</h3>
              <div className="grid grid-cols-6 gap-2">
                {scatterHits.map((count, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-gray-500">{i}×S</div>
                    <div className="text-sm font-bold" style={{ fontFamily: 'JetBrains Mono', color: i >= 3 ? '#eab308' : '#fff' }}>{count}</div>
                    <div className="text-[9px] text-gray-600">{totalSpins > 0 ? ((count / totalSpins) * 100).toFixed(1) : 0}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Paytable ─────────────────────────────── */}
        {activeTab === 'paytable' && (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Line Pay Multipliers (per line bet)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ fontFamily: 'JetBrains Mono' }}>
                  <thead>
                    <tr className="text-[10px] text-gray-500 uppercase tracking-wider">
                      <th className="text-left py-2 px-2">Symbol</th>
                      <th className="text-center py-2">×3</th>
                      <th className="text-center py-2">×4</th>
                      <th className="text-center py-2">×5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_SYMBOLS.filter(s => s !== 'S').map(sym => (
                      <tr key={sym} className="border-t border-white/5 hover:bg-white/5 transition">
                        <td className="py-2.5 px-2 flex items-center gap-2">
                          <span className="text-lg">{SYMBOLS[sym]?.display}</span>
                          <span className="text-gray-400 text-xs">{SYMBOL_NAMES[sym]}</span>
                        </td>
                        <td className="text-center py-2" style={{ color: PAYTABLE[sym][2] > 0 ? '#fff' : '#4b5563' }}>{PAYTABLE[sym][2]}×</td>
                        <td className="text-center py-2" style={{ color: '#22c55e' }}>{PAYTABLE[sym][3]}×</td>
                        <td className="text-center py-2" style={{ color: '#eab308' }}>{PAYTABLE[sym][4]}×</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Scatter Pays (× Total Bet)</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[3, 4, 5].map(count => (
                    <div key={count} className="bg-gradient-to-br from-yellow-500/10 to-amber-600/5 border border-yellow-500/20 rounded-xl p-3 text-center">
                      <div className="text-lg mb-1">{'⭐'.repeat(count)}</div>
                      <div className="text-xs text-gray-400">{count}× Scatter</div>
                      <div className="text-xl font-black text-yellow-400 mt-1">{SCATTER_PAY[count - 1]}×</div>
                      <div className="text-[10px] text-emerald-400 mt-1">+{FREE_SPINS_AWARD[count - 1]} Free Spins</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Game Configuration</h2>
                <div className="space-y-2 text-xs" style={{ fontFamily: 'JetBrains Mono' }}>
                  <InfoRow label="Grid Layout" value={`${GAME_CONFIG.NUM_REELS} Reels × ${GAME_CONFIG.NUM_ROWS} Rows`} />
                  <InfoRow label="Paylines" value={`${PAYLINES.length} Fixed Lines`} />
                  <InfoRow label="Min Bet" value={`${GAME_CONFIG.MIN_BET} ZAR`} />
                  <InfoRow label="Max Bet" value={`${GAME_CONFIG.MAX_BET} ZAR per line`} />
                  <InfoRow label="Reel Strips" value={`${5} strips, ~20 stops each`} />
                  <InfoRow label="Wild" value="Substitutes all except Scatter" />
                  <InfoRow label="Scatter" value="Pays anywhere, triggers Free Spins" />
                  <InfoRow label="Free Spin Cap" value={`${GAME_CONFIG.FREE_SPINS_RETRIGGER_CAP} max`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Health ───────────────────────────────── */}
        {activeTab === 'health' && (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Backend Infrastructure</h2>
              {!health ? (
                <p className="text-sm text-gray-600">Connecting…</p>
              ) : (
                <div className="space-y-2 text-xs" style={{ fontFamily: 'JetBrains Mono' }}>
                  <InfoRow label="Server Time" value={health.serverTime} />
                  <InfoRow label="DB Reachable" value={health.database?.reachable ? '✔ Connected' : '✘ Disconnected'}
                    accent={health.database?.reachable ? '#22c55e' : '#ef4444'} />
                  <InfoRow label="DB Latency" value={health.database?.responseTime || '-'} />
                  <InfoRow label="Health Latency" value={healthLatency ? `${healthLatency.toFixed(0)}ms` : '-'} />
                  <InfoRow label="Avg API Response" value={health.performance?.avgResponseTime || '-'} />
                  <InfoRow label="Request Count" value={`${health.performance?.requests || 0}`} />
                  <InfoRow label="Uptime" value={health.performance?.uptime || '-'} />
                  <InfoRow label="Cache Size" value={`${health.performance?.cacheSize ?? 0}`} />
                  <InfoRow label="Memory" value={`${health.memory?.used?.toFixed(1) ?? '-'} / ${health.memory?.total?.toFixed(1) ?? '-'} ${health.memory?.unit || 'MB'}`} />
                  {health.missingEnv && health.missingEnv.length > 0 && (
                    <InfoRow label="Missing Env" value={health.missingEnv.join(', ')} accent="#ef4444" />
                  )}
                </div>
              )}
            </div>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Spin Performance</h2>
              <div className="space-y-2 text-xs" style={{ fontFamily: 'JetBrains Mono' }}>
                <InfoRow label="Avg Spin Latency" value={`${avgLatency.toFixed(1)}ms`}
                  accent={avgLatency < 200 ? '#22c55e' : avgLatency < 500 ? '#eab308' : '#ef4444'} />
                <InfoRow label="Total Spins Processed" value={totalSpins.toLocaleString()} />
                <InfoRow label="Total Wagered" value={`${totalBet.toFixed(2)} ZAR`} />
                <InfoRow label="Total Returned" value={`${totalWin.toFixed(2)} ZAR`} />
                <InfoRow label="House Profit" value={`${(totalBet - totalWin).toFixed(2)} ZAR`}
                  accent={(totalBet - totalWin) >= 0 ? '#22c55e' : '#ef4444'} />
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ───────────────────────────────────── */}
        <footer className="text-center py-6 border-t border-white/5 mt-8">
          <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">
            Covies Slots Engine Certification Suite v2.0 — For Authorized Testing Only
          </p>
          <p className="text-[10px] text-gray-700 mt-1">
            RNG: Math.random() (Demo) • Production: CSPRNG via crypto.getRandomValues()
          </p>
        </footer>
      </div>
    </div>
  );
};

/* ── Sub Components ──────────────────────────────────── */

const InputField: React.FC<{ label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }> = ({ label, value, onChange, min, max, step }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{label}</span>
    <input type="number" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value) || min || 0)}
      className="bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-amber-500/50 focus:outline-none transition"
      style={{ fontFamily: 'JetBrains Mono' }} />
  </div>
);

const KpiCard: React.FC<{ label: string; value: string; icon: string; accent?: string; sub?: string }> = ({ label, value, icon, accent = '#fff', sub }) => (
  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all group">
    <div className="flex items-center justify-between mb-2">
      <span className="text-lg">{icon}</span>
      <span className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">{label}</span>
    </div>
    <div className="text-2xl font-black tracking-tight" style={{ fontFamily: 'JetBrains Mono', color: accent }}>{value}</div>
    {sub && <div className="text-[10px] text-gray-500 mt-1">{sub}</div>}
  </div>
);

const InfoRow: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium" style={{ color: accent || '#e5e7eb' }}>{value}</span>
  </div>
);

export default EngineTest;
