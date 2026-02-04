
import { useState, useCallback, useMemo, useEffect } from 'react';
import { GAME_CONFIG, REEL_STRIPS } from '../core/config';
import { audioManager } from '../core/audio';
import { EvaluationResult, SymbolId } from '../types';
import { evaluateSpin } from '../core/evaluator';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../lib/api-config';

export const useSlotMachine = () => {
  // Use Global Context
  const { user, balance, updateBalance, addGameHistory } = useApp();

  const [reels, setReels] = useState<SymbolId[][]>(() =>
    Array(GAME_CONFIG.NUM_REELS).fill(0).map((_, i) => {
      const initialSymbols = [];
      for (let r = 0; r < GAME_CONFIG.NUM_ROWS; r++) {
        initialSymbols.push(REEL_STRIPS[i][r % REEL_STRIPS[i].length]);
      }
      return initialSymbols;
    })
  );

  const [spinningReels, setSpinningReels] = useState<boolean[]>(
    Array(GAME_CONFIG.NUM_REELS).fill(false)
  );
  const [autoSpin, setAutoSpin] = useState(false);
  const [betIndex, setBetIndex] = useState(2);
  const [lastResult, setLastResult] = useState<EvaluationResult | null>(null);
  const [winStreak, setWinStreak] = useState(0);
  const [freeSpins, setFreeSpins] = useState({ remaining: 0, multiplier: 1, totalWin: 0 });

  const betPerLine = useMemo(() => GAME_CONFIG.BET_INCREMENTS[betIndex], [betIndex]);
  const totalBet = useMemo(() => betPerLine * GAME_CONFIG.NUM_LINES, [betPerLine]);

  const isSpinning = spinningReels.some(s => s);

  const canSpin = useMemo(() => {
    return !isSpinning && (freeSpins.remaining > 0 || balance >= totalBet);
  }, [isSpinning, balance, totalBet, freeSpins.remaining]);

  // Helper to add balance (via context)
  const addBalance = useCallback((amount: number) => {
    updateBalance(amount);
    if (amount > 0) audioManager.playWin(amount);
  }, [updateBalance]);

  // Auto Spin Logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (autoSpin && !isSpinning && canSpin) {
      const delay = (lastResult && lastResult.totalWin > 0) ? 5000 : 2000;
      timer = setTimeout(() => spin(), delay);
    } else if (autoSpin && !canSpin && !isSpinning) {
      setAutoSpin(false);
    }
    return () => clearTimeout(timer);
  }, [autoSpin, isSpinning, canSpin, lastResult]);

  const spin = useCallback(async () => {
    if (!canSpin && !autoSpin) return;

    audioManager.init();
    audioManager.playSpinStart();

    setSpinningReels(Array(GAME_CONFIG.NUM_REELS).fill(true));
    setLastResult(null);

    let currentMultiplier = 1;
    let spinCost = 0;

    // Handle Costs
    if (freeSpins.remaining > 0) {
      setFreeSpins(prev => ({ ...prev, remaining: prev.remaining - 1 }));
      // Multiplier logic might need to be server-side soon too, 
      // but for now we follow the existing pattern or move it to API
    } else {
      spinCost = totalBet;
    }

    // Kick off the spin
    const spinDataPromise = (async () => {
      const token = localStorage.getItem('covies.auth.token');
      const isGuest = user?.id?.startsWith('guest_');

      if (isGuest || !token) {
        // Guest Mode: Run logic locally
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency

        const result = evaluateSpin(betPerLine, totalBet);

        // Calculate new balance locally
        // Note: Logic in 'then' block will subtract spinCost from current balance (which might be old),
        // then add the difference of newBalance - oldBalance. 
        // Actually, the logic below handles: `updateBalance(newBalance - balance)`
        // So we need to emulate what the server returns as "newBalance".
        // Server logic: newBalance = currentBalance - totalBet + totalWin
        const newBalance = (balance - spinCost) + result.totalWin;

        const finalReels: SymbolId[][] = [];
        for (let c = 0; c < GAME_CONFIG.NUM_REELS; c++) {
          const col: SymbolId[] = [];
          for (let r = 0; r < GAME_CONFIG.NUM_ROWS; r++) {
            col.push(result.grid[r][c]);
          }
          finalReels.push(col);
        }

        return { result, finalReels, newBalance };
      }

      // Valid User: Call Server
      const resp = await fetch(`${API_BASE_URL}/api/spin`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          betPerLine,
          betAmount: betPerLine,
          linesPlayed: GAME_CONFIG.NUM_LINES,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`Spin request failed: ${resp.status} ${text}`);
      }

      const data = await resp.json();
      const result: EvaluationResult | undefined = data?.round?.result ?? data?.result;
      const newBalance: number | undefined = data?.balance ?? data?.newBalance;
      if (!result) throw new Error('Spin response missing result');

      const finalReels: SymbolId[][] = [];
      for (let c = 0; c < GAME_CONFIG.NUM_REELS; c++) {
        const col: SymbolId[] = [];
        for (let r = 0; r < GAME_CONFIG.NUM_ROWS; r++) {
          col.push(result.grid[r][c]);
        }
        finalReels.push(col);
      }

      return { result, finalReels, newBalance };
    })();

    // Timings: build anticipation with staggered reel stops
    let baseDelay = 800;
    const delays: number[] = [];
    for (let i = 0; i < GAME_CONFIG.NUM_REELS; i++) {
      baseDelay += 350;
      delays.push(baseDelay);
    }

    // Stop reels on schedule; if server result isn't ready yet, keep spinning until it is.
    delays.forEach((delay, i) => {
      setTimeout(() => {
        spinDataPromise
          .then(({ result, finalReels, newBalance }) => {
            const winWithMultiplier = Number(result.totalWin || 0);

            setReels(prev => {
              const n = [...prev];
              n[i] = finalReels[i];
              return n;
            });
            setSpinningReels(prev => {
              const n = [...prev];
              n[i] = false;
              return n;
            });

            audioManager.playReelStop();

            if (i === GAME_CONFIG.NUM_REELS - 1) {
              setLastResult({ ...result, totalWin: winWithMultiplier });
              addGameHistory(spinCost, winWithMultiplier, result, freeSpins.remaining > 0, currentMultiplier);

              if (typeof newBalance === 'number') {
                updateBalance(newBalance - balance);
              }

              if (winWithMultiplier > 0) {
                audioManager.playWin(winWithMultiplier);
                setWinStreak(prev => prev + 1);

                if (freeSpins.remaining > 0) {
                  setFreeSpins(prev => ({ ...prev, totalWin: prev.totalWin + winWithMultiplier }));
                }
              } else {
                audioManager.playLoss();
                setWinStreak(0);
              }

              if (result.freeSpinsTriggered > 0) {
                setFreeSpins(prev => {
                  const newRemaining = Math.min(
                    GAME_CONFIG.FREE_SPINS_RETRIGGER_CAP,
                    prev.remaining + result.freeSpinsTriggered
                  );
                  return { ...prev, remaining: newRemaining };
                });
              }

              if (freeSpins.remaining - 1 <= 0 && result.freeSpinsTriggered === 0 && freeSpins.remaining > 0) {
                setTimeout(() => {
                  setFreeSpins({ remaining: 0, multiplier: 1, totalWin: 0 });
                }, 2000);
              }
            }
          })
          .catch((err) => {
            console.error('Spin error:', err);
            setSpinningReels(Array(GAME_CONFIG.NUM_REELS).fill(false));
          });
      }, delay);
    });

  }, [canSpin, balance, totalBet, betPerLine, freeSpins, autoSpin, updateBalance, addGameHistory]);

  const changeBet = (direction: 'up' | 'down') => {
    if (isSpinning) return;
    audioManager.playClick();
    setBetIndex(prev => {
      const newIndex = direction === 'up' ? prev + 1 : prev - 1;
      return Math.max(0, Math.min(GAME_CONFIG.BET_INCREMENTS.length - 1, newIndex));
    });
  };

  const toggleAutoSpin = () => {
    audioManager.playClick();
    setAutoSpin(prev => !prev);
  }

  return {
    reels,
    spinningReels,
    isSpinning,
    balance, // Exposed from context
    betPerLine,
    totalBet,
    lastResult,
    freeSpins,
    canSpin,
    spin,
    changeBet,
    autoSpin,
    toggleAutoSpin,
    winStreak,
    addBalance
  };
};
