import { redirect } from 'next/navigation';
import { getSessionUser } from '@backend/auth/get-session-user';
import { getLandingPath } from '@backend/auth/get-landing-path';
import { appRoutes } from '@shared/constants/app-routes';
import { LoginForm } from '../components/login-form.component';

export async function LoginScreen() {
  const user = await getSessionUser();
  if (user) redirect(user.mustChangePassword ? appRoutes.changePassword : getLandingPath(user));

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-white/15 text-lg font-bold">LK</span>
          <p className="text-2xl font-bold">Sistem Informasi LKPS</p>
        </div>
        <p className="text-sm text-white/90">
          Program Studi Sistem Informasi · Fakultas Biosains, Teknologi, dan Inovasi · Universitas Katolik Indonesia Atma Jaya
        </p>
        <p className="text-sm text-white/80">Mengacu pada Instrumen APS 2.1 · LAM INFOKOM</p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-[380px]">
          <h1 className="mb-6 text-2xl font-bold">Masuk</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
