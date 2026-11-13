'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { roleLabels } from '@shared/constants/role-labels';
import { appRoutes } from '@shared/constants/app-routes';
import type { SessionUser } from '@shared/types/session-user.type';
import { signOutAction } from '@backend/features/auth/actions/sign-out.action';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction();
      router.push(appRoutes.login);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2" aria-label="Menu pengguna">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800">{initials(user.name)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="font-semibold">{user.name}</span>
          <span className="text-xs text-muted-foreground">{user.roles.map((role) => roleLabels[role]).join(', ')}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push(appRoutes.changePassword)}>Ganti Kata Sandi</DropdownMenuItem>
        <DropdownMenuItem onSelect={handleSignOut} disabled={isPending}>
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
