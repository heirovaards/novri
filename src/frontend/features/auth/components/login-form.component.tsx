'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { signInSchema } from '@shared/schemas/auth/sign-in.schema';
import { signInAction } from '@backend/features/auth/actions/sign-in.action';
import { useActionForm } from '../../../shared/hooks/use-action-form';
import { FormField } from '../../../shared/components/form/form-field.component';
import { Input } from '../../../shared/components/ui/input';
import { Button } from '../../../shared/components/ui/button';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';

type SignInValues = { email: string; password: string };

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<SignInValues>({ resolver: zodResolver(signInSchema), defaultValues: { email: '', password: '' } });
  const { submit, isSubmitting, errorMessage } = useActionForm({
    form,
    action: signInAction,
    successMessage: 'Berhasil masuk.',
    onSuccess: (data) => {
      router.push(data.redirectTo);
      router.refresh();
    },
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {errorMessage ? (
        <Alert variant="danger">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}
      <FormField id="email" label="Email" error={form.formState.errors.email?.message}>
        <Input type="email" autoComplete="email" {...form.register('email')} />
      </FormField>
      <FormField
        id="password"
        label="Kata Sandi"
        error={form.formState.errors.password?.message}
        endAdornment={
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
      >
        <Input type={showPassword ? 'text' : 'password'} autoComplete="current-password" {...form.register('password')} className="pr-10" />
      </FormField>
      <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
        Masuk
      </Button>
      <p className="text-center text-sm text-muted-foreground">Lupa kata sandi? Hubungi Admin Sistem.</p>
    </form>
  );
}
