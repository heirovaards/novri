import { redirect } from 'next/navigation';
import { getSessionUser } from '@backend/auth/get-session-user';
import { getLandingPath } from '@backend/auth/get-landing-path';
import { appRoutes } from '@shared/constants/app-routes';

export async function LandingRedirectScreen() {
  const user = await getSessionUser();
  if (!user) redirect(appRoutes.login);
  redirect(user.mustChangePassword ? appRoutes.changePassword : getLandingPath(user));
}
