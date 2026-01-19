import type { Config } from 'drizzle-kit';

// drizzle-kit doesn't automatically load Vite/Next env files.
// Load local env vars for migrations (safe: server-side only).
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

const url = process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    'Missing DATABASE_URL (or DATABASE_DIRECT_URL) for drizzle-kit. Put it in .env.local/.env or set it in your shell before running db:migrate.'
  );
}

export default {
  schema: './drizzle/schema.tsx',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url,
  },
} satisfies Config;
