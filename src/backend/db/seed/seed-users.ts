import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Role } from '@shared/permissions/capability.type';
import { authInstance } from '../../auth/auth-instance';
import { userRoleTable } from '../tables/user-role.table';
import { user } from '../auth-schema';
import { prodiTable } from '../tables/prodi.table';

const DEMO_PASSWORD = 'Lkps#2026demo';

const DEMO_USERS: { email: string; name: string; roles: Role[] }[] = [
  { email: 'admin.sistem@lkps.local', name: '[Admin Sistem]', roles: ['admin_sistem'] },
  { email: 'kaprodi@lkps.local', name: '[Kaprodi]', roles: ['kaprodi', 'dtpr'] },
  { email: 'admin.prodi@lkps.local', name: '[Admin Prodi]', roles: ['admin_prodi'] },
  { email: 'dtpr1@lkps.local', name: '[Dosen Tetap 1]', roles: ['dtpr', 'dosen'] },
  { email: 'dosen1@lkps.local', name: '[Dosen 1]', roles: ['dosen'] },
];

export async function seedUsers(db: NodePgDatabase): Promise<void> {
  const [prodi] = await db.select({ id: prodiTable.id }).from(prodiTable).limit(1);
  if (!prodi) throw new Error('seedUsers: no prodi found; run seedOrganisation first.');

  for (const demo of DEMO_USERS) {
    const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, demo.email)).limit(1);

    let userId: string;
    if (existing) {
      userId = existing.id;
    } else {
      const created = await authInstance.api.createUser({
        body: { email: demo.email, password: DEMO_PASSWORD, name: demo.name, role: demo.roles.includes('admin_sistem') ? 'admin' : 'user' },
      });
      userId = created.user.id;
    }

    await db.update(user).set({ mustChangePassword: false }).where(eq(user.id, userId));

    for (const role of demo.roles) {
      await db
        .insert(userRoleTable)
        .values({ userId, prodiId: prodi.id, role })
        .onConflictDoNothing({ target: [userRoleTable.userId, userRoleTable.prodiId, userRoleTable.role] });
    }
  }
}
