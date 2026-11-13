import { defineConfig } from 'drizzle-kit';

try {
  process.loadEnvFile();
} catch {
  // no .env file present; rely on process.env from the environment (e.g. CI)
}

export default defineConfig({
  schema: ['src/backend/db/tables/*.table.ts', 'src/backend/db/enums/*.enum.ts', 'src/backend/db/auth-schema.ts'],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
