'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import type { ActionResult } from '@shared/types/action-result.type';
import { authInstance } from '../../../auth/auth-instance';
import { requireActorCapability } from '../../../auth/require-actor-capability';
import { runAction } from '../../../shared/run-action';
import { DomainError } from '../../../shared/domain-error';
import { withActor } from '../../../shared/with-actor';
import { logAppEvent } from '../../audit/lib/log-app-event';
import { getCurrentProdiId } from '../../../shared/get-current-prodi-id';

const setUserActiveInputSchema = z.object({ userId: z.string(), active: z.boolean() });

export async function setUserActiveAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const actor = await requireActorCapability('users.manage');
    const data = setUserActiveInputSchema.parse(input);

    if (data.userId === actor.id) throw new DomainError('FORBIDDEN', 'Anda tidak dapat menonaktifkan akun Anda sendiri.');

    const prodiId = await getCurrentProdiId();
    const requestHeaders = await headers();

    if (data.active) {
      await authInstance.api.unbanUser({ body: { userId: data.userId }, headers: requestHeaders });
    } else {
      await authInstance.api.banUser({ body: { userId: data.userId }, headers: requestHeaders });
      await authInstance.api.revokeUserSessions({ body: { userId: data.userId }, headers: requestHeaders });
    }

    await withActor(actor.id, async (tx) => {
      await logAppEvent(tx, {
        action: data.active ? 'user_activate' : 'user_deactivate',
        actorUserId: actor.id,
        entityType: 'user',
        entityId: data.userId,
        prodiId,
      });
    });
  });
}
