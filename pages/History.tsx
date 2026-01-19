
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { generateHistoryAnalysis } from '../services/geminiService';

const History: React.FC = () => {
    const { gameHistory, transactions } = useApp();
    const [aiAnalysis, setAiAnalysis] = useState<string>('Loading analysis...');

    // Calculate overall stats
    const totalSpins = gameHistory.length;
    const totalBets = gameHistory.reduce((sum, g) => sum + g.bet, 0);
    const totalWins = gameHistory.reduce((sum, g) => sum + g.win, 0);
    const winCount = gameHistory.filter(g => g.win > 0).length;
    const lossCount = totalSpins - winCount;
    const profit = totalWins - totalBets;
    const winRate = totalSpins > 0 ? (winCount / totalSpins * 100).toFixed(1) : '0.0';
    const avgBet = totalSpins > 0 ? (totalBets / totalSpins).toFixed(2) : '0.00';
    const avgWin = winCount > 0 ? (totalWins / winCount).toFixed(2) : '0.00';

    const analysisSignature = useMemo(() => {
        // Only changes when stats materially change.
        return `${totalSpins}:${Math.round(totalBets)}:${Math.round(totalWins)}:${Math.round(profit)}:${transactions.length}`;
    }, [totalSpins, totalBets, totalWins, profit, transactions.length]);

    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setTimeout> | undefined;

        const loadAnalysis = async () => {
            try {
                const analysis = await generateHistoryAnalysis(gameHistory, transactions);
                if (!cancelled) setAiAnalysis(analysis);
            } catch {
                if (!cancelled) setAiAnalysis('AI analysis is temporarily unavailable.');
            }
        };

        if (gameHistory.length === 0) {
            setAiAnalysis('No history yet—start spinning to see your analysis!');
            return;
        }

        // Debounce to avoid firing multiple requests during rapid state changes.
        timer = setTimeout(loadAnalysis, 600);

        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, [analysisSignature]);

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 animate-fade-in">
            <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-6">Activity History</h1>

            {/* Overall Stats Section */}
            <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                    <span>📊</span> Overall Stats
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">{totalSpins}</div>
                        <div className="text-xs text-gray-500 uppercase">Total Spins</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{totalWins.toFixed(2)}</div>
                        <div className="text-xs text-gray-500 uppercase">Total Wins</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">{totalBets.toFixed(2)}</div>
                        <div className="text-xs text-gray-500 uppercase">Total Bets</div>
                    </div>
                    <div className="text-center">
                        <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{profit.toFixed(2)}</div>
                        <div className="text-xs text-gray-500 uppercase">Net Profit</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{winRate}%</div>
                        <div className="text-xs text-gray-500 uppercase">Win Rate</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">{avgBet}</div>
                        <div className="text-xs text-gray-500 uppercase">Avg Bet</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{avgWin}</div>
                        <div className="text-xs text-gray-500 uppercase">Avg Win</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-400">{winCount} / {lossCount}</div>
                        <div className="text-xs text-gray-500 uppercase">Wins / Losses</div>
                    </div>
                </div>
            </section>

            {/* AI Analysis Section */}
            <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                    <span>🤖</span> AI Analysis
                </h2>
                <p className="text-gray-300 italic">{aiAnalysis}</p>
            </section>

            {/* Transactions Section */}
            <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                    <span>💳</span> Transactions
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="py-2 text-xs text-gray-500 uppercase">Date</th>
                                <th className="py-2 text-xs text-gray-500 uppercase">Type</th>
                                <th className="py-2 text-xs text-gray-500 uppercase">Method</th>
                                <th className="py-2 text-xs text-gray-500 uppercase text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {transactions.length === 0 ? (
                                <tr><td colSpan={4} className="py-4 text-center text-gray-600 italic">No transactions yet.</td></tr>
                            ) : (
                                transactions.map(tx => (
                                    <tr key={tx.id} className="border-b border-gray-800/50 hover:bg-white/5">
                                        <td className="py-3 text-gray-400">{new Date(tx.timestamp).toLocaleDateString()}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                                tx.type === 'DEPOSIT' ? 'bg-green-900/30 text-green-400' : 
                                                tx.type === 'BONUS' ? 'bg-purple-900/30 text-purple-400' : 'bg-red-900/30 text-red-400'
                                            }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="py-3 text-white">{tx.method}</td>
                                        <td className={`py-3 text-right font-mono font-bold ${tx.type === 'WITHDRAWAL' ? 'text-red-400' : 'text-green-400'}`}>
                                            {tx.type === 'WITHDRAWAL' ? '-' : '+'}{tx.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Game History Section */}
            <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
                 <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                    <span>🎰</span> Recent Spins
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="py-2 text-xs text-gray-500 uppercase">Time</th>
                                <th className="py-2 text-xs text-gray-500 uppercase">Bet</th>
                                <th className="py-2 text-xs text-gray-500 uppercase">Result</th>
                                <th className="py-2 text-xs text-gray-500 uppercase text-right">Win</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {gameHistory.length === 0 ? (
                                <tr><td colSpan={4} className="py-4 text-center text-gray-600 italic">No spins yet.</td></tr>
                            ) : (
                                gameHistory.map(game => (
                                    <tr key={game.id} className="border-b border-gray-800/50 hover:bg-white/5">
                                        <td className="py-3 text-gray-400">{new Date(game.timestamp).toLocaleTimeString()}</td>
                                        <td className="py-3 text-gray-300">{game.bet.toFixed(2)}</td>
                                        <td className="py-3 text-gray-400 text-xs">
                                            {game.win > 0 ? (
                                                <span className="text-yellow-500 font-bold">WIN</span>
                                            ) : 'LOSS'}
                                        </td>
                                        <td className={`py-3 text-right font-mono font-bold ${game.win > 0 ? 'text-yellow-400' : 'text-gray-600'}`}>
                                            {game.win.toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default History;
