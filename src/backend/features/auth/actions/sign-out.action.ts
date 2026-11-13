'use server';

import { headers } from 'next/headers';
import type { ActionResult } from '@shared/types/action-result.type';
import { authInstance } from '../../../auth/auth-instance';
import { getSessionUser } from '../../../auth/get-session-user';
import { runAction } from '../../../shared/run-action';
import { logAppEvent } from '../../audit/lib/log-app-event';
import { db } from '../../../db/client';

export async function signOutAction(): Promise<ActionResult<void>> {
  return runAction(async () => {
    const user = await getSessionUser();
    await authInstance.api.signOut({ headers: await headers() });
    if (user) await logAppEvent(db, { action: 'logout', actorUserId: user.id, prodiId: user.prodiId });
  });
}
