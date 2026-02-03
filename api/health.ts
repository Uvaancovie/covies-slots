import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMissingServerEnv } from '../lib/server-config';
import postgres from 'postgres';
import { cache } from '../lib/cache';

// ⚡ Performance tracking
const performanceMetrics = {
  requests: 0,
  avgResponseTime: 0,
  lastCheck: Date.now(),
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const missing = getMissingServerEnv();

  const result: any = {
    serverTime: new Date().toISOString(),
    missingEnv: missing,
    jwtSecretPresent: Boolean(process.env.JWT_SECRET),
    database: { reachable: false, detail: null, responseTime: null },
    performance: {
      requests: performanceMetrics.requests,
      avgResponseTime: performanceMetrics.avgResponseTime.toFixed(2) + 'ms',
      uptime: ((Date.now() - performanceMetrics.lastCheck) / 1000).toFixed(0) + 's',
      cacheSize: cache['cache']?.size || 0,
    },
    memory: {
      used: process.memoryUsage().heapUsed / 1024 / 1024,
      total: process.memoryUsage().heapTotal / 1024 / 1024,
      unit: 'MB',
    },
  };

  // If there's no DATABASE_URL, short-circuit the DB test
  if (!missing.includes('DATABASE_URL')) {
    try {
      const dbStart = Date.now();
      const sql = postgres(process.env.DATABASE_URL as string, { prepare: false, ssl: 'require' });
      // run a lightweight query
      await sql`select 1 as ok`;
      result.database.reachable = true;
      result.database.responseTime = (Date.now() - dbStart) + 'ms';
      await sql.end?.();
    } catch (err: any) {
      result.database.detail = err?.message || String(err);
      console.error('Health check DB error:', err);
    }
  }

  // Update performance metrics
  const responseTime = Date.now() - startTime;
  performanceMetrics.requests++;
  performanceMetrics.avgResponseTime = 
    (performanceMetrics.avgResponseTime * (performanceMetrics.requests - 1) + responseTime) / 
    performanceMetrics.requests;

  // If there are missing env vars, return 500 to indicate misconfiguration
  if (missing.length > 0) {
    return res.status(500).json(result);
  }

  return res.status(200).json(result);
}
