try {
  process.loadEnvFile();
} catch {
  // no .env file present; rely on process.env from the environment (e.g. CI)
}

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
