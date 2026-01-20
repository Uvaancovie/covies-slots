
import { SymbolId } from '../types';

export const GAME_CONFIG = {
  NUM_REELS: 5,
  NUM_ROWS: 5, // Upgraded to 5 rows
  NUM_LINES: 30, // Increased paylines to cover the larger grid
  MIN_BET: 0.10,
  MAX_BET: 50,
  BET_INCREMENTS: [0.10, 0.20, 0.50, 1.00, 2.00, 5.00, 10.00, 25.00, 50.00],
  INITIAL_BALANCE: 100, // Welcome bonus for new users (R100)
  FREE_SPINS_RETRIGGER_CAP: 200,
};

export const SYMBOLS: Record<SymbolId, { display: string; id: SymbolId }> = {
  'W': { display: '💎', id: 'W' },   // Wild
  'S': { display: '⭐', id: 'S' },   // Scatter
  'A': { display: '🍒', id: 'A' },
  'B': { display: '🍋', id: 'B' },
  'C': { display: '🍉', id: 'C' },
  'D': { display: '🍇', id: 'D' },
  '10': { display: '🔟', id: '10' },
  '9': { display: '9️⃣', id: '9' },
};

// Payouts are per line bet for count 3, 4, 5. 0 for counts 0, 1, 2.
export const PAYTABLE: Record<SymbolId, number[]> = {
  'W': [0, 0, 20, 100, 500],
  'S': [0, 0, 0, 0, 0], // Scatters pay on total bet, handled separately
  'A': [0, 0, 15, 75, 250],
  'B': [0, 0, 12, 60, 200],
  'C': [0, 0, 10, 40, 120],
  'D': [0, 0, 8, 35, 100],
  '10': [0, 0, 5, 20, 60],
  '9': [0, 0, 4, 15, 50],
};

// Scatter pays are multipliers on TOTAL bet for counts 3, 4, 5.
export const SCATTER_PAY: number[] = [0, 0, 2, 10, 100];
export const FREE_SPINS_AWARD: number[] = [0, 0, 10, 15, 20];

// Reel strips as per specification
export const REEL_STRIPS: SymbolId[][] = [
  ['W', 'A', '10', 'B', '9', 'D', 'C', '10', 'A', '9', 'S', 'B', '10', 'C', '9', 'D', 'A', '10', 'B', '9'],
  ['A', '10', 'W', 'B', '9', 'S', 'C', '10', 'D', 'A', '9', 'B', '10', 'C', '9', 'D', 'A', '10', 'B', '9'],
  ['A', '10', 'B', '9', 'D', 'C', '10', 'S', 'A', '9', 'B', '10', 'W', '9', 'D', 'A', '10', 'B', '9'],
  ['A', '10', 'B', '9', 'D', 'C', '10', 'A', '9', 'B', '10', 'C', '9', 'D', 'A', '10', 'S', 'W', '9'],
  ['W', 'A', '10', 'B', '9', 'D', 'C', '10', 'A', '9', 'B', '10', 'C', '9', 'D', 'A', '10', 'B', 'S'],
];

// Expanded Paylines for 5x5 Grid
export const PAYLINES: number[][] = [
  // Basic Rows
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2],
  [3, 3, 3, 3, 3], // New Row 4
  [4, 4, 4, 4, 4], // New Row 5
  
  // V shapes
  [0, 1, 2, 1, 0],
  [1, 2, 3, 2, 1],
  [2, 3, 4, 3, 2],
  
  // Inverted V
  [4, 3, 2, 3, 4],
  [3, 2, 1, 2, 3],
  [2, 1, 0, 1, 2],

  // Diagonals
  [0, 1, 2, 3, 4],
  [4, 3, 2, 1, 0],
  
  // W shapes
  [0, 2, 0, 2, 0],
  [2, 0, 2, 0, 2],
  [2, 4, 2, 4, 2],
  [4, 2, 4, 2, 4],

  // M shapes
  [4, 2, 0, 2, 4], // Big M
  [0, 2, 4, 2, 0], // Big W

  // Zig Zags
  [1, 0, 1, 2, 1],
  [3, 4, 3, 2, 3],
  [1, 2, 1, 0, 1],
  [3, 2, 3, 4, 3],
  
  // Center mixes
  [2, 1, 2, 1, 2],
  [2, 3, 2, 3, 2],
  [1, 3, 1, 3, 1],
  [3, 1, 3, 1, 3],
  [0, 4, 0, 4, 0], // Extreme Zig Zag
  [4, 0, 4, 0, 4],
];
