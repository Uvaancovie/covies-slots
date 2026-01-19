import { GameHistoryItem, Transaction, UserProfile, UserStats, HouseStats } from '../types';

/**
 * Computes per-user statistics from game history and transactions.
 */
export function computeUserStats(
  userId: string,
  userName: string,
  email: string,
  gameHistory: GameHistoryItem[],
  transactions: Transaction[]
): UserStats {
  const userGames = gameHistory.filter(g => g.userId === userId);
  const userTx = transactions.filter(t => t.userId === userId);

  const totalSpins = userGames.length;
  const totalBets = userGames.reduce((sum, g) => sum + g.bet, 0);
  const totalWins = userGames.reduce((sum, g) => sum + g.win, 0);
  const winCount = userGames.filter(g => g.win > 0).length;
  const biggestWin = userGames.reduce((max, g) => Math.max(max, g.win), 0);

  const deposits = userTx.filter(t => t.type === 'DEPOSIT').reduce((sum, t) => sum + t.amount, 0);
  const withdrawals = userTx.filter(t => t.type === 'WITHDRAWAL').reduce((sum, t) => sum + t.amount, 0);
  const bonuses = userTx.filter(t => t.type === 'BONUS').reduce((sum, t) => sum + t.amount, 0);

  return {
    userId,
    userName,
    email,
    totalSpins,
    totalBets,
    totalWins,
    netProfit: totalWins - totalBets,
    winRate: totalSpins > 0 ? (winCount / totalSpins) * 100 : 0,
    biggestWin,
    deposits,
    withdrawals,
    bonuses,
  };
}

/**
 * Computes aggregate house (casino) statistics.
 */
export function computeHouseStats(
  users: UserProfile[],
  gameHistory: GameHistoryItem[],
  transactions: Transaction[]
): HouseStats {
  const totalSpins = gameHistory.length;
  const totalHandle = gameHistory.reduce((sum, g) => sum + g.bet, 0);
  const totalPayouts = gameHistory.reduce((sum, g) => sum + g.win, 0);
  const houseProfit = totalHandle - totalPayouts;
  const observedRTP = totalHandle > 0 ? (totalPayouts / totalHandle) * 100 : 0;

  const totalDeposits = transactions.filter(t => t.type === 'DEPOSIT').reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'WITHDRAWAL').reduce((sum, t) => sum + t.amount, 0);
  const totalBonuses = transactions.filter(t => t.type === 'BONUS').reduce((sum, t) => sum + t.amount, 0);

  // Count users with at least one spin
  const activeUserIds = new Set(gameHistory.map(g => g.userId));
  const activeUsers = activeUserIds.size;

  // Count users who are net positive (won more than they bet)
  const profitableUsers = users.filter(user => {
    const userGames = gameHistory.filter(g => g.userId === user.id);
    const userBets = userGames.reduce((sum, g) => sum + g.bet, 0);
    const userWins = userGames.reduce((sum, g) => sum + g.win, 0);
    return userWins > userBets;
  }).length;

  return {
    totalSpins,
    totalHandle,
    totalPayouts,
    houseProfit,
    observedRTP,
    totalDeposits,
    totalWithdrawals,
    totalBonuses,
    activeUsers,
    profitableUsers,
  };
}

/**
 * Get top winners (users with highest net profit).
 */
export function getTopWinners(
  users: UserProfile[],
  gameHistory: GameHistoryItem[],
  transactions: Transaction[],
  limit: number = 10
): UserStats[] {
  const allStats = users.map(user =>
    computeUserStats(user.id, user.name, user.email, gameHistory, transactions)
  );

  return allStats
    .filter(s => s.totalSpins > 0)
    .sort((a, b) => b.netProfit - a.netProfit)
    .slice(0, limit);
}

/**
 * Get users who are net positive (beating the house).
 */
export function getProfitableUsers(
  users: UserProfile[],
  gameHistory: GameHistoryItem[],
  transactions: Transaction[]
): UserStats[] {
  const allStats = users.map(user =>
    computeUserStats(user.id, user.name, user.email, gameHistory, transactions)
  );

  return allStats
    .filter(s => s.netProfit > 0 && s.totalSpins > 0)
    .sort((a, b) => b.netProfit - a.netProfit);
}

/**
 * Estimate theoretical RTP from configuration (Monte Carlo simulation).
 * This runs a large number of simulated spins to estimate expected return.
 */
export function estimateTheoreticalRTP(
  spinFunction: (betPerLine: number, totalBet: number) => { totalWin: number },
  sampleSize: number = 100000
): number {
  const betPerLine = 1;
  const totalBet = 30; // 30 lines * 1 per line
  let totalWagered = 0;
  let totalReturned = 0;

  for (let i = 0; i < sampleSize; i++) {
    const result = spinFunction(betPerLine, totalBet);
    totalWagered += totalBet;
    totalReturned += result.totalWin;
  }

  return totalWagered > 0 ? (totalReturned / totalWagered) * 100 : 0;
}
