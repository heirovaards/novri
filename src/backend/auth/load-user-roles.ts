import { and, eq } from 'drizzle-orm';
import type { Role } from '@shared/permissions/capability.type';
import { db } from '../db/client';
import { userRoleTable } from '../db/tables/user-role.table';

export async function loadUserRoles(userId: string, prodiId: string): Promise<Role[]> {
  const rows = await db
    .select({ role: userRoleTable.role })
    .from(userRoleTable)
    .where(and(eq(userRoleTable.userId, userId), eq(userRoleTable.prodiId, prodiId)));

  return rows.map((row) => row.role as Role);
}
