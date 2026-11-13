import { Client } from 'pg';
import { resetTestDatabase } from './reset-test-database';

function dbNameFromUrl(url: string): string {
  return new URL(url).pathname.replace(/^\//, '');
}

export default async function globalSetup() {
  try {
    process.loadEnvFile();
  } catch {
    // no .env file present; rely on process.env from the environment (e.g. CI)
  }

  const adminUrl = process.env.DATABASE_URL!;
  const testDbName = dbNameFromUrl(process.env.TEST_DATABASE_URL!);

  const client = new Client({ connectionString: adminUrl });
  await client.connect();
  const { rows } = await client.query('select 1 from pg_database where datname = $1', [testDbName]);
  if (rows.length === 0) {
    await client.query(`create database ${client.escapeIdentifier(testDbName)}`);
  }
  await client.end();

  await resetTestDatabase();
}
