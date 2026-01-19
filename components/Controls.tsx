
import React from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ControlsProps {
  betPerLine: number;
  totalBet: number;
  canSpin: boolean;
  isFreeSpin: boolean;
  isAutoSpin: boolean;
  onSpin: () => void;
  onToggleAutoSpin: () => void;
  onChangeBet: (direction: 'up' | 'down') => void;
  onShowPaytable: () => void;
}

const Controls: React.FC<ControlsProps> = ({ 
    betPerLine, 
    totalBet, 
    canSpin, 
    isFreeSpin, 
    isAutoSpin,
    onSpin, 
    onToggleAutoSpin,
    onChangeBet,
    onShowPaytable
}) => {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-black/60 p-4 rounded-xl border border-yellow-900/50 backdrop-blur-md shadow-xl">
      
      {/* Bet Controls */}
      <div className="flex items-center gap-3 bg-gray-900 p-2 rounded-lg border border-gray-800 shadow-inner">
        <button
          onClick={() => onChangeBet('down')}
          className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg text-yellow-500 font-bold text-xl disabled:opacity-50 transition-colors border border-gray-700"
          disabled={!canSpin || isFreeSpin || isAutoSpin}
        >
          -
        </button>
        <div className="text-center min-w-[80px]">
          <div className="text-[9px] uppercase text-yellow-600 font-bold tracking-widest">Line Bet</div>
          <div className="font-bold text-lg text-white">{betPerLine.toFixed(2)}</div>
        </div>
        <button
          onClick={() => onChangeBet('up')}
          className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg text-yellow-500 font-bold text-xl disabled:opacity-50 transition-colors border border-gray-700"
          disabled={!canSpin || isFreeSpin || isAutoSpin}
        >
          +
        </button>
      </div>

      {/* Total Bet Display */}
      <div className="hidden sm:block text-center flex-grow">
        <div className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-1">Total Bet</div>
        <div className="font-bold text-2xl text-yellow-400 drop-shadow-md">{totalBet.toFixed(2)}</div>
      </div>

      <div className="flex items-center gap-4">
          {/* Info Button */}
          <button 
             onClick={onShowPaytable}
             className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-yellow-600 hover:text-yellow-400 transition-colors border border-gray-700"
             title="Paytable"
          >
              <InfoIcon className="w-5 h-5" />
          </button>

          {/* Auto Spin Toggle */}
          <button
            onClick={onToggleAutoSpin}
            disabled={!canSpin && !isAutoSpin}
            className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all border
                ${isAutoSpin 
                    ? 'bg-red-900/30 border-red-600 text-red-400 hover:bg-red-900/50 animate-pulse' 
                    : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-yellow-600 hover:text-yellow-500'}
            `}
          >
            {isAutoSpin ? 'Stop Auto' : 'Auto'}
          </button>

          {/* Main Spin Button */}
          <button
            onClick={onSpin}
            disabled={(!canSpin && !isAutoSpin)}
            className={`
                w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-200 transform shadow-[0_5px_15px_rgba(0,0,0,0.5)]
                ${!canSpin && !isAutoSpin ? 'bg-gray-800 cursor-not-allowed opacity-50 grayscale border-4 border-gray-700' : 
                  isAutoSpin ? 'bg-gradient-to-br from-red-600 to-red-900 scale-95 ring-4 ring-red-500/30 border-4 border-red-500' :
                  'bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-700 hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] border-4 border-yellow-300 ring-4 ring-yellow-900/50'}
            `}
          >
            {isAutoSpin ? (
                <span className="font-black text-white text-lg tracking-widest">STOP</span>
            ) : (
                <>
                    <SpinnerIcon className={`w-10 h-10 sm:w-12 sm:h-12 ${isFreeSpin ? 'text-white animate-spin' : 'text-black'}`} />
                    <span className={`font-black text-lg sm:text-xl uppercase tracking-widest mt-1 ${isFreeSpin ? 'text-white' : 'text-black'}`}>
                        {isFreeSpin ? 'FREE' : 'SPIN'}
                    </span>
                </>
            )}
          </button>
      </div>
    </div>
  );
};

const InfoIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);

export default Controls;
