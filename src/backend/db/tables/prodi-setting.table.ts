import { jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { prodiTable } from './prodi.table';
import { user } from '../auth-schema';

export const prodiSettingTable = pgTable(
  'prodi_setting',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    prodiId: uuid('prodi_id')
      .notNull()
      .references(() => prodiTable.id),
    key: text('key').notNull(),
    value: jsonb('value').notNull(),
    updatedBy: text('updated_by').references(() => user.id),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('prodi_setting_prodi_key_key').on(table.prodiId, table.key)],
);
