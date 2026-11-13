'use server';

import { headers } from 'next/headers';
import { and, eq, gte, sql } from 'drizzle-orm';
import { APIError } from 'better-auth';
import { signInSchema } from '@shared/schemas/auth/sign-in.schema';
import { appRoutes } from '@shared/constants/app-routes';
import type { ActionResult } from '@shared/types/action-result.type';
import { authInstance } from '../../../auth/auth-instance';
import { getLandingPath } from '../../../auth/get-landing-path';
import { loadUserRoles } from '../../../auth/load-user-roles';
import { runAction } from '../../../shared/run-action';
import { DomainError } from '../../../shared/domain-error';
import { getCurrentProdiId } from '../../../shared/get-current-prodi-id';
import { logAppEvent } from '../../audit/lib/log-app-event';
import { db } from '../../../db/client';
import { auditLogTable } from '../../../db/tables/audit-log.table';

const LOGIN_LOCKOUT_WINDOW_MINUTES = 15;
const LOGIN_LOCKOUT_MAX_ATTEMPTS = 5;
const TOO_MANY_ATTEMPTS_MESSAGE = 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.';

export async function signInAction(input: unknown): Promise<ActionResult<{ redirectTo: string }>> {
  return runAction(async () => {
    const data = signInSchema.parse(input);
    const requestHeaders = await headers();

    // Better Auth's own rate limiter only runs for requests through its HTTP router
    // (app/api/auth/[...all]/route.ts), not for authInstance.api.* called directly from a Server
    // Action as this file does per TRD's "actions call authInstance.api.* directly" pattern. This
    // keeps PRD FR-01 AC3's per-email lockout enforced for the path the app actually uses.
    const windowStart = new Date(Date.now() - LOGIN_LOCKOUT_WINDOW_MINUTES * 60_000);
    const [recentFailures] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogTable)
      .where(and(eq(auditLogTable.action, 'login_failed'), eq(auditLogTable.entityId, data.email), gte(auditLogTable.at, windowStart)));
    if (Number(recentFailures?.count ?? 0) >= LOGIN_LOCKOUT_MAX_ATTEMPTS) {
      throw new DomainError('UNAUTHENTICATED', TOO_MANY_ATTEMPTS_MESSAGE);
    }

    let result: Awaited<ReturnType<typeof authInstance.api.signInEmail>>;
    try {
      result = await authInstance.api.signInEmail({ body: { email: data.email, password: data.password }, headers: requestHeaders });
    } catch (error) {
      await logAppEvent(db, { action: 'login_failed' as const, actorUserId: null, entityType: 'login_attempt', entityId: data.email });
      if (error instanceof APIError && error.status === 'TOO_MANY_REQUESTS') {
        throw new DomainError('UNAUTHENTICATED', TOO_MANY_ATTEMPTS_MESSAGE);
      }
      throw new DomainError('UNAUTHENTICATED', 'Email atau kata sandi salah.');
    }

    const prodiId = await getCurrentProdiId();
    const roles = await loadUserRoles(result.user.id, prodiId);
    await logAppEvent(db, { action: 'login', actorUserId: result.user.id, prodiId });

    const redirectTo = result.user.mustChangePassword ? appRoutes.changePassword : getLandingPath({ roles });
    return { redirectTo };
  });
}
