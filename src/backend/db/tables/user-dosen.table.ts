import { pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { dosenTable } from './dosen.table';
import { user } from '../auth-schema';

export const userDosenTable = pgTable(
  'user_dosen',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    dosenId: uuid('dosen_id')
      .notNull()
      .references(() => dosenTable.id),
  },
  (table) => [uniqueIndex('user_dosen_user_id_key').on(table.userId), uniqueIndex('user_dosen_dosen_id_key').on(table.dosenId)],
);
