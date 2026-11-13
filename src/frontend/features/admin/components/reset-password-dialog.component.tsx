'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetUserPasswordSchema } from '@shared/schemas/admin/reset-user-password.schema';
import { resetUserPasswordAction } from '@backend/features/admin/actions/reset-user-password.action';
import type { AdminUserRow } from '@backend/features/admin/queries/list-users.query';
import { useActionForm } from '../../../shared/hooks/use-action-form';
import { FormField } from '../../../shared/components/form/form-field.component';
import { Input } from '../../../shared/components/ui/input';
import { Button } from '../../../shared/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../shared/components/ui/dialog';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';

type ResetPasswordValues = { userId: string; newPassword: string; confirmNewPassword: string };

export function ResetPasswordDialog({ user, open, onOpenChange }: { user: AdminUserRow; open: boolean; onOpenChange: (open: boolean) => void }) {
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetUserPasswordSchema),
    defaultValues: { userId: user.id, newPassword: '', confirmNewPassword: '' },
  });
  const { submit, isSubmitting, errorMessage } = useActionForm({
    form,
    action: resetUserPasswordAction,
    successMessage: 'Kata sandi direset.',
    onSuccess: () => onOpenChange(false),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Kata Sandi — {user.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {errorMessage ? (
            <Alert variant="danger">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          ) : null}
          <FormField id="newPassword" label="Kata sandi baru" error={form.formState.errors.newPassword?.message}>
            <Input id="newPassword" type="password" {...form.register('newPassword')} />
          </FormField>
          <FormField id="confirmNewPassword" label="Ulangi kata sandi baru" error={form.formState.errors.confirmNewPassword?.message}>
            <Input id="confirmNewPassword" type="password" {...form.register('confirmNewPassword')} />
          </FormField>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              Reset Kata Sandi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
