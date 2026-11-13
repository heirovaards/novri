import { integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { cplTable } from './cpl.table';

export const cpmkTable = pgTable(
  'cpmk',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cplId: uuid('cpl_id')
      .notNull()
      .references(() => cplTable.id),
    kode: text('kode').notNull(),
    deskripsi: text('deskripsi').notNull(),
    sort: integer('sort').notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (table) => [uniqueIndex('cpmk_cpl_kode_key').on(table.cplId, table.kode)],
);
