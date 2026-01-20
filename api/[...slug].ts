import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

// Map an incoming /api/... path to a handler in api-handlers
async function loadHandlerForPath(apiPath: string) {
  // Normalize: remove leading /api
  const normalized = apiPath.replace(/^\/api/, '');
  let tryPaths = [];

  // Try exact file
  tryPaths.push(path.resolve(process.cwd(), `api-handlers${normalized}.ts`));
  tryPaths.push(path.resolve(process.cwd(), `api-handlers${normalized}.js`));

  // Try index in directory
  tryPaths.push(path.resolve(process.cwd(), `api-handlers${normalized}/index.ts`));
  tryPaths.push(path.resolve(process.cwd(), `api-handlers${normalized}/index.js`));

  for (const p of tryPaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const apiPath = url.pathname;

  const handlerPath = await loadHandlerForPath(apiPath);
  if (!handlerPath) {
    console.warn('Catch-all: no handler for', apiPath);
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    console.log('Catch-all: routing', apiPath, '->', handlerPath);
    const moduleUrl = pathToFileURL(handlerPath).href;
    const mod = await import(moduleUrl);
    const h = mod?.default;
    if (typeof h === 'function') {
      return h(req, res);
    }
    console.error('Catch-all: handler invalid for', apiPath);
    return res.status(500).json({ error: 'Handler found but invalid' });
  } catch (err: any) {
    console.error('Catch-all handler error:', err);
    return res.status(500).json({ error: err?.message || 'Handler execution failed' });
  }
}
