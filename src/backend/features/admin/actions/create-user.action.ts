'use server';

import { headers } from 'next/headers';
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

export async function createUserAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const actor = await requireActorCapability('users.manage');
    const data = userSchema.parse(input);
    if (!data.password) throw new DomainError('INVALID_INPUT', 'Kata sandi awal wajib diisi.');

    const prodiId = await getCurrentProdiId();
    const isAdminSistem = data.roles.includes('admin_sistem');

    const created = await authInstance.api.createUser({
      body: { email: data.email, password: data.password, name: data.name, role: isAdminSistem ? 'admin' : 'user' },
      headers: await headers(),
    });

    await withActor(actor.id, async (tx) => {
      for (const role of data.roles) {
        await tx.insert(userRoleTable).values({ userId: created.user.id, prodiId, role });
      }
      if (data.dosenId) {
        await tx.insert(userDosenTable).values({ userId: created.user.id, dosenId: data.dosenId });
      }
      await logAppEvent(tx, { action: 'user_create', actorUserId: actor.id, entityType: 'user', entityId: created.user.id, prodiId });
    });

    return { id: created.user.id };
  });
}
