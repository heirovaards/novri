'use server';

import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { userSchema } from '@shared/schemas/admin/user.schema';
import type { ActionResult } from '@shared/types/action-result.type';
import { authInstance } from '../../../auth/auth-instance';
import { requireActorCapability } from '../../../auth/require-actor-capability';
import { runAction } from '../../../shared/run-action';
import { DomainError } from '../../../shared/domain-error';
import { withActor } from '../../../shared/with-actor';
import { logAppEvent } from '../../audit/lib/log-app-event';
import { userRoleTable } from '../../../db/tables/user-role.table';
import { userDosenTable } from '../../../db/tables/user-dosen.table';
import { getCurrentProdiId } from '../../../shared/get-current-prodi-id';

export async function updateUserAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const actor = await requireActorCapability('users.manage');
    const data = userSchema.parse(input);
    const userId = data.id;
    if (!userId) throw new DomainError('INVALID_INPUT', 'ID pengguna wajib diisi.');

    if (userId === actor.id && !data.roles.includes('admin_sistem')) {
      throw new DomainError('FORBIDDEN', 'Anda tidak dapat menghapus peran Admin Sistem milik Anda sendiri.');
    }

    const prodiId = await getCurrentProdiId();

    await authInstance.api.adminUpdateUser({
      body: { userId, data: { name: data.name, email: data.email } },
      headers: await headers(),
    });

    await withActor(actor.id, async (tx) => {
      await tx.delete(userRoleTable).where(eq(userRoleTable.userId, userId));
      for (const role of data.roles) {
        await tx.insert(userRoleTable).values({ userId, prodiId, role });
      }
      await tx.delete(userDosenTable).where(eq(userDosenTable.userId, userId));
      if (data.dosenId) {
        await tx.insert(userDosenTable).values({ userId, dosenId: data.dosenId });
      }
      await logAppEvent(tx, { action: 'user_update', actorUserId: actor.id, entityType: 'user', entityId: userId, prodiId });
    });
  });
}
