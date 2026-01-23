
import React, { useState, useEffect } from 'react';
import { useSlotMachine } from '../hooks/useSlotMachine';
import Reel from './Reel';
import Controls from './Controls';
import DisplayPanel from './DisplayPanel';
import WinLineOverlay from './WinLineOverlay';
import PaytableModal from './PaytableModal';
import ResultPopup from './ResultPopup';
import { GAME_CONFIG } from '../core/config';
import { audioManager } from '../core/audio';

// NOTE: SlotMachine now accepts an onOpenDeposit prop passed from parent
interface SlotMachineProps {
    onOpenDeposit: () => void;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ onOpenDeposit }) => {
  const {
    reels,
    spinningReels,
    isSpinning,
    balance,
    betPerLine,
    totalBet,
    lastResult,
    freeSpins,
    canSpin,
    spin,
    changeBet,
    autoSpin,
    toggleAutoSpin,
    winStreak
  } = useSlotMachine();

  const [showPaytable, setShowPaytable] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);

  // Initialize audio on first user interaction with the cabinet
  const handleInteraction = () => {
      audioManager.init();
  }

  useEffect(() => {
    let popupTimer: ReturnType<typeof setTimeout>;
    let autoCloseTimer: ReturnType<typeof setTimeout>;

    if (lastResult && !isSpinning) {
      const isWin = lastResult.totalWin > 0;
      const delayBeforePopup = isWin ? 1500 : 600;
      
      popupTimer = setTimeout(() => {
        setShowResultPopup(true);
        const autoCloseDuration = isWin ? 3500 : 2000;
        
        autoCloseTimer = setTimeout(() => {
           setShowResultPopup(false);
        }, autoCloseDuration);

      }, delayBeforePopup);
    }

    return () => {
      clearTimeout(popupTimer);
      clearTimeout(autoCloseTimer);
    };
  }, [lastResult, isSpinning]);

  useEffect(() => {
      if (isSpinning) {
          setShowResultPopup(false);
      }
  }, [isSpinning]);

  const isWin = lastResult && lastResult.totalWin > 0;
  const winningPositions = lastResult?.lineWins.flatMap(w => w.positions)
    .concat(lastResult?.scatterWin?.positions || []) || [];

  return (
    <div className="relative group pb-4" onClick={handleInteraction}>
        <div className="bg-black rounded-xl sm:rounded-[2rem] p-2 sm:p-4 md:p-6 shadow-[0_0_80px_rgba(234,179,8,0.15)] border-4 sm:border-[6px] border-yellow-800 relative overflow-hidden max-w-5xl mx-auto ring-1 ring-yellow-900/50">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(20,20,20,1)_25%,transparent_25%,transparent_75%,rgba(20,20,20,1)_75%,rgba(20,20,20,1)),linear-gradient(45deg,rgba(20,20,20,1)_25%,transparent_25%,transparent_75%,rgba(20,20,20,1)_75%,rgba(20,20,20,1))] bg-[length:20px_20px] bg-[position:0_0,10px_10px] opacity-20 pointer-events-none"></div>

            <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg sm:rounded-xl p-2 sm:p-4 md:p-6 border-2 border-yellow-600/50 shadow-[inset_0_0_40px_rgba(0,0,0,1)] relative z-10">
                <div className="hidden sm:block absolute top-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-700 shadow-sm"></div>
                <div className="hidden sm:block absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-700 shadow-sm"></div>
                <div className="hidden sm:block absolute bottom-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-700 shadow-sm"></div>
                <div className="hidden sm:block absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-700 shadow-sm"></div>

                {freeSpins.remaining > 0 && (
                    <div className="absolute inset-x-4 sm:inset-x-12 -top-3 sm:-top-4 rounded-b-xl bg-gradient-to-b from-yellow-500 to-yellow-700 text-black text-center py-1 sm:py-2 text-xs sm:text-lg font-black uppercase tracking-widest z-30 shadow-[0_4px_15px_rgba(234,179,8,0.4)] border-b-2 border-yellow-300 animate-pulse">
                        <span className="mr-1 sm:mr-2">⚡</span> Free: {freeSpins.remaining} <span className="mx-1 sm:mx-2 opacity-50">|</span> {freeSpins.multiplier}x <span className="ml-1 sm:ml-2">⚡</span>
                    </div>
                )}

                <div className="flex items-center justify-center mb-2 sm:mb-4 mt-1 sm:mt-2">
                    <div className="px-3 sm:px-4 py-1 sm:py-2 rounded-xl bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-yellow-500/10 border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.08)]">
                        <div className="text-center leading-tight">
                            <div className="text-[8px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.35em] font-black text-yellow-300/80">Covies Casino</div>
                            <div className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'Impact, sans-serif' }}>
                                SLOTS
                            </div>
                            <div className="text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.25em] font-bold text-yellow-500/70">5x5 • 30 Lines</div>
                        </div>
                    </div>
                </div>

                <div className="relative mb-3 sm:mb-6 bg-black rounded-lg border-2 sm:border-4 border-yellow-900/40 shadow-[inset_0_0_20px_rgba(0,0,0,1)] overflow-hidden mt-2 sm:mt-4">
                    <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-white/5 to-transparent h-1/3 opacity-30"></div>
                    <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none opacity-80"></div>
                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none opacity-80"></div>

                    <div className="grid grid-cols-5 gap-[2px] bg-gray-900 p-[2px] relative z-10">
                        {Array.from({ length: GAME_CONFIG.NUM_REELS }).map((_, reelIndex) => (
                        <Reel
                            key={reelIndex}
                            symbols={reels[reelIndex]}
                            spinning={spinningReels[reelIndex]}
                            reelIndex={reelIndex}
                            isWin={isWin && !isSpinning}
                            winningPositions={winningPositions.filter(p => p[1] === reelIndex).map(p => p[0])}
                        />
                        ))}
                    </div>
                    
                    {!isSpinning && lastResult && (
                        <WinLineOverlay lineWins={lastResult.lineWins} />
                    )}
                    
                    {showResultPopup && lastResult && (
                        <ResultPopup 
                            result={lastResult} 
                            winStreak={winStreak}
                            onClose={() => setShowResultPopup(false)} 
                        />
                    )}
                </div>

                <DisplayPanel
                    balance={balance}
                    totalBet={totalBet}
                    lastWin={lastResult?.totalWin ?? 0}
                    isSpinning={isSpinning}
                    winStreak={winStreak}
                    onOpenDeposit={onOpenDeposit}
                    onShowPaytable={() => setShowPaytable(true)}
                />

                <Controls
                    betPerLine={betPerLine}
                    totalBet={totalBet}
                    canSpin={canSpin}
                    isFreeSpin={freeSpins.remaining > 0}
                    isAutoSpin={autoSpin}
                    onSpin={spin}
                    onToggleAutoSpin={toggleAutoSpin}
                    onChangeBet={changeBet}
                    onShowPaytable={() => setShowPaytable(true)}
                />
            </div>
        </div>
        
        {showPaytable && <PaytableModal onClose={() => setShowPaytable(false)} />}
    </div>
  );
};

export default SlotMachine;
