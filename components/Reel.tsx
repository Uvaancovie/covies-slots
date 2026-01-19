
import React, { useMemo } from 'react';
import { REEL_STRIPS, GAME_CONFIG } from '../core/config';
import { SymbolId } from '../types';
import SlotSymbol from './SlotSymbol';

interface ReelProps {
  symbols: SymbolId[];
  spinning: boolean;
  reelIndex: number;
  isWin: boolean;
  winningPositions: number[];
}

const Reel: React.FC<ReelProps> = ({ symbols, spinning, reelIndex, isWin, winningPositions }) => {
  // Create a long strip for smooth animation. 
  // We repeat the base strip 4 times.
  const reelStrip = useMemo(() => {
    const baseStrip = REEL_STRIPS[reelIndex];
    return [...baseStrip, ...baseStrip, ...baseStrip, ...baseStrip];
  }, [reelIndex]);

  // Find exact stop index
  const stopIndex = useMemo(() => {
     const baseStrip = REEL_STRIPS[reelIndex];
     const baseLen = baseStrip.length;
     const matchIndex = baseStrip.findIndex((_, i) => {
         for(let r=0; r<symbols.length; r++) {
             if (baseStrip[(i + r) % baseLen] !== symbols[r]) return false;
         }
         return true;
     });
     const safeIndex = matchIndex === -1 ? 0 : matchIndex;
     return baseLen + safeIndex;
  }, [symbols, reelIndex]);

  // Layout Calculations
  const stripHeightPercent = (reelStrip.length / GAME_CONFIG.NUM_ROWS) * 100;
  const symbolHeightPercent = 100 / reelStrip.length;
  const stopTranslatePercent = (stopIndex / reelStrip.length) * 100;
  const spinTranslatePercent = ((reelStrip.length - GAME_CONFIG.NUM_ROWS - 5) / reelStrip.length) * 100;

  return (
    <div className="h-80 sm:h-96 md:h-[28rem] overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black relative group border-r border-gray-800 last:border-0 rounded-sm">
      {/* Reel Lane styling */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-50 mix-blend-overlay"></div>
      <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_10px_30px_rgba(0,0,0,0.8),inset_0_-10px_30px_rgba(0,0,0,0.8)]"></div>
      
      {/* Reel Strip */}
      <div
        className="absolute top-0 left-0 w-full will-change-transform"
        style={{
          height: `${stripHeightPercent}%`,
          transform: `translateY(-${spinning ? spinTranslatePercent : stopTranslatePercent}%)`,
          transition: spinning ? 'none' : 'transform 1.2s cubic-bezier(0.15, 0.8, 0.3, 1)',
          filter: spinning ? 'blur(1px)' : 'none',
        }}
      >
        {reelStrip.map((symbolId, index) => {
            // Check if this specific symbol instance in the strip corresponds to a visible winning row.
            // This is a bit tricky because we have a long strip. 
            // We only care about highlighting the *visible* symbols when the reel is stopped.
            // Since this component renders the *entire* strip, we only highlight if !spinning.
            
            // However, visually matching the index in the strip to the visible row index [0..4] is hard 
            // inside the map loop because of the translation.
            
            // Instead, we render the symbols normally here.
            return (
                <div 
                    key={index} 
                    className="w-full flex items-center justify-center p-0 relative box-border"
                    style={{ height: `${symbolHeightPercent}%` }}
                >
                    <div className="w-[85%] h-[85%] flex items-center justify-center">
                        <SlotSymbol id={symbolId} />
                    </div>
                    <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-white/5"></div>
                </div>
            );
        })}
      </div>

      {/* 
         Winning Highlight Overlay (The "Gold Squares") 
         We render this separated from the strip so it sits exactly on the visible grid coordinates.
         This ensures perfect alignment regardless of the strip animation offset when stopped.
      */}
      {!spinning && isWin && (
        <div className="absolute inset-0 z-30 pointer-events-none">
          {symbols.map((symbolId, rowIndex) => {
            const isWinningPos = winningPositions.includes(rowIndex);
            if (!isWinningPos) return null;

            return (
              <div
                key={`win-${rowIndex}`}
                className="absolute w-full left-0 flex items-center justify-center"
                style={{ 
                    top: `${(rowIndex * (100 / GAME_CONFIG.NUM_ROWS))}%`, 
                    height: `${100 / GAME_CONFIG.NUM_ROWS}%`
                }}
              >
                 {/* Gold Square Container */}
                 <div className="relative w-[92%] h-[92%] flex items-center justify-center">
                    
                    {/* 1. The Gold Frame */}
                    <div className="absolute inset-0 border-[3px] border-yellow-400 rounded-xl shadow-[0_0_15px_rgba(250,204,21,0.8),inset_0_0_15px_rgba(250,204,21,0.4)] animate-[pulse_1s_ease-in-out_infinite] bg-yellow-500/10"></div>
                    
                    {/* 2. The Animated Symbol (Popped out) */}
                    <div className="relative z-40 w-[90%] h-[90%] animate-bounce">
                        <SlotSymbol id={symbolId} animated={true} />
                    </div>
                    
                    {/* 3. Sparkles/Particles (CSS only simplification) */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full animate-ping delay-300"></div>
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Reel;
