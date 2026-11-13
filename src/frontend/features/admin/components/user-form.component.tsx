'use client';

import type { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema } from '@shared/schemas/admin/user.schema';
import { createUserAction } from '@backend/features/admin/actions/create-user.action';
import { updateUserAction } from '@backend/features/admin/actions/update-user.action';
import { roleLabels } from '@shared/constants/role-labels';
import type { Role } from '@shared/permissions/capability.type';
import type { ActionResult } from '@shared/types/action-result.type';
import type { AdminUserRow } from '@backend/features/admin/queries/list-users.query';
import { useActionForm } from '../../../shared/hooks/use-action-form';
import { FormField } from '../../../shared/components/form/form-field.component';
import { Input } from '../../../shared/components/ui/input';
import { Checkbox } from '../../../shared/components/ui/checkbox';
import { Button } from '../../../shared/components/ui/button';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';

const ALL_ROLES: Role[] = ['admin_sistem', 'kaprodi', 'admin_prodi', 'dtpr', 'dosen'];

type UserFormValues = z.infer<typeof userSchema>;

export function UserForm({
  user,
  onDone,
  onResetPassword,
  onToggleActive,
}: {
  user: AdminUserRow | null;
  onDone: () => void;
  onResetPassword?: () => void;
  onToggleActive?: () => void;
}) {
  const isCreate = !user;
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      id: user?.id,
      name: user?.name ?? '',
      email: user?.email ?? '',
      roles: user?.roles ?? [],
      dosenId: user?.dosenId ?? null,
      // An empty string (unlike undefined) still has to satisfy the schema's min(10) on submit,
      // so an edit's hidden, unregistered password field must default to undefined, not ''.
      password: isCreate ? '' : undefined,
    },
  });

  async function action(input: unknown): Promise<ActionResult<void>> {
    const result = isCreate ? await createUserAction(input) : await updateUserAction(input);
    return result.ok ? { ok: true, data: undefined, violations: result.violations } : result;
  }

  const { submit, isSubmitting, errorMessage } = useActionForm({
    form,
    action,
    successMessage: isCreate ? 'Pengguna dibuat.' : 'Pengguna diperbarui.',
    onSuccess: onDone,
  });

  const selectedRoles = form.watch('roles');

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {errorMessage ? (
        <Alert variant="danger">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}
      <FormField id="name" label="Nama" required error={form.formState.errors.name?.message}>
        <Input id="name" {...form.register('name')} />
      </FormField>
      <FormField id="email" label="Email" required error={form.formState.errors.email?.message}>
        <Input id="email" type="email" {...form.register('email')} />
      </FormField>
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-foreground">
          Peran <span className="text-destructive">*</span>
        </span>
        <div className="flex flex-col gap-2">
          {ALL_ROLES.map((role) => (
            <label key={role} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selectedRoles.includes(role)}
                onCheckedChange={(checked) => {
                  const next = checked ? [...selectedRoles, role] : selectedRoles.filter((r) => r !== role);
                  form.setValue('roles', next, { shouldValidate: true });
                }}
              />
              {roleLabels[role]}
            </label>
          ))}
        </div>
        {form.formState.errors.roles ? <p className="text-[13px] text-destructive">Pilih minimal satu peran.</p> : null}
      </div>
      <FormField id="dosenId" label="Dosen tertaut" help="Tersedia setelah Master Data Dosen dibuat.">
        <Input id="dosenId" disabled placeholder="—" />
      </FormField>
      {isCreate ? (
        <FormField
          id="password"
          label="Kata sandi awal"
          required
          help="Minimal 10 karakter, mengandung huruf dan angka."
          error={form.formState.errors.password?.message}
        >
          <Input id="password" type="password" {...form.register('password')} />
        </FormField>
      ) : null}
      <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
        <div className="flex gap-2">
          {onResetPassword ? (
            <Button type="button" variant="outline" onClick={onResetPassword}>
              Reset Kata Sandi
            </Button>
          ) : null}
          {onToggleActive ? (
            <Button type="button" variant="outline" onClick={onToggleActive}>
              {user?.active ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
          ) : null}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          Simpan
        </Button>
      </div>
    </form>
  );
}
