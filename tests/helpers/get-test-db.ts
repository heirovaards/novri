import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

let pool: Pool | undefined;

export function getTestDb() {
  pool ??= new Pool({ connectionString: process.env.TEST_DATABASE_URL });
  return drizzle(pool);
}
