import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { pathToFileURL } from 'url';

// Load env files with local overrides (do NOT commit these files)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const PORT = Number(process.env.PORT || 5174);
const app = express();

// Enable CORS for Vercel frontend and Render backend
app.use(cors({
  origin: [
    'https://covies-slots.vercel.app',
    'https://covies-slots.onrender.com',
    'http://localhost:5173', 
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(express.json({ limit: '256kb' }));

// Wrap Vercel-style handlers so they can run under Express.
const vercelToExpress = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error('API handler error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

function isHandlerFile(name) {
  return (
    (name.endsWith('.ts') || name.endsWith('.js')) &&
    !name.endsWith('.d.ts') &&
    !name.endsWith('.map')
  );
}

/**
 * Auto-register all handlers from /api folder.
 * - api/auth/me.ts     -> /api/auth/me
 * - api/bonuses/index.ts -> /api/bonuses
 */
async function registerRoutes(dir, prefix = '/api') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await registerRoutes(fullPath, `${prefix}/${entry.name}`);
      continue;
    }
    if (!isHandlerFile(entry.name)) continue;

    const routeName = entry.name.replace(/\.[jt]s$/, '');
    const routePath = routeName === 'index' ? prefix : `${prefix}/${routeName}`;

    try {
      const moduleUrl = pathToFileURL(fullPath).href;
      const mod = await import(moduleUrl);
      const handler = mod?.default;
      if (typeof handler === 'function') {
        console.log(`[api] registered ${routePath}`);
        app.all(routePath, vercelToExpress(handler));
      }
    } catch (err) {
      console.error(`[api] failed to load ${fullPath}:`, err);
    }
  }
}

(async () => {
  const apiDir = path.resolve(process.cwd(), 'api');
  await registerRoutes(apiDir);

  // Serve static files from the 'dist' directory (Vite build output)
  const distDir = path.resolve(process.cwd(), 'dist');
  if (fs.existsSync(distDir)) {
    console.log(`[server] Serving static files from ${distDir}`);
    app.use(express.static(distDir));
    
    // SPA Fallback: For any request not handled by API or static files, return index.html
    app.get('*', (req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    console.warn('[server] "dist" directory not found. Run "npm run build" to generate frontend assets.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] Server running at http://0.0.0.0:${PORT}`);
  });
})();
