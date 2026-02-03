/**
 * ⚡ In-Memory Cache for Auth & Balance
 * Serverless-optimized caching layer for sub-100ms responses
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton cache instance
export const cache = new MemoryCache();

// Cache TTLs (in milliseconds)
export const CACHE_TTL = {
  AUTH_USER: 5 * 60 * 1000, // 5 minutes - auth user data
  BALANCE: 30 * 1000, // 30 seconds - user balance
  SESSION: 10 * 60 * 1000, // 10 minutes - session validation
  BONUS: 60 * 1000, // 1 minute - active bonus claims
};

// Cache key generators
export const cacheKeys = {
  authUser: (userId: string) => `auth:user:${userId}`,
  balance: (userId: string) => `balance:${userId}`,
  session: (token: string) => `session:${token}`,
  activeBonus: (userId: string) => `bonus:active:${userId}`,
};

// Periodic cleanup (run every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => cache.cleanup(), 5 * 60 * 1000);
}
