import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

// script-src needs 'unsafe-inline' for Next.js's App Router hydration bootstrap script,
// and 'unsafe-eval' in dev only because React uses eval() to reconstruct server error stacks.
const csp = `default-src 'self'; script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; frame-ancestors 'none';`;

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  // Standalone output is only for the Docker image (docker/Dockerfile runs `node server.js`).
  // `next start` — used by `pnpm start` / Playwright's local E2E server — doesn't support it.
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
