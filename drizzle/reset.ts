import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config as loadEnv } from 'dotenv';

// Load env vars
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

const __dirname = dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false, ssl: 'require' });

async function reset() {
  try {
    const resetSQL = readFileSync(join(__dirname, 'reset.sql'), 'utf8');
    await sql.unsafe(resetSQL);
    console.log('✅ Database reset complete. All tables dropped.');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset failed:', error);
    await sql.end();
    process.exit(1);
  }
}

reset();
