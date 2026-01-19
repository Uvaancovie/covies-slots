import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../lib/auth';
import { createTransaction, getUserBalance } from '../lib/db-helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const { amount, method } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!method) {
      return res.status(400).json({ error: 'Withdrawal method is required' });
    }

    // Check if user has sufficient balance
    const currentBalance = await getUserBalance(authUser.userId);
    if (currentBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // In production, you would:
    // 1. Create PENDING withdrawal
    // 2. Process with payment provider
    // 3. Update status after confirmation
    
    const { transaction, balanceAfter } = await createTransaction(
      authUser.userId,
      'WITHDRAWAL',
      parseFloat(amount),
      method,
      'COMPLETED',
      { simulatedWithdrawal: true }
    );

    return res.status(200).json({
      transaction,
      balance: balanceAfter,
    });
  } catch (error: any) {
    console.error('Withdrawal error:', error);
    return res.status(500).json({ error: error.message || 'Withdrawal failed' });
  }
}
