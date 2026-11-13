import { eq, inArray } from 'drizzle-orm';
import type { Role } from '@shared/permissions/capability.type';
import { requireCapability } from '../../../auth/require-capability';
import { db } from '../../../db/client';
import { user } from '../../../db/auth-schema';
import { userRoleTable } from '../../../db/tables/user-role.table';
import { userDosenTable } from '../../../db/tables/user-dosen.table';
import { getCurrentProdiId } from '../../../shared/get-current-prodi-id';

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  dosenId: string | null;
  active: boolean;
};

export async function listUsersQuery(): Promise<AdminUserRow[]> {
  await requireCapability('users.manage');
  const prodiId = await getCurrentProdiId();

  const roleRows = await db.select({ userId: userRoleTable.userId, role: userRoleTable.role }).from(userRoleTable).where(eq(userRoleTable.prodiId, prodiId));
  const userIds = [...new Set(roleRows.map((row) => row.userId))];
  if (userIds.length === 0) return [];

  const users = await db.select({ id: user.id, name: user.name, email: user.email, banned: user.banned }).from(user).where(inArray(user.id, userIds));
  const dosenLinks = await db.select({ userId: userDosenTable.userId, dosenId: userDosenTable.dosenId }).from(userDosenTable).where(inArray(userDosenTable.userId, userIds));

  const rolesByUser = new Map<string, Role[]>();
  for (const row of roleRows) {
    const list = rolesByUser.get(row.userId) ?? [];
    list.push(row.role as Role);
    rolesByUser.set(row.userId, list);
  }
  const dosenByUser = new Map(dosenLinks.map((link) => [link.userId, link.dosenId]));

  return users.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    roles: rolesByUser.get(row.id) ?? [],
    dosenId: dosenByUser.get(row.id) ?? null,
    active: !row.banned,
  }));
}
