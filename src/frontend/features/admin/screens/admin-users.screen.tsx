import { requireCapability } from '@backend/auth/require-capability';
import { listUsersQuery } from '@backend/features/admin/queries/list-users.query';
import { PageHeader } from '../../../shared/components/layout/page-header.component';
import { AdminUsersTable } from '../components/admin-users-table.component';

export async function AdminUsersScreen() {
  await requireCapability('users.manage');
  const rows = await listUsersQuery();

  return (
    <div>
      <PageHeader title="Pengguna" />
      <AdminUsersTable rows={rows} />
    </div>
  );
}
