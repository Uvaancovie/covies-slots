
import React, { useEffect, useState } from 'react';
import { EvaluationResult, SymbolId } from '../types';
import SlotSymbol from './SlotSymbol';
import { generateLuckyStory } from '../services/geminiService';
import { SparkleIcon } from './icons/SparkleIcon';

interface ResultPopupProps {
  result: EvaluationResult;
  winStreak: number;
  onClose: () => void;
}

const SYMBOL_NAMES: Record<string, string> = {
  'W': 'Wild',
  'S': 'Scatter',
  'A': 'Cherry',
  'B': 'Lemon',
  'C': 'Melon',
  'D': 'Grape',
  '10': 'Ten',
  '9': 'Nine'
};

const PatternVisual: React.FC<{ count: number; colorClass: string; isScatter?: boolean }> = ({ count, colorClass, isScatter }) => (
    <div className="flex gap-1.5 mt-1.5" title={`${count} symbol match`}>
        {[1, 2, 3, 4, 5].map((i) => (
            <div 
                key={i}
                className={`
                    w-2.5 h-2.5 rounded-full border shadow-[0_0_4px_rgba(0,0,0,0.5)] transition-all
                    ${i <= count 
                        ? `${colorClass} scale-110` 
                        : 'bg-gray-800 border-gray-700 opacity-30'}
                `}
            />
        ))}
    </div>
);

const ResultPopup: React.FC<ResultPopupProps> = ({ result, winStreak, onClose }) => {
  const isWin = result.totalWin > 0;
  const isBigWin = isWin && result.totalWin > 50;

  // AI Story State
  const [aiStory, setAiStory] = useState<string>('');
  const [loadingStory, setLoadingStory] = useState(false);

  useEffect(() => {
    if (isWin) {
        setLoadingStory(true);
        generateLuckyStory(result.totalWin, winStreak)
            .then(story => setAiStory(story))
            .catch(() => setAiStory("Big Win!"))
            .finally(() => setLoadingStory(false));
    }
  }, [isWin, result.totalWin, winStreak]);

  return (
    <div 
        className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
    >
      <div 
        className={`
          relative flex flex-col max-h-[90%] w-full max-w-sm sm:max-w-md
          bg-black border-[3px] rounded-[2rem] shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden
          ${isWin ? 'border-yellow-500 shadow-[0_0_80px_rgba(234,179,8,0.25)]' : 'border-gray-800'}
          animate-zoom-in
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti Background for Big Wins */}
        {isBigWin && (
            <div className="absolute inset-0 pointer-events-none opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse"></div>
        )}

        {/* Decorative Background Elements */}
        {isWin && (
            <>
             <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none"></div>
             <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-yellow-900/20 to-transparent pointer-events-none"></div>
            </>
        )}

        {/* Header Section */}
        <div className="pt-8 pb-2 px-6 text-center z-10 shrink-0 bg-black/50 backdrop-blur-xl border-b border-white/5 relative">
             <h2 className={`text-5xl sm:text-6xl font-black uppercase italic tracking-tighter transform transition-all hover:scale-105
                ${isWin ? 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-700 drop-shadow-sm' : 'text-gray-600'}
            `} style={{ fontFamily: 'Impact, sans-serif' }}>
                {isWin ? (isBigWin ? 'BIG WIN!' : 'WINNER!') : 'NO WIN'}
            </h2>
            
            {isWin && (
                <div className="mt-2 text-4xl sm:text-5xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,1)] font-mono flex items-center justify-center gap-2">
                    <span className="animate-[bounce_1s_infinite]">{result.totalWin.toFixed(2)}</span>
                    <span className="text-sm text-yellow-600 font-bold self-end mb-2">ZAR</span>
                </div>
            )}
        </div>

        {/* AI Host Commentary (Sticky under header) */}
        {isWin && (
            <div className="bg-gradient-to-r from-purple-900/80 to-indigo-900/80 px-4 py-3 border-y border-white/10 shrink-0 min-h-[60px] flex items-center justify-center relative z-20">
                {loadingStory ? (
                    <div className="flex items-center gap-2 text-xs text-purple-300 animate-pulse">
                        <SparkleIcon className="w-4 h-4" />
                        <span>The host is watching...</span>
                    </div>
                ) : (
                    <div className="flex gap-3 items-start animate-slide-in-bottom">
                        <div className="bg-purple-500/20 p-1.5 rounded-full border border-purple-400/30">
                            <SparkleIcon className="w-5 h-5 text-purple-300" />
                        </div>
                        <p className="text-sm text-white font-medium leading-tight italic text-left">
                            "{aiStory}"
                        </p>
                    </div>
                )}
            </div>
        )}

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-3 custom-scrollbar z-10 bg-black/40">
            {isWin ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 justify-center mb-4">
                        <div className="h-px bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent flex-1"></div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-yellow-500/80 font-bold">Winning Combinations</span>
                        <div className="h-px bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent flex-1"></div>
                    </div>
                    
                    {/* Scatter Wins */}
                    {result.scatterWin && (
                        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-900/40 to-black border border-yellow-500/30 p-3 shadow-lg">
                            <div className="absolute inset-0 bg-yellow-400/5 group-hover:bg-yellow-400/10 transition-colors"></div>
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 p-1 bg-yellow-900/30 rounded-lg border border-yellow-500/20 shadow-inner">
                                        <SlotSymbol id="S" />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-yellow-400 font-black text-base uppercase tracking-wider drop-shadow-md">Scatter Bonus</span>
                                        <PatternVisual count={result.scatterWin.count} colorClass="bg-yellow-400 border-yellow-200 shadow-[0_0_8px_rgba(250,204,21,0.6)]" isScatter={true} />
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="font-mono font-bold text-yellow-300 text-xl drop-shadow-md">
                                        +{result.scatterWin.payout.toFixed(2)}
                                    </div>
                                    <span className="text-[10px] text-yellow-600 uppercase font-bold tracking-wider">Total Bet Win</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Line Wins */}
                    {result.lineWins.map((win, idx) => (
                        <div key={idx} className="group relative overflow-hidden rounded-xl bg-gray-900/60 border border-gray-700/50 p-3 hover:border-gray-600 transition-colors">
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 p-1 bg-black/40 rounded-lg border border-white/5 shadow-inner">
                                        <SlotSymbol id={win.symbol} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-gray-200 font-bold text-sm tracking-wide">
                                            {SYMBOL_NAMES[win.symbol as string] || win.symbol}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <PatternVisual count={win.count} colorClass="bg-green-500 border-green-300 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1.5 ml-1">Line {win.lineIndex + 1}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="font-mono font-bold text-white text-lg">
                                    +{win.payout.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-8">
                     <div className="relative">
                        <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center border-4 border-gray-800 shadow-inner">
                             <div className="w-16 h-16 opacity-20 grayscale blur-[1px]"><SlotSymbol id="S" /></div>
                        </div>
                        {/* X mark overlay */}
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-700 text-gray-500 font-bold text-xl">
                            ✕
                        </div>
                     </div>
                     
                     <div className="space-y-4 max-w-[80%] mx-auto">
                        <div>
                            <p className="text-gray-300 font-bold text-lg mb-1">So Close!</p>
                            <p className="text-xs text-gray-500 font-medium">
                                To win, land <span className="text-gray-400 font-bold">3 or more</span> matching symbols on a valid payline.
                            </p>
                        </div>
                        
                        <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                             <p className="text-[10px] text-yellow-600/80 font-bold uppercase tracking-wider mb-2">Winning Pattern</p>
                             <div className="flex justify-center gap-1 opacity-80">
                                 <div className="w-3 h-3 rounded-full bg-green-500 border border-green-300 shadow-sm"></div>
                                 <div className="w-3 h-3 rounded-full bg-green-500 border border-green-300 shadow-sm"></div>
                                 <div className="w-3 h-3 rounded-full bg-green-500 border border-green-300 shadow-sm"></div>
                                 <div className="w-3 h-3 rounded-full bg-gray-700 border border-gray-600"></div>
                                 <div className="w-3 h-3 rounded-full bg-gray-700 border border-gray-600"></div>
                             </div>
                             <p className="text-[9px] text-gray-600 mt-2">Left to Right</p>
                        </div>
                     </div>
                </div>
            )}
        </div>

        {/* Footer Action */}
        <div className="p-6 pt-4 z-10 shrink-0 bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/5">
            <button 
                onClick={onClose}
                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] shadow-lg transform transition-all active:scale-95 duration-100 group
                    ${isWin 
                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-800 text-black hover:from-yellow-500 hover:to-yellow-700 shadow-yellow-900/30' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'}
                `}
            >
                <span className="relative z-10">{isWin ? 'Collect Winnings' : 'Spin Again'}</span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default ResultPopup;
