'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { AdminUserRow } from '@backend/features/admin/queries/list-users.query';
import { setUserActiveAction } from '@backend/features/admin/actions/set-user-active.action';
import { roleLabels } from '@shared/constants/role-labels';
import { Button } from '../../../shared/components/ui/button';
import { DataTable } from '../../../shared/components/data/data-table.component';
import type { DataTableColumn } from '../../../shared/components/data/data-table.component';
import { EntitySheet } from '../../../shared/components/overlay/entity-sheet.component';
import { StatusBadge } from '../../../shared/components/lkps/status-badge.component';
import { ConfirmDialog } from '../../../shared/components/overlay/confirm-dialog.component';
import { FilterBar } from '../../../shared/components/data/filter-bar.component';
import { EmptyState } from '../../../shared/components/data/empty-state.component';
import { UserForm } from './user-form.component';
import { ResetPasswordDialog } from './reset-password-dialog.component';

const COLUMNS: DataTableColumn<AdminUserRow>[] = [
  { key: 'name', header: 'Nama', cell: (row) => row.name },
  { key: 'email', header: 'Email', cell: (row) => row.email },
  { key: 'roles', header: 'Peran', cell: (row) => row.roles.map((role) => roleLabels[role]).join(', ') },
  { key: 'dosen', header: 'Dosen tertaut', cell: (row) => (row.dosenId ? 'Tertaut' : '—') },
  { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.active ? 'active' : 'inactive'} /> },
];

export function AdminUsersTable({ rows }: { rows: AdminUserRow[] }) {
  const router = useRouter();
  const [sheetUser, setSheetUser] = useState<AdminUserRow | 'new' | null>(null);
  const [resetUser, setResetUser] = useState<AdminUserRow | null>(null);
  const [toggleUser, setToggleUser] = useState<AdminUserRow | null>(null);
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const filteredRows = query ? rows.filter((row) => row.name.toLowerCase().includes(query) || row.email.toLowerCase().includes(query)) : rows;

  async function handleToggleActive() {
    if (!toggleUser) return;
    const result = await setUserActiveAction({ userId: toggleUser.id, active: !toggleUser.active });
    if (result.ok) {
      toast.success(toggleUser.active ? 'Pengguna dinonaktifkan.' : 'Pengguna diaktifkan.');
      setSheetUser(null);
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setToggleUser(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setSheetUser('new')}>
          <Plus className="size-4" /> Tambah Pengguna
        </Button>
      </div>
      <FilterBar search={search} onSearchChange={setSearch} hasActiveFilters={search.length > 0} onReset={() => setSearch('')} />
      {filteredRows.length === 0 ? (
        <EmptyState icon={Users} message="Tidak ada pengguna yang cocok dengan pencarian." />
      ) : (
        <DataTable
          columns={COLUMNS}
          rows={filteredRows}
          total={filteredRows.length}
          page={1}
          pageSize={25}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          onRowClick={(row) => setSheetUser(row)}
        />
      )}
      <EntitySheet
        open={sheetUser !== null}
        onOpenChange={(open) => !open && setSheetUser(null)}
        title={sheetUser === 'new' ? 'Tambah Pengguna' : 'Ubah Pengguna'}
      >
        {sheetUser ? (
          <UserForm
            user={sheetUser === 'new' ? null : sheetUser}
            onDone={() => {
              setSheetUser(null);
              router.refresh();
            }}
            onResetPassword={sheetUser !== 'new' ? () => setResetUser(sheetUser) : undefined}
            onToggleActive={sheetUser !== 'new' ? () => setToggleUser(sheetUser) : undefined}
          />
        ) : null}
      </EntitySheet>
      {resetUser ? <ResetPasswordDialog user={resetUser} open onOpenChange={(open) => !open && setResetUser(null)} /> : null}
      {toggleUser ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setToggleUser(null)}
          title={toggleUser.active ? 'Nonaktifkan pengguna?' : 'Aktifkan pengguna?'}
          description={
            toggleUser.active
              ? `Akun ${toggleUser.name} akan dinonaktifkan dan sesi aktif diakhiri.`
              : `Akun ${toggleUser.name} akan diaktifkan kembali.`
          }
          confirmLabel={toggleUser.active ? 'Nonaktifkan' : 'Aktifkan'}
          destructive={toggleUser.active}
          onConfirm={handleToggleActive}
        />
      ) : null}
    </div>
  );
}
