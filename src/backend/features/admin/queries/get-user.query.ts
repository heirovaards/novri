import { and, eq } from 'drizzle-orm';
import type { Role } from '@shared/permissions/capability.type';
import { requireCapability } from '../../../auth/require-capability';
import { db } from '../../../db/client';
import { user } from '../../../db/auth-schema';
import { userRoleTable } from '../../../db/tables/user-role.table';
import { userDosenTable } from '../../../db/tables/user-dosen.table';
import { getCurrentProdiId } from '../../../shared/get-current-prodi-id';

export type AdminUserDetail = {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  dosenId: string | null;
  active: boolean;
};

export async function getUserQuery(id: string): Promise<AdminUserDetail | null> {
  await requireCapability('users.manage');
  const prodiId = await getCurrentProdiId();

  const [row] = await db.select({ id: user.id, name: user.name, email: user.email, banned: user.banned }).from(user).where(eq(user.id, id)).limit(1);
  if (!row) return null;

  const roleRows = await db
    .select({ role: userRoleTable.role })
    .from(userRoleTable)
    .where(and(eq(userRoleTable.userId, id), eq(userRoleTable.prodiId, prodiId)));
  const [link] = await db.select({ dosenId: userDosenTable.dosenId }).from(userDosenTable).where(eq(userDosenTable.userId, id)).limit(1);

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    roles: roleRows.map((roleRow) => roleRow.role as Role),
    dosenId: link?.dosenId ?? null,
    active: !row.banned,
  };
}
