import { pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { prodiTable } from './prodi.table';
import { timestampsColumns } from '../columns/timestamps-columns';

export const dosenTable = pgTable(
  'dosen',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    prodiId: uuid('prodi_id')
      .notNull()
      .references(() => prodiTable.id),
    nidn: text('nidn').notNull(),
    nama: text('nama').notNull(),
    pendidikanTerakhir: text('pendidikan_terakhir'),
    jabatanFungsional: text('jabatan_fungsional'),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    ...timestampsColumns(),
  },
  (table) => [uniqueIndex('dosen_prodi_nidn_key').on(table.prodiId, table.nidn)],
);
