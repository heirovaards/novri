import { integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { prodiTable } from './prodi.table';

export const profilLulusanTable = pgTable(
  'profil_lulusan',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    prodiId: uuid('prodi_id')
      .notNull()
      .references(() => prodiTable.id),
    kode: text('kode').notNull(),
    deskripsi: text('deskripsi').notNull(),
    sort: integer('sort').notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
  },
  (table) => [uniqueIndex('profil_lulusan_prodi_kode_key').on(table.prodiId, table.kode)],
);
