import { requireSessionUser } from '@backend/auth/require-session-user';
import { ChangePasswordForm } from '../components/change-password-form.component';

export async function ChangePasswordScreen() {
  const user = await requireSessionUser();

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-[420px] rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="mb-4 text-xl font-bold">Ganti Kata Sandi</h1>
        <ChangePasswordForm forced={user.mustChangePassword} />
      </div>
    </div>
  );
}
