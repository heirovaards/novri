import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sql } from 'drizzle-orm';

try {
  process.loadEnvFile();
} catch {
  // no .env file present; rely on process.env from the environment (e.g. CI)
}

export async function dbReset(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('db:reset refuses to run when NODE_ENV=production.');
  }

  const { db } = await import('../src/backend/db/client');
  await db.execute(sql`drop schema public cascade`);
  await db.execute(sql`create schema public`);
  await db.execute(sql`drop schema if exists drizzle cascade`);

  execSync('pnpm db:migrate', { stdio: 'inherit' });
  execSync('pnpm db:seed', { stdio: 'inherit' });
}

async function runDirectly() {
  try {
    await dbReset();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void runDirectly();
}
