import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { getSessionUser } from '@backend/auth/get-session-user';
import { getLandingPath } from '@backend/auth/get-landing-path';
import { appRoutes } from '@shared/constants/app-routes';
import { Button } from '../../../shared/components/ui/button';

export async function ForbiddenScreen() {
  const user = await getSessionUser();
  const landingPath = user ? getLandingPath(user) : appRoutes.login;

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <ShieldAlert aria-hidden className="size-12 text-muted-foreground" />
      <p className="text-lg font-semibold">Anda tidak memiliki akses ke halaman ini.</p>
      <Button asChild>
        <Link href={landingPath}>Kembali ke beranda</Link>
      </Button>
    </div>
  );
}
