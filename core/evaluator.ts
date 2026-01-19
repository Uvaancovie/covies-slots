
import { Grid, SymbolId, LineWin, ScatterWin, EvaluationResult } from '../types';
import { PAYLINES, PAYTABLE, SCATTER_PAY, FREE_SPINS_AWARD, GAME_CONFIG, REEL_STRIPS } from './config';

/**
 * SlotGameEngine
 * 
 * In a real-world application, this class would reside on a secure NodeJS or Python server.
 * It handles the RNG (Random Number Generation) and the Game Logic (Rules).
 * The Frontend should only receive the *result* of this engine, never calculate wins itself.
 */
export class SlotGameEngine {
  
  /**
   * Generates a random spin result.
   * @param betPerLine The current bet per line.
   * @param totalBet The total bet amount.
   * @returns EvaluationResult containing the grid and win details.
   */
  public spin(betPerLine: number, totalBet: number): EvaluationResult {
    // 1. RNG Phase: Generate the Grid
    // In a casino backend, we would use a crypto-secure RNG here.
    const { grid, stopIndices } = this.generateRandomGrid();

    // 2. Evaluation Phase: Check the rules
    return this.evaluateGrid(grid, betPerLine, totalBet);
  }

  /**
   * Generates the symbol grid based on Reel Strips and RNG.
   */
  private generateRandomGrid(): { grid: Grid; stopIndices: number[] } {
    const grid: Grid = Array(GAME_CONFIG.NUM_ROWS).fill(0).map(() => Array(GAME_CONFIG.NUM_REELS).fill('9'));
    const stopIndices: number[] = [];

    REEL_STRIPS.forEach((strip, reelIndex) => {
      // RNG: Pick a random stop position on the reel strip
      const stopIndex = Math.floor(Math.random() * strip.length);
      stopIndices.push(stopIndex);

      // Populate rows for this reel based on the strip
      for (let i = 0; i < GAME_CONFIG.NUM_ROWS; i++) {
        const symbol = strip[(stopIndex + i) % strip.length];
        grid[i][reelIndex] = symbol;
      }
    });

    return { grid, stopIndices };
  }

  /**
   * Evaluates the grid against Paylines and Game Rules.
   */
  private evaluateGrid(grid: Grid, betPerLine: number, totalBet: number): EvaluationResult {
    const lineWins: LineWin[] = [];
    let scatterWin: ScatterWin | null = null;
    let totalWin = 0;

    // A. Evaluate Line Wins
    PAYLINES.forEach((line, lineIndex) => {
      const lineSymbols: SymbolId[] = [];
      const positions: number[][] = [];
      
      for (let reel = 0; reel < GAME_CONFIG.NUM_REELS; reel++) {
        const row = line[reel];
        lineSymbols.push(grid[row][reel]);
        positions.push([row, reel]);
      }

      const firstSymbol = lineSymbols[0];
      
      // Scatters usually ignore paylines, so we skip if line starts with S (unless rules say otherwise)
      if (firstSymbol === 'S') return; 

      let comboLength = 0;
      for (const symbol of lineSymbols) {
        // Wilds ('W') match everything except Scatter
        if (symbol === firstSymbol || symbol === 'W') {
          comboLength++;
        } else {
          break;
        }
      }

      if (comboLength > 0) {
        // Determine the actual winning symbol (handle Wilds starting the line)
        const winSymbol = firstSymbol === 'W' ? this.getFirstNonWild(lineSymbols) : firstSymbol;
        
        // Lookup payout
        const payoutTable = PAYTABLE[winSymbol];
        if (payoutTable) {
            const multiplier = payoutTable[comboLength - 1] || 0;
            if (multiplier > 0) {
              lineWins.push({
                lineIndex,
                symbol: winSymbol,
                count: comboLength,
                payout: multiplier * betPerLine,
                positions: positions.slice(0, comboLength),
              });
            }
        }
      }
    });

    // B. Evaluate Scatter Wins (Anywhere on screen)
    const scatterPositions: number[][] = [];
    grid.forEach((row, rowIndex) => {
      row.forEach((symbol, colIndex) => {
        if (symbol === 'S') {
          scatterPositions.push([rowIndex, colIndex]);
        }
      });
    });

    const scatterCount = scatterPositions.length;
    if (scatterCount >= 2) { 
      const scatterPayout = (SCATTER_PAY[scatterCount - 1] || 0) * totalBet;
      if (scatterPayout > 0) {
          scatterWin = {
              count: scatterCount,
              payout: scatterPayout,
              positions: scatterPositions,
          };
      }
    }

    // C. Calculate Total
    totalWin = lineWins.reduce((sum, win) => sum + win.payout, 0);
    if (scatterWin) {
      totalWin += scatterWin.payout;
    }
    
    // D. Check for Free Spins
    const freeSpinsTriggered = FREE_SPINS_AWARD[scatterCount - 1] || 0;

    return { grid, lineWins, scatterWin, totalWin, freeSpinsTriggered };
  }

  private getFirstNonWild(line: SymbolId[]): SymbolId {
    for (const symbol of line) {
        if (symbol !== 'W') {
            return symbol;
        }
    }
    return 'W'; // Fallback if line is 5 Wilds (Jackpot usually)
  }
}

// Export a singleton instance for the frontend to use
export const gameEngine = new SlotGameEngine();
export const evaluateSpin = gameEngine.spin.bind(gameEngine); // Backwards compatibility
