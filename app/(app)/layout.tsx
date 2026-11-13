import { cookies } from 'next/headers';
import { requireSessionUser } from '@backend/auth/require-session-user';
import { AppShell } from '@frontend/shared/components/layout/app-shell.component';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSessionUser();
  const collapsedCookie = (await cookies()).get('sidebar-collapsed')?.value;

  return (
    <AppShell user={user} initialCollapsed={collapsedCookie === 'true'}>
      {children}
    </AppShell>
  );
}
