import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, GameHistoryItem, Transaction, EvaluationResult, UsersRegistry, SessionData, LedgerData, StorageSchema } from '../types';
import { GAME_CONFIG } from '../core/config';
import { API_BASE_URL } from '../lib/api-config';

// LocalStorage keys
const STORAGE_KEYS = {
  SCHEMA: 'covies.schema',
  USERS: 'covies.users.v1',
  SESSION: 'covies.session.v1',
  LEDGER: 'covies.ledger.v1',
};

const CURRENT_SCHEMA_VERSION = 1;

interface AppContextType {
  user: UserProfile | null;
  balance: number;
  isAuthenticated: boolean;
  gameHistory: GameHistoryItem[];
  transactions: Transaction[];
  allUsers: UserProfile[];
  allGameHistory: GameHistoryItem[];
  allTransactions: Transaction[];
  login: (email: string, name: string, isAdmin?: boolean) => void;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateBalance: (amount: number, type?: 'GAME' | 'DEPOSIT' | 'WITHDRAWAL') => void;
  addGameHistory: (bet: number, win: number, result: EvaluationResult, isFreeSpin?: boolean, multiplier?: number) => void;
  addTransaction: (type: Transaction['type'], amount: number, method: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allGameHistory, setAllGameHistory] = useState<GameHistoryItem[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load user data on mount
  useEffect(() => {
    refreshUser();
  }, []);

  const refreshUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        
        // Also load history/transactions if authenticated
        if (data.user) {
          loadPersonalData();
          if (data.user.isAdmin) {
            loadAdminData();
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setInitialized(true);
    }
  };

  const loadPersonalData = async () => {
    try {
      const [histRes, txRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/history`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/transactions`, { credentials: 'include' })
      ]);
      
      if (histRes.ok) {
        const data = await histRes.json();
        setGameHistory(data.history.map((h: any) => ({
          ...h,
          timestamp: new Date(h.createdAt).getTime(),
          bet: parseFloat(h.betAmount),
          win: parseFloat(h.winAmount),
          result: h.resultGrid
        })));
      }
      
      if (txRes.ok) {
        const data = await txRes.json();
        setTransactions(data.transactions.map((t: any) => ({
          ...t,
          timestamp: new Date(t.createdAt).getTime(),
          amount: parseFloat(t.amount)
        })));
      }
    } catch (err) {
      console.error('Failed to load personal data:', err);
    }
  };

  const loadAdminData = async () => {
    // Admin endpoints not fully implemented yet, but placeholders
  };

  const login = async (email: string, name: string, password?: string) => {
    try {
      const pass = password || 'password123';
      
      // Try login first
      let loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      if (!loginRes.ok) {
        // Try register if login failed (assuming it might be a new user)
        const regRes = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name, password: pass })
        });
        
        if (regRes.ok) {
          // Try login again after registration
          loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass })
          });
        }
      }

      if (loginRes.ok) {
        await refreshUser();
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
      setUser(null);
      setGameHistory([]);
      setTransactions([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const switchUser = (userId: string) => {
    // Not supported in server mode for security reasons
  };

  const updateBalance = (amount: number, type: 'GAME' | 'DEPOSIT' | 'WITHDRAWAL' = 'GAME') => {
    // Balance is updated server-side, we just refresh local state
    if (user) {
      setUser(prev => prev ? { ...prev, balance: prev.balance + amount } : null);
    }
  };

  const addGameHistory = (bet: number, win: number, result: EvaluationResult, isFreeSpin: boolean = false, multiplier: number = 1) => {
    // History is added server-side via /api/spin, we refresh lazily or prepend
    const newItem: GameHistoryItem = {
      id: Math.random().toString(),
      timestamp: Date.now(),
      bet,
      win,
      result,
      userId: user?.id || '',
      isFreeSpin,
      multiplier,
      oddsShown: 0,
    };
    setGameHistory(prev => [newItem, ...prev].slice(0, 100));
  };

  const addTransaction = async (type: Transaction['type'], amount: number, method: string) => {
    try {
      const endpoint = type === 'DEPOSIT' ? `${API_BASE_URL}/api/deposit` : 
                       type === 'WITHDRAWAL' ? `${API_BASE_URL}/api/withdraw` : null;
      
      if (!endpoint) return;

      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method })
      });

      if (res.ok) {
        await refreshUser();
      }
    } catch (err) {
      console.error('Transaction error:', err);
    }
  };

  const balance = user?.balance ?? 0;
  const isAuthenticated = !!user;

  return (
    <AppContext.Provider value={{
      user,
      balance,
      isAuthenticated,
      gameHistory,
      transactions,
      allUsers,
      allGameHistory,
      allTransactions,
      login,
      logout,
      switchUser,
      updateBalance,
      addGameHistory,
      addTransaction
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
