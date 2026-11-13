import { index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { cpmkTable } from './cpmk.table';
import { mataKuliahTable } from './mata-kuliah.table';

export const cpmkMkTable = pgTable(
  'cpmk_mk',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cpmkId: uuid('cpmk_id')
      .notNull()
      .references(() => cpmkTable.id),
    mataKuliahId: uuid('mata_kuliah_id')
      .notNull()
      .references(() => mataKuliahTable.id),
  },
  (table) => [uniqueIndex('cpmk_mk_cpmk_mata_kuliah_key').on(table.cpmkId, table.mataKuliahId), index('cpmk_mk_mata_kuliah_id_idx').on(table.mataKuliahId)],
);
