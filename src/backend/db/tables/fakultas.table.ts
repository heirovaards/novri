import { pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

export const fakultasTable = pgTable(
  'fakultas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kode: text('kode').notNull(),
    nama: text('nama').notNull(),
  },
  (table) => [uniqueIndex('fakultas_kode_key').on(table.kode)],
);
