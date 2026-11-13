import { index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { mataKuliahTable } from './mata-kuliah.table';
import { profilLulusanTable } from './profil-lulusan.table';

export const mkPlTable = pgTable(
  'mk_pl',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    mataKuliahId: uuid('mata_kuliah_id')
      .notNull()
      .references(() => mataKuliahTable.id),
    profilLulusanId: uuid('profil_lulusan_id')
      .notNull()
      .references(() => profilLulusanTable.id),
  },
  (table) => [uniqueIndex('mk_pl_mata_kuliah_profil_lulusan_key').on(table.mataKuliahId, table.profilLulusanId), index('mk_pl_profil_lulusan_id_idx').on(table.profilLulusanId)],
);
