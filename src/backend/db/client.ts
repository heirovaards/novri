import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

try {
  process.loadEnvFile();
} catch {
  // no .env file present (e.g. Next.js already loaded it, or CI sets the environment directly)
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool);
