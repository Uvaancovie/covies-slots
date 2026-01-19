
import React from 'react';
import { SYMBOLS, PAYTABLE, PAYLINES } from '../core/config';
import { SymbolId } from '../types';
import SlotSymbol from './SlotSymbol';

interface PaytableModalProps {
  onClose: () => void;
}

const PaytableModal: React.FC<PaytableModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gray-900 border-2 border-yellow-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-yellow-900/50 bg-black">
          <h2 className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">
            Paytable & Rules
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-yellow-400 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-8 text-gray-300">
            {/* Features */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black p-4 rounded-xl border border-yellow-900/30 flex items-center gap-4">
                    <div className="w-16 h-16"><SlotSymbol id='W' /></div>
                    <div>
                        <div className="text-lg font-bold text-yellow-500">WILD</div>
                        <p className="text-xs text-gray-400 leading-tight">Substitutes for all symbols except Scatter.</p>
                    </div>
                </div>
                <div className="bg-black p-4 rounded-xl border border-yellow-900/30 flex items-center gap-4">
                    <div className="w-16 h-16"><SlotSymbol id='S' /></div>
                    <div>
                        <div className="text-lg font-bold text-yellow-500">SCATTER</div>
                        <p className="text-xs text-gray-400 leading-tight">3+ triggers FREE SPINS. Pays any pos.</p>
                    </div>
                </div>
            </section>

            {/* Symbol Payouts */}
            <section>
                <h3 className="text-sm font-bold text-yellow-600 uppercase tracking-widest mb-4">Payouts (x Line Bet)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(Object.keys(PAYTABLE) as SymbolId[]).map((symbolId) => {
                        const payouts = PAYTABLE[symbolId];
                        const validPayouts = payouts.map((p, i) => ({ count: i + 1, pay: p })).filter(p => p.pay > 0);
                        if (validPayouts.length === 0) return null;

                        return (
                            <div key={symbolId} className="flex flex-col items-center p-3 bg-black rounded-lg border border-gray-800">
                                <div className="w-12 h-12 mb-2"><SlotSymbol id={symbolId} /></div>
                                <div className="text-xs w-full space-y-1">
                                    {validPayouts.reverse().map((p) => (
                                        <div key={p.count} className="flex justify-between w-full px-2">
                                            <span className="text-gray-500">{p.count}x</span>
                                            <span className="font-bold text-yellow-400">{p.pay}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
            
            {/* Paylines Info */}
            <section>
                <h3 className="text-sm font-bold text-yellow-600 uppercase tracking-widest mb-2">30 Fixed Paylines</h3>
                <div className="flex flex-wrap gap-1">
                    {PAYLINES.map((_, i) => (
                        <div key={i} className="bg-gray-800 text-[10px] px-2 py-1 rounded text-gray-400 border border-gray-700">
                            {i + 1}
                        </div>
                    ))}
                </div>
            </section>

            {/* RTP Transparency */}
            <section className="bg-blue-900/20 border border-blue-800 rounded-xl p-4">
                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2">📊 RTP Transparency</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Theoretical RTP (estimated):</span>
                        <span className="text-white font-bold">~94-96%</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                        RTP (Return to Player) indicates the expected percentage of wagered money returned to players over time. 
                        A 95% RTP means for every 100 ZAR wagered, players can expect ~95 ZAR back on average.
                    </p>
                </div>
            </section>

            {/* Ethical Disclaimer */}
            <section className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4">
                <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-2">⚠️ Responsible Gaming</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                    This is a simulation for entertainment purposes only. Results use Math.random() (not cryptographically secure). 
                    The house has a statistical edge by design. Virtual currency has no real value. 
                    If this were real gambling, please gamble responsibly and set limits.
                </p>
            </section>
        </div>
        
        <div className="p-4 border-t border-yellow-900/30 bg-black text-center sticky bottom-0">
             <button 
                onClick={onClose}
                className="px-8 py-2 bg-gradient-to-b from-yellow-600 to-yellow-800 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold rounded-full text-sm uppercase tracking-widest transition-transform transform active:scale-95"
             >
                 Return to Game
             </button>
        </div>
      </div>
    </div>
  );
};

export default PaytableModal;
