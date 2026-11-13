import { redirect } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import { requireSessionUser } from '@backend/auth/require-session-user';
import { canPerform } from '@shared/permissions/can-perform';
import { appRoutes } from '@shared/constants/app-routes';
import { PageHeader } from '../../../shared/components/layout/page-header.component';
import { EmptyState } from '../../../shared/components/data/empty-state.component';

export async function DashboardScreen() {
  const user = await requireSessionUser();
  if (!canPerform(user, 'dashboard.full') && !canPerform(user, 'dashboard.my_tasks')) redirect(appRoutes.forbidden);

  return (
    <div>
      <PageHeader title="Dashboard" />
      <EmptyState icon={LayoutDashboard} message="Dashboard tersedia setelah data mulai diisi." />
    </div>
  );
}
