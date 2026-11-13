import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { prodiTable } from './prodi.table';
import { user } from '../auth-schema';

export const importJobTable = pgTable(
  'import_job',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    prodiId: uuid('prodi_id')
      .notNull()
      .references(() => prodiTable.id),
    entity: text('entity').notNull(),
    payload: jsonb('payload').notNull(),
    createdBy: text('created_by').references(() => user.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (table) => [index('import_job_prodi_id_idx').on(table.prodiId)],
);
