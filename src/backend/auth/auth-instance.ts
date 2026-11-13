import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@backend/db/client';
import * as authSchema from '@backend/db/auth-schema';

export const authInstance = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 10,
  },
  user: {
    additionalFields: {
      mustChangePassword: { type: 'boolean', defaultValue: true },
    },
  },
  session: {
    expiresIn: Number(process.env.SESSION_IDLE_MINUTES ?? 60) * 60,
    updateAge: 300,
  },
  rateLimit: {
    enabled: true,
    customRules: {
      '/sign-in/email': { window: 15 * 60, max: 5 },
    },
  },
  plugins: [admin(), nextCookies()],
});
