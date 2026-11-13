import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    // Integration tests share one lkps_test Postgres instance; parallel files would race on row counts.
    fileParallelism: false,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'scripts/**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**', 'tests/e2e/**'],
    globalSetup: ['./tests/helpers/global-setup.ts'],
    setupFiles: ['./tests/helpers/setup-env.ts'],
  },
});
