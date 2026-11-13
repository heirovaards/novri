import type { SessionUser } from '@shared/types/session-user.type';
import { appRoutes } from '@shared/constants/app-routes';

export function getLandingPath(user: Pick<SessionUser, 'roles'>): string {
  const isOnlyAdminSistem = user.roles.length === 1 && user.roles[0] === 'admin_sistem';
  return isOnlyAdminSistem ? appRoutes.adminPengguna : appRoutes.dashboard;
}
