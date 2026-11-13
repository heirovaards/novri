import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { SessionUser } from '@shared/types/session-user.type';
import { appRoutes } from '@shared/constants/app-routes';
import { getSessionUser } from './get-session-user';

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(appRoutes.login);

  if (user.mustChangePassword) {
    const pathname = (await headers()).get('x-pathname');
    if (pathname !== appRoutes.changePassword) redirect(appRoutes.changePassword);
  }

  return user;
}
