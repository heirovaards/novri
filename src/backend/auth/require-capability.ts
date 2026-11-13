import { redirect } from 'next/navigation';
import type { Capability } from '@shared/permissions/capability.type';
import type { SessionUser } from '@shared/types/session-user.type';
import { appRoutes } from '@shared/constants/app-routes';
import { canPerform } from '@shared/permissions/can-perform';
import { requireSessionUser } from './require-session-user';

export async function requireCapability(capability: Capability): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (!canPerform(user, capability)) redirect(appRoutes.forbidden);
  return user;
}
