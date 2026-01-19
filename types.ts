
export type SymbolId = 'W' | 'S' | 'A' | 'B' | 'C' | 'D' | '10' | '9';

export type Payline = number[][];

export type Grid = SymbolId[][];

export interface LineWin {
  lineIndex: number;
  symbol: SymbolId;
  count: number;
  payout: number;
  positions: number[][];
}

export interface ScatterWin {
  count: number;
  payout: number;
  positions: number[][];
}

export interface EvaluationResult {
  grid: Grid;
  lineWins: LineWin[];
  scatterWin: ScatterWin | null;
  totalWin: number;
  freeSpinsTriggered: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  joinedDate: string;
  isAdmin: boolean;
  balance: number;
}

export interface GameHistoryItem {
  id: string;
  oddsShown: number;
  timestamp: number;
  bet: number;
  win: number;
  result: EvaluationResult;
  userId: string;
  isFreeSpin: boolean;
  multiplier: number;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BONUS';
  amount: number;
  timestamp: number;
  method: string;
  status: 'COMPLETED' | 'PENDING';
  userId: string;
}

// LocalStorage schema types
export interface StorageSchema {
  version: number;
  migratedAt: number;
}

export interface UsersRegistry {
  byId: Record<string, UserProfile>;
  allIds: string[];
}

export interface SessionData {
  currentUserId: string | null;
  lastLoginAt: number | null;
}

export interface LedgerData {
  gameHistory: GameHistoryItem[];
  transactions: Transaction[];
}

// Admin analytics types
export interface UserStats {
  userId: string;
  userName: string;
  email: string;
  totalSpins: number;
  totalBets: number;
  totalWins: number;
  netProfit: number;
  winRate: number;
  biggestWin: number;
  deposits: number;
  withdrawals: number;
  bonuses: number;
}

export interface HouseStats {
  totalSpins: number;
  totalHandle: number;
  totalPayouts: number;
  houseProfit: number;
  observedRTP: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalBonuses: number;
  activeUsers: number;
  profitableUsers: number;
}
