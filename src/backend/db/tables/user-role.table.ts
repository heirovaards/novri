import { index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { roleEnum } from '../enums/role.enum';
import { prodiTable } from './prodi.table';
import { user } from '../auth-schema';

export const userRoleTable = pgTable(
  'user_role',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    prodiId: uuid('prodi_id')
      .notNull()
      .references(() => prodiTable.id),
    role: roleEnum('role').notNull(),
  },
  (table) => [
    uniqueIndex('user_role_user_prodi_role_key').on(table.userId, table.prodiId, table.role),
    index('user_role_prodi_id_idx').on(table.prodiId),
  ],
);
