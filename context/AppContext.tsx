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
  AUTH_TOKEN: 'covies.auth.token',
};

const CURRENT_SCHEMA_VERSION = 1;

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// ⚡ Request deduplication cache to prevent duplicate API calls
const pendingRequests = new Map<string, Promise<any>>();

const deduplicatedFetch = async (key: string, fetchFn: () => Promise<Response>): Promise<Response> => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  const promise = fetchFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
};

interface AppContextType {
  user: UserProfile | null;
  balance: number;
  isAuthenticated: boolean;
  gameHistory: GameHistoryItem[];
  transactions: Transaction[];
  allUsers: UserProfile[];
  allGameHistory: GameHistoryItem[];
  allTransactions: Transaction[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateBalance: (amount: number, type?: 'GAME' | 'DEPOSIT' | 'WITHDRAWAL') => void;
  addGameHistory: (bet: number, win: number, result: EvaluationResult, isFreeSpin?: boolean, multiplier?: number) => void;
  addTransaction: (type: Transaction['type'], amount: number, method: string) => void;
  continueAsGuest: () => void;
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

  // ⚡ Smart balance polling - only poll when user is authenticated and active
  useEffect(() => {
    if (!user) return;

    let pollInterval: NodeJS.Timeout | null = null;
    let isActive = true;

    // Detect user activity
    const handleActivity = () => {
      isActive = true;
    };

    // Poll balance more frequently when active, less when idle
    const startPolling = () => {
      const pollBalance = async () => {
        if (!isActive) return;

        try {
          const res = await fetch(`${API_BASE_URL}/api/wallet`, {
            credentials: 'include',
            headers: getAuthHeaders()
          });

          if (res.ok) {
            const data = await res.json();
            if (data.balance !== undefined) {
              setUser(prev => prev ? { ...prev, balance: data.balance } : null);
            }
          }
        } catch (err) {
          // Silently fail - not critical
        }

        // Mark as inactive after successful poll
        isActive = false;
      };

      // Poll every 10 seconds (only executes if user is active)
      pollInterval = setInterval(pollBalance, 10000);
    };

    // Listen for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    startPolling();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [user?.id]);

  const refreshUser = async () => {
    try {
      // ⚡ Deduplicate user refresh requests
      const res = await deduplicatedFetch('user:me', () =>
        fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: 'include',
          headers: getAuthHeaders()
        })
      );
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
      // ⚡ Deduplicate parallel data loading requests
      const [histRes, txRes] = await Promise.all([
        deduplicatedFetch('history', () =>
          fetch(`${API_BASE_URL}/api/history`, { credentials: 'include', headers: getAuthHeaders() })
        ),
        deduplicatedFetch('transactions', () =>
          fetch(`${API_BASE_URL}/api/transactions`, { credentials: 'include', headers: getAuthHeaders() })
        )
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

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        // Store token from login
        if (loginData.token) {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, loginData.token);
        }
        await refreshUser();
        return { success: true };
      } else {
        const errorData = await loginRes.json().catch(() => ({ error: 'Login failed' }));
        return { success: false, error: errorData.error || 'Invalid credentials' };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (email: string, name: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const regRes = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password })
      });

      if (regRes.ok) {
        const regData = await regRes.json();
        // Store token from registration
        if (regData.token) {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, regData.token);
        }
        await refreshUser();
        return { success: true };
      } else {
        const errorData = await regRes.json().catch(() => ({ error: 'Registration failed' }));
        return { success: false, error: errorData.error || 'Registration failed' };
      }
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
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
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, method })
      });

      if (res.ok) {
        const data = await res.json();
        // Update balance immediately
        if (user && data.balance !== undefined) {
          setUser(prev => prev ? { ...prev, balance: data.balance } : null);
        }
        await loadPersonalData();
      }
    } catch (err) {
      console.error('Transaction error:', err);
    }
  };

  const continueAsGuest = async () => {
    // Clear any existing auth
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

    // Create guest user
    const guestUser: UserProfile = {
      id: `guest_${Date.now()}`,
      name: 'Guest Player',
      email: '',
      referralCode: '',
      joinedDate: new Date().toISOString(),
      isAdmin: false,
      balance: 100 // Starter balance for guest
    };

    setUser(guestUser);

    // Optional: could persist basic guest session to localStorage if we wanted persistence
    // but for now user requested ephemeral or just basic
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
      register,
      logout,
      switchUser,
      updateBalance,
      addGameHistory,
      addTransaction,
      continueAsGuest
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
