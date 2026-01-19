import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { computeHouseStats, getTopWinners, getProfitableUsers, computeUserStats } from '../core/analytics';

const Admin: React.FC = () => {
  const { user, allUsers, allGameHistory, allTransactions } = useApp();

  // Check admin access
  if (!user?.isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-4 animate-fade-in">
        <div className="bg-red-900/30 border border-red-600 rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-gray-400">You need admin privileges to view this page.</p>
          <p className="text-gray-500 text-sm mt-4">Login with admin@covies.casino to access admin features.</p>
        </div>
      </div>
    );
  }

  // Compute stats
  const houseStats = useMemo(() => 
    computeHouseStats(allUsers, allGameHistory, allTransactions),
    [allUsers, allGameHistory, allTransactions]
  );

  const topWinners = useMemo(() => 
    getTopWinners(allUsers, allGameHistory, allTransactions, 10),
    [allUsers, allGameHistory, allTransactions]
  );

  const profitableUsers = useMemo(() => 
    getProfitableUsers(allUsers, allGameHistory, allTransactions),
    [allUsers, allGameHistory, allTransactions]
  );

  const allUserStats = useMemo(() => 
    allUsers.map(u => computeUserStats(u.id, u.name, u.email, allGameHistory, allTransactions)),
    [allUsers, allGameHistory, allTransactions]
  );

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-6">
        🏛️ Admin Dashboard
      </h1>

      {/* House Stats Overview */}
      <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
          <span>💰</span> House Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard label="Total Spins" value={houseStats.totalSpins.toLocaleString()} />
          <StatCard label="Total Handle" value={`${houseStats.totalHandle.toFixed(2)} ZAR`} color="blue" />
          <StatCard label="Total Payouts" value={`${houseStats.totalPayouts.toFixed(2)} ZAR`} color="yellow" />
          <StatCard 
            label="House Profit (GGR)" 
            value={`${houseStats.houseProfit.toFixed(2)} ZAR`} 
            color={houseStats.houseProfit >= 0 ? 'green' : 'red'} 
          />
          <StatCard 
            label="Observed RTP" 
            value={`${houseStats.observedRTP.toFixed(2)}%`} 
            color={houseStats.observedRTP <= 96 ? 'green' : 'yellow'} 
          />
          <StatCard label="Total Deposits" value={`${houseStats.totalDeposits.toFixed(2)} ZAR`} color="green" />
          <StatCard label="Total Withdrawals" value={`${houseStats.totalWithdrawals.toFixed(2)} ZAR`} color="red" />
          <StatCard label="Total Bonuses" value={`${houseStats.totalBonuses.toFixed(2)} ZAR`} color="purple" />
          <StatCard label="Active Users" value={houseStats.activeUsers.toString()} />
          <StatCard 
            label="Profitable Users" 
            value={`${houseStats.profitableUsers} / ${allUsers.length}`} 
            color={houseStats.profitableUsers > 0 ? 'red' : 'green'} 
          />
        </div>
      </section>

      {/* RTP & Ethical Disclaimer */}
      <section className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
          <span>📊</span> RTP Transparency
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-400 text-sm mb-2">Theoretical RTP (estimated)</p>
            <p className="text-3xl font-bold text-white">~94-96%</p>
            <p className="text-xs text-gray-500 mt-1">Based on reel strip configuration and paytable</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-2">Observed RTP (actual)</p>
            <p className="text-3xl font-bold text-white">{houseStats.observedRTP.toFixed(2)}%</p>
            <p className="text-xs text-gray-500 mt-1">From {houseStats.totalSpins.toLocaleString()} spins</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
          <p className="text-yellow-400 text-xs">
            ⚠️ <strong>Ethical Notice:</strong> This is a simulation for entertainment. RNG uses Math.random() (not crypto-secure). 
            Results favor the house long-term by design. Please gamble responsibly in real-world scenarios.
          </p>
        </div>
      </section>

      {/* Profitable Users (Net Positive) */}
      {profitableUsers.length > 0 && (
        <section className="bg-black/50 border border-red-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <span>⚠️</span> Users Beating the House ({profitableUsers.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-2 text-xs text-gray-500 uppercase">User</th>
                  <th className="py-2 text-xs text-gray-500 uppercase text-right">Spins</th>
                  <th className="py-2 text-xs text-gray-500 uppercase text-right">Total Bets</th>
                  <th className="py-2 text-xs text-gray-500 uppercase text-right">Total Wins</th>
                  <th className="py-2 text-xs text-gray-500 uppercase text-right">Net Profit</th>
                  <th className="py-2 text-xs text-gray-500 uppercase text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {profitableUsers.map(stats => (
                  <tr key={stats.userId} className="border-b border-gray-800/50 hover:bg-red-900/10">
                    <td className="py-3">
                      <span className="text-white font-medium">{stats.userName}</span>
                      <span className="text-gray-500 text-xs block">{stats.email}</span>
                    </td>
                    <td className="py-3 text-right text-gray-400">{stats.totalSpins}</td>
                    <td className="py-3 text-right text-gray-400">{stats.totalBets.toFixed(2)}</td>
                    <td className="py-3 text-right text-yellow-400">{stats.totalWins.toFixed(2)}</td>
                    <td className="py-3 text-right font-bold text-green-400">+{stats.netProfit.toFixed(2)}</td>
                    <td className="py-3 text-right text-blue-400">{stats.winRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Top Winners / Losers */}
      <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
          <span>🏆</span> Leaderboard (by Net P/L)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="py-2 text-xs text-gray-500 uppercase">#</th>
                <th className="py-2 text-xs text-gray-500 uppercase">User</th>
                <th className="py-2 text-xs text-gray-500 uppercase text-right">Spins</th>
                <th className="py-2 text-xs text-gray-500 uppercase text-right">Total Bets</th>
                <th className="py-2 text-xs text-gray-500 uppercase text-right">Total Wins</th>
                <th className="py-2 text-xs text-gray-500 uppercase text-right">Net P/L</th>
                <th className="py-2 text-xs text-gray-500 uppercase text-right">Biggest Win</th>
                <th className="py-2 text-xs text-gray-500 uppercase text-right">Win Rate</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {topWinners.map((stats, index) => (
                <tr key={stats.userId} className="border-b border-gray-800/50 hover:bg-white/5">
                  <td className="py-3 text-gray-500">{index + 1}</td>
                  <td className="py-3">
                    <span className="text-white font-medium">{stats.userName}</span>
                    <span className="text-gray-500 text-xs block">{stats.email}</span>
                  </td>
                  <td className="py-3 text-right text-gray-400">{stats.totalSpins}</td>
                  <td className="py-3 text-right text-gray-400">{stats.totalBets.toFixed(2)}</td>
                  <td className="py-3 text-right text-yellow-400">{stats.totalWins.toFixed(2)}</td>
                  <td className={`py-3 text-right font-bold ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.netProfit >= 0 ? '+' : ''}{stats.netProfit.toFixed(2)}
                  </td>
                  <td className="py-3 text-right text-purple-400">{stats.biggestWin.toFixed(2)}</td>
                  <td className="py-3 text-right text-blue-400">{stats.winRate.toFixed(1)}%</td>
                </tr>
              ))}
              {topWinners.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-gray-600 italic">No users with spins yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* All Users */}
      <section className="bg-black/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
          <span>👥</span> All Users ({allUsers.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="py-2 text-xs text-gray-500 uppercase">User</th>
                <th className="py-2 text-xs text-gray-500 uppercase">Joined</th>
                <th className="py-2 text-xs text-gray-500 uppercase text-right">Balance</th>
                <th className="py-2 text-xs text-gray-500 uppercase text-right">Deposits</th>
                <th className="py-2 text-xs text-gray-500 uppercase text-right">Bonuses</th>
                <th className="py-2 text-xs text-gray-500 uppercase text-right">Spins</th>
                <th className="py-2 text-xs text-gray-500 uppercase text-right">Gaming P/L</th>
                <th className="py-2 text-xs text-gray-500 uppercase">Admin</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {allUsers.map(u => {
                const stats = allUserStats.find(s => s.userId === u.id);
                return (
                  <tr key={u.id} className="border-b border-gray-800/50 hover:bg-white/5">
                    <td className="py-3">
                      <span className="text-white font-medium">{u.name}</span>
                      <span className="text-gray-500 text-xs block">{u.email}</span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">{new Date(u.joinedDate).toLocaleDateString()}</td>
                    <td className="py-3 text-right text-yellow-400 font-mono">{u.balance.toFixed(2)}</td>
                    <td className="py-3 text-right text-green-400">{stats?.deposits.toFixed(2) || '0.00'}</td>
                    <td className="py-3 text-right text-purple-400">{stats?.bonuses.toFixed(2) || '0.00'}</td>
                    <td className="py-3 text-right text-gray-400">{stats?.totalSpins || 0}</td>
                    <td className={`py-3 text-right font-bold ${(stats?.netProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(stats?.netProfit || 0) >= 0 ? '+' : ''}{(stats?.netProfit || 0).toFixed(2)}
                    </td>
                    <td className="py-3">
                      {u.isAdmin && <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-[10px] rounded font-bold">ADMIN</span>}
                    </td>
                  </tr>
                );
              })}
              {allUsers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-gray-600 italic">No users registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

// Helper component for stat cards
const StatCard: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = 'white' }) => {
  const colorClasses: Record<string, string> = {
    white: 'text-white',
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
  };

  return (
    <div className="text-center bg-gray-900/50 p-3 rounded-lg border border-gray-800">
      <div className={`text-xl font-bold ${colorClasses[color] || 'text-white'}`}>{value}</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</div>
    </div>
  );
};

export default Admin;
