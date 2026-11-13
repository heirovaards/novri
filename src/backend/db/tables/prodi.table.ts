import { index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { fakultasTable } from './fakultas.table';

export const prodiTable = pgTable(
  'prodi',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fakultasId: uuid('fakultas_id')
      .notNull()
      .references(() => fakultasTable.id),
    kode: text('kode').notNull(),
    nama: text('nama').notNull(),
    jenjang: text('jenjang').notNull(),
  },
  (table) => [uniqueIndex('prodi_kode_key').on(table.kode), index('prodi_fakultas_id_idx').on(table.fakultasId)],
);
