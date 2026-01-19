import { db } from '../drizzle/index';
import { users, transactions } from '../drizzle/schema';
import { desc, eq } from 'drizzle-orm';

/**
 * Compute user balance from transaction ledger
 * This is the source of truth for balances
 */
export async function getUserBalance(userId: string): Promise<number> {
  // Fast path: balanceAfter is stored on every transaction.
  // This avoids a SUM over the full ledger on every spin.
  const latest = await db
    .select({ balanceAfter: transactions.balanceAfter })
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(1);

  return parseFloat(latest[0]?.balanceAfter || '0');
}

/**
 * Create a transaction and return new balance
 * This is the ONLY way to modify balances
 */
export async function createTransaction(
  userId: string,
  type: string,
  amount: number,
  method?: string,
  status: string = 'COMPLETED',
  metadata?: any,
  currentBalance?: number
) {
  const startingBalance = typeof currentBalance === 'number' ? currentBalance : await getUserBalance(userId);
  
  // Calculate balance after this transaction
  let balanceAfter = startingBalance;
  if (type === 'DEPOSIT' || type === 'WIN' || type === 'BONUS_CREDIT') {
    balanceAfter += amount;
  } else if (type === 'WITHDRAWAL' || type === 'BET') {
    balanceAfter -= amount;
  }

  // Prevent negative balance (except for admin adjustments)
  if (balanceAfter < 0 && type !== 'ADMIN_ADJUSTMENT') {
    throw new Error('Insufficient balance');
  }

  const [transaction] = await db
    .insert(transactions)
    .values({
      userId,
      type,
      amount: amount.toFixed(2),
      balanceAfter: balanceAfter.toFixed(2),
      method: method || null,
      status,
      metadata: metadata || null,
    })
    .returning();

  return { transaction, balanceAfter };
}

/**
 * Generate a unique referral code
 */
export async function generateReferralCode(): Promise<string> {
  let attempts = 0;
  while (attempts < 10) {
    const code = `COVIE-${Math.floor(Math.random() * 90000) + 10000}`;
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, code))
      .limit(1);
    
    if (existing.length === 0) {
      return code;
    }
    attempts++;
  }
  throw new Error('Failed to generate unique referral code');
}
