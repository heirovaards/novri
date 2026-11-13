import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import unicorn from 'eslint-plugin-unicorn';

// These best-effort rules only cover the unambiguous, exception-free cases.
// The authoritative check is scripts/check-import-boundaries.ts (resolved paths,
// aware of the *.screen.tsx / *.handler / *.action exceptions in TRD §3.2).
const appBoundary = {
  files: ['app/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': ['error', { patterns: [{ group: ['@shared/*'], message: 'app/ must not import src/shared directly; go through a screen or handler.' }] }],
  },
};

const backendBoundary = {
  files: ['src/backend/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': ['error', { patterns: [{ group: ['@frontend/*'], message: 'src/backend must never import src/frontend.' }] }],
  },
};

const sharedBoundary = {
  files: ['src/shared/**/*.{ts,tsx}'],
  rules: {
    'no-restricted-imports': [
      'error',
      { patterns: [{ group: ['@frontend/*', '@backend/*'], message: 'src/shared must not import frontend or backend code.' }] },
    ],
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    plugins: { unicorn },
    rules: {
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
    },
  },
  {
    files: ['src/frontend/shared/components/ui/**', 'src/frontend/shared/hooks/use-mobile.ts', 'app/**/page.tsx', 'app/**/layout.tsx', 'app/**/route.ts', 'app/**/loading.tsx', 'app/**/error.tsx', 'app/**/not-found.tsx'],
    rules: { 'unicorn/filename-case': 'off' },
  },
  {
    // shadcn-vendored code (CLAUDE.md §5 exemption): not held to our hook-purity rules either.
    files: ['src/frontend/shared/components/ui/**', 'src/frontend/shared/hooks/use-mobile.ts'],
    rules: { 'react-hooks/purity': 'off', 'react-hooks/set-state-in-effect': 'off' },
  },
  appBoundary,
  backendBoundary,
  sharedBoundary,
  globalIgnores(['.next/**', 'drizzle/**', 'node_modules/**', 'playwright-report/**', 'test-results/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
