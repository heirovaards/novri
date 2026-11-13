import { integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { prodiTable } from './prodi.table';
import { timestampsColumns } from '../columns/timestamps-columns';

export const mataKuliahTable = pgTable(
  'mata_kuliah',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    prodiId: uuid('prodi_id')
      .notNull()
      .references(() => prodiTable.id),
    kode: text('kode').notNull(),
    nama: text('nama').notNull(),
    sks: integer('sks').notNull(),
    semester: integer('semester').notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    ...timestampsColumns(),
  },
  (table) => [uniqueIndex('mata_kuliah_prodi_kode_key').on(table.prodiId, table.kode)],
);
