import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { serialize, parse } from 'cookie';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cache, CACHE_TTL, cacheKeys } from './cache';

const JWT_SECRET = process.env.JWT_SECRET || '8f3a2c9b6e1d4f7a0c5e8b2a1d9c3f6e7b0a4d2c8e1f5a9b3c7d0e6f1a2b4c8d9e0f7a1b3c5d7e9f0a2c4e6b8d1f3a5c7e9b0d2f4a6c8e1';
const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = 'auth_token';

// ⚡ Optimized JWT settings for faster token generation
const JWT_OPTIONS = {
  algorithm: 'HS256' as const, // Fastest signing algorithm
  expiresIn: JWT_EXPIRES_IN,
};

export interface JWTPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT utilities
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, JWT_OPTIONS);
}

export function verifyToken(token: string): JWTPayload | null {
  // ⚡ Check cache first for sub-10ms validation
  const cacheKey = cacheKeys.session(token);
  const cached = cache.get<JWTPayload>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    // Cache valid tokens for faster subsequent checks
    cache.set(cacheKey, payload, CACHE_TTL.SESSION);
    return payload;
  } catch {
    return null;
  }
}

// Cookie utilities
export function setAuthCookie(res: VercelResponse, token: string): void {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true, // Always use secure in production (Render/Vercel both use HTTPS)
    sameSite: 'none', // Required for cross-site cookies
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  res.setHeader('Set-Cookie', cookie);
}

export function clearAuthCookie(res: VercelResponse): void {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 0,
    path: '/',
  });
  res.setHeader('Set-Cookie', cookie);
}

export function getAuthToken(req: VercelRequest): string | null {
  // Try cookie first (preferred)
  const cookies = parse(req.headers.cookie || '');
  if (cookies[COOKIE_NAME]) {
    return cookies[COOKIE_NAME];
  }
  
  // Fallback to Authorization header (for API clients)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

// Middleware helper to get authenticated user
export function getAuthUser(req: VercelRequest): JWTPayload | null {
  const token = getAuthToken(req);
  if (!token) return null;
  
  return verifyToken(token);
}

// Helper to require authentication
export function requireAuth(req: VercelRequest, res: VercelResponse): JWTPayload | null {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
}

// Helper to require admin
export function requireAdmin(req: VercelRequest, res: VercelResponse): JWTPayload | null {
  const user = requireAuth(req, res);
  if (!user) return null;
  
  if (!user.isAdmin) {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return null;
  }
  
  return user;
}
