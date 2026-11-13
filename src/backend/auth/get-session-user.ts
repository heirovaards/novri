import { cache } from 'react';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import type { SessionUser } from '@shared/types/session-user.type';
import { authInstance } from './auth-instance';
import { loadUserRoles } from './load-user-roles';
import { db } from '../db/client';
import { userDosenTable } from '../db/tables/user-dosen.table';
import { getCurrentProdiId } from '../shared/get-current-prodi-id';

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const result = await authInstance.api.getSession({ headers: await headers() });
  if (!result) return null;
  // Defence in depth: `banned` is set before session rows are revoked in set-user-active.action.ts,
  // so checking it here closes any window where a just-deactivated account's existing session is
  // still found valid.
  if (result.user.banned) return null;

  const prodiId = await getCurrentProdiId();
  const roles = await loadUserRoles(result.user.id, prodiId);
  const [link] = await db.select({ dosenId: userDosenTable.dosenId }).from(userDosenTable).where(eq(userDosenTable.userId, result.user.id)).limit(1);

  return {
    id: result.user.id,
    name: result.user.name,
    email: result.user.email,
    roles,
    prodiId,
    dosenId: link?.dosenId ?? null,
    mustChangePassword: result.user.mustChangePassword,
  };
});
