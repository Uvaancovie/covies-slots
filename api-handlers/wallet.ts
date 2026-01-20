import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../lib/auth';
import { createTransaction, getUserBalance } from '../lib/db-helpers';

type WalletAction = 'deposit' | 'withdraw';

function getAction(req: VercelRequest): WalletAction | null {
  const actionRaw = req.query?.action;
  const action = Array.isArray(actionRaw) ? actionRaw[0] : actionRaw;
  if (action === 'deposit' || action === 'withdraw') return action;
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const action = getAction(req);
  if (!action) {
    return res.status(400).json({ error: 'Missing or invalid action' });
  }

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  try {
    const amountNumber = Number((req.body as any)?.amount);
    const method = (req.body as any)?.method;

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!method) {
      return res.status(400).json({ error: action === 'deposit' ? 'Payment method is required' : 'Withdrawal method is required' });
    }

    if (action === 'withdraw') {
      const currentBalance = await getUserBalance(authUser.userId);
      if (currentBalance < amountNumber) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
    }

    const type = action === 'deposit' ? 'DEPOSIT' : 'WITHDRAWAL';
    const metadata = action === 'deposit' ? { simulatedDeposit: true } : { simulatedWithdrawal: true };

    const { transaction, balanceAfter } = await createTransaction(
      authUser.userId,
      type,
      amountNumber,
      String(method),
      'COMPLETED',
      metadata
    );

    return res.status(200).json({
      transaction,
      balance: balanceAfter,
    });
  } catch (error: any) {
    console.error('Wallet error:', error);
    return res.status(500).json({ error: error?.message || 'Wallet operation failed' });
  }
}
