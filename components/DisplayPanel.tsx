
import React, { useEffect, useState, useRef } from 'react';
import { generateLuckyStory } from '../services/geminiService';
import { SparkleIcon } from './icons/SparkleIcon';

interface DisplayPanelProps {
  balance: number;
  totalBet: number;
  lastWin: number;
  isSpinning: boolean;
  winStreak?: number;
  onOpenDeposit?: () => void;
  onShowPaytable?: () => void;
}

const DisplayPanel: React.FC<DisplayPanelProps> = ({ balance, totalBet, lastWin, isSpinning, winStreak = 0, onOpenDeposit, onShowPaytable }) => {
  const [displayedWin, setDisplayedWin] = useState(0);
  const prevBalance = useRef(balance);
  const [balanceHighlight, setBalanceHighlight] = useState(false);
  
  // AI Story State
  const [aiStory, setAiStory] = useState<string>('');
  const [loadingStory, setLoadingStory] = useState(false);
  const [showStory, setShowStory] = useState(false);

  useEffect(() => {
    if (balance !== prevBalance.current) {
        setBalanceHighlight(true);
        const t = setTimeout(() => setBalanceHighlight(false), 300);
        prevBalance.current = balance;
        return () => clearTimeout(t);
    }
  }, [balance]);

  // Generate AI story on wins
  useEffect(() => {
    if (lastWin > 0 && !isSpinning) {
      setLoadingStory(true);
      setShowStory(true);
      
      generateLuckyStory(lastWin, winStreak)
        .then(story => setAiStory(story))
        .catch(() => setAiStory("Amazing win!"))
        .finally(() => setLoadingStory(false));
    } else if (isSpinning) {
      setShowStory(false);
    }
  }, [lastWin, isSpinning, winStreak]);

  useEffect(() => {
    if (isSpinning) {
      setDisplayedWin(0);
      return;
    }
    
    if (lastWin > 0) {
      let start = 0;
      const duration = Math.min(1000, lastWin * 10); 
      const increment = lastWin / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= lastWin) {
          setDisplayedWin(lastWin);
          clearInterval(timer);
        } else {
          setDisplayedWin(start);
        }
      }, 16);
      
      return () => clearInterval(timer);
    } else {
      setDisplayedWin(0);
    }
  }, [lastWin, isSpinning]);

  return (
    <div className="mt-4 space-y-3">
        {/* Main display grid */}
        <div className="grid grid-cols-3 gap-4 text-center relative z-20">
        {/* Balance */}
        <div className={`
            bg-black p-3 rounded-lg border transition-all duration-300 relative overflow-hidden group flex flex-col justify-center items-center
            ${balanceHighlight ? 'border-yellow-400 scale-105 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'border-yellow-900/50'}
        `}>
             <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/10 to-transparent opacity-50"></div>
            
             <div className="relative z-10 w-full flex flex-col items-center">
                <div className="flex items-center justify-center w-full relative">
                    <h3 className="text-[10px] font-bold uppercase text-yellow-600 tracking-[0.2em] mb-1">Balance</h3>
                    
                    {/* Deposit Button */}
                    <button 
                        onClick={onOpenDeposit}
                        className="absolute right-0 top-0 -mt-1 -mr-1 w-5 h-5 bg-green-700 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-transform hover:scale-110 active:scale-95"
                        title="Deposit Funds"
                    >
                        +
                    </button>
                </div>
                
                <p className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
                    {balance.toFixed(2)} <span className="text-xs text-yellow-600/50">ZAR</span>
                </p>
             </div>
        </div>

        {/* Win Streak */}
        <div className={`
            bg-black p-3 rounded-lg border transition-all duration-300 relative overflow-hidden flex flex-col justify-center items-center
            ${winStreak > 1 ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'border-gray-800'}
        `}>
            <div className={`absolute inset-0 bg-gradient-to-b from-orange-900/20 to-transparent opacity-50 ${winStreak > 1 ? 'animate-pulse' : ''}`}></div>
            <h3 className="text-[10px] font-bold uppercase text-orange-500 tracking-[0.2em] mb-1 relative z-10 flex justify-center items-center gap-1">
                Streak {winStreak > 1 && <span className="animate-bounce">🔥</span>}
            </h3>
            <p className={`text-xl sm:text-2xl font-bold tracking-tight font-mono relative z-10 ${winStreak > 1 ? 'text-orange-400' : 'text-gray-600'}`}>
                {winStreak}
            </p>
        </div>

        {/* Win */}
        <div className={`
            bg-black p-3 rounded-lg border transition-all duration-300 relative overflow-hidden flex flex-col justify-center items-center
            ${lastWin > 0 && !isSpinning ? 'border-yellow-400 bg-yellow-900/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'border-yellow-900/50'}
        `}>
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/10 to-transparent opacity-50"></div>
            <h3 className="text-[10px] font-bold uppercase text-yellow-600 tracking-[0.2em] mb-1 relative z-10">Last Win</h3>
            <p className={`text-xl sm:text-2xl font-bold tracking-tight font-mono relative z-10 ${lastWin > 0 ? 'text-yellow-400 scale-110 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]' : 'text-gray-700'}`}>
                {displayedWin.toFixed(2)} <span className="text-xs opacity-50">ZAR</span>
            </p>
        </div>
    </div>

    {/* Winnings explainer (on-display) */}
    <div className="flex items-center justify-between gap-3 bg-black/60 p-3 rounded-lg border border-yellow-900/40">
      <div className="flex items-start gap-2 text-xs text-gray-200 leading-snug">
        <SparkleIcon className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-yellow-300 tracking-widest uppercase text-[10px]">How winnings work</div>
          <div className="text-gray-300">
            Total win = sum of line wins + scatter wins. Line win ≈ line bet × paytable multiplier (× bonus multiplier in Free Spins).
          </div>
          <div className="text-gray-500 mt-1">Current total bet: <span className="text-yellow-400 font-mono font-bold">{totalBet.toFixed(2)} ZAR</span> (30 lines)</div>
        </div>
      </div>

      {onShowPaytable && (
        <button
          onClick={onShowPaytable}
          className="px-3 py-1.5 rounded-md bg-yellow-500/10 hover:bg-yellow-500/15 text-yellow-300 border border-yellow-500/25 text-[10px] font-black uppercase tracking-widest transition-colors"
          title="Open paytable"
        >
          Paytable
        </button>
      )}
    </div>

    {/* AI Host Commentary */}
    {showStory && (
        <div className={`
            bg-gradient-to-r from-purple-900/90 to-indigo-900/90 p-3 rounded-lg border border-purple-500/30 
            shadow-[0_0_20px_rgba(147,51,234,0.3)] relative overflow-hidden transition-all duration-500
            ${showStory ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        `}>
            <div className="absolute inset-0 bg-purple-400/5 animate-pulse"></div>
            <div className="relative flex items-center gap-3">
                {loadingStory ? (
                    <div className="flex items-center gap-2 text-purple-300 animate-pulse flex-shrink-0">
                        <SparkleIcon className="w-5 h-5" />
                    <span className="text-sm">Generating…</span>
                    </div>
                ) : (
                    <>
                        <div className="bg-purple-500/20 p-2 rounded-full border border-purple-400/30 flex-shrink-0">
                            <SparkleIcon className="w-6 h-6 text-purple-300" />
                        </div>
                        <p className="text-sm text-white font-medium leading-tight italic flex-1">
                            "{aiStory}"
                        </p>
                    </>
                )}
            </div>
        </div>
    )}
    </div>
  );
};

export default DisplayPanel;
