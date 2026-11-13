'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema } from '@shared/schemas/auth/change-password.schema';
import { changePasswordAction } from '@backend/features/auth/actions/change-password.action';
import { appRoutes } from '@shared/constants/app-routes';
import { useActionForm } from '../../../shared/hooks/use-action-form';
import { FormField } from '../../../shared/components/form/form-field.component';
import { Input } from '../../../shared/components/ui/input';
import { Button } from '../../../shared/components/ui/button';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';

type ChangePasswordValues = { currentPassword: string; newPassword: string; confirmNewPassword: string };

export function ChangePasswordForm({ forced }: { forced: boolean }) {
  const router = useRouter();
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });
  const { submit, isSubmitting, errorMessage } = useActionForm({
    form,
    action: changePasswordAction,
    successMessage: 'Kata sandi berhasil diganti.',
    onSuccess: () => {
      router.push(appRoutes.dashboard);
      router.refresh();
    },
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {forced ? <p className="rounded-md bg-info-soft px-3 py-2 text-sm text-info-soft-fg">Anda perlu mengganti kata sandi sebelum melanjutkan.</p> : null}
      {errorMessage ? (
        <Alert variant="danger">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}
      <FormField id="currentPassword" label="Kata sandi saat ini" error={form.formState.errors.currentPassword?.message}>
        <Input id="currentPassword" type="password" autoComplete="current-password" {...form.register('currentPassword')} />
      </FormField>
      <FormField
        id="newPassword"
        label="Kata sandi baru"
        help="Minimal 10 karakter, mengandung huruf dan angka."
        error={form.formState.errors.newPassword?.message}
      >
        <Input id="newPassword" type="password" autoComplete="new-password" {...form.register('newPassword')} />
      </FormField>
      <FormField id="confirmNewPassword" label="Ulangi kata sandi baru" error={form.formState.errors.confirmNewPassword?.message}>
        <Input id="confirmNewPassword" type="password" autoComplete="new-password" {...form.register('confirmNewPassword')} />
      </FormField>
      <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
        Simpan Kata Sandi
      </Button>
    </form>
  );
}
