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
      return res.status(400).json({ error: 'Payment method is required' });
    }

    // In production, you would:
    // 1. Initiate payment with payment provider
    // 2. Mark transaction as PENDING
    // 3. Update to COMPLETED after webhook confirms payment
    
    // For now, we'll create a COMPLETED transaction directly
    const { transaction, balanceAfter } = await createTransaction(
      authUser.userId,
      'DEPOSIT',
      parseFloat(amount),
      method,
      'COMPLETED',
      { simulatedDeposit: true }
    );

    return res.status(200).json({
      transaction,
      balance: balanceAfter,
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return res.status(500).json({ error: 'Deposit failed' });
  }
}
