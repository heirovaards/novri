import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getTestDb } from './get-test-db';
import { applyAuditTriggers } from '../../src/backend/db/sql/apply-audit-triggers';

export async function resetTestDatabase(): Promise<void> {
  const db = getTestDb();
  await db.execute(sql`drop schema public cascade`);
  await db.execute(sql`create schema public`);
  await db.execute(sql`drop schema if exists drizzle cascade`);
  await migrate(db, { migrationsFolder: './drizzle' });
  await applyAuditTriggers(db);
}
