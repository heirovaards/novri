'use server';

import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { resetUserPasswordSchema } from '@shared/schemas/admin/reset-user-password.schema';
import type { ActionResult } from '@shared/types/action-result.type';
import { authInstance } from '../../../auth/auth-instance';
import { requireActorCapability } from '../../../auth/require-actor-capability';
import { runAction } from '../../../shared/run-action';
import { withActor } from '../../../shared/with-actor';
import { logAppEvent } from '../../audit/lib/log-app-event';
import { user } from '../../../db/auth-schema';
import { getCurrentProdiId } from '../../../shared/get-current-prodi-id';

export async function resetUserPasswordAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const actor = await requireActorCapability('users.manage');
    const data = resetUserPasswordSchema.parse(input);
    const prodiId = await getCurrentProdiId();

    await authInstance.api.setUserPassword({ body: { userId: data.userId, newPassword: data.newPassword }, headers: await headers() });

    await withActor(actor.id, async (tx) => {
      await tx.update(user).set({ mustChangePassword: true }).where(eq(user.id, data.userId));
      await logAppEvent(tx, { action: 'password_reset', actorUserId: actor.id, entityType: 'user', entityId: data.userId, prodiId });
    });
  });
}
