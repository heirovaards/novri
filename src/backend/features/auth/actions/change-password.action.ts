'use server';

import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { APIError } from 'better-auth';
import { changePasswordSchema } from '@shared/schemas/auth/change-password.schema';
import type { ActionResult } from '@shared/types/action-result.type';
import { authInstance } from '../../../auth/auth-instance';
import { requireActor } from '../../../auth/require-actor';
import { runAction } from '../../../shared/run-action';
import { DomainError } from '../../../shared/domain-error';
import { withActor } from '../../../shared/with-actor';
import { user } from '../../../db/auth-schema';

export async function changePasswordAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const sessionUser = await requireActor();
    const data = changePasswordSchema.parse(input);

    try {
      await authInstance.api.changePassword({
        body: { currentPassword: data.currentPassword, newPassword: data.newPassword },
        headers: await headers(),
      });
    } catch (error) {
      if (error instanceof APIError) throw new DomainError('INVALID_INPUT', 'Kata sandi saat ini salah.');
      throw error;
    }

    await withActor(sessionUser.id, async (tx) => {
      await tx.update(user).set({ mustChangePassword: false }).where(eq(user.id, sessionUser.id));
    });
  });
}
