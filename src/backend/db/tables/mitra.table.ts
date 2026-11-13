import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { prodiTable } from './prodi.table';
import { refOptionTable } from './ref-option.table';
import { timestampsColumns } from '../columns/timestamps-columns';

export const mitraTable = pgTable(
  'mitra',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    prodiId: uuid('prodi_id')
      .notNull()
      .references(() => prodiTable.id),
    nama: text('nama').notNull(),
    jenisId: uuid('jenis_id').references(() => refOptionTable.id),
    negara: text('negara'),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    ...timestampsColumns(),
  },
  (table) => [uniqueIndex('mitra_prodi_nama_key').on(table.prodiId, table.nama), index('mitra_jenis_id_idx').on(table.jenisId)],
);
