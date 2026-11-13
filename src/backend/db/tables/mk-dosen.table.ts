import { index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { mataKuliahTable } from './mata-kuliah.table';
import { dosenTable } from './dosen.table';

export const mkDosenTable = pgTable(
  'mk_dosen',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    mataKuliahId: uuid('mata_kuliah_id')
      .notNull()
      .references(() => mataKuliahTable.id),
    dosenId: uuid('dosen_id')
      .notNull()
      .references(() => dosenTable.id),
  },
  (table) => [uniqueIndex('mk_dosen_mata_kuliah_dosen_key').on(table.mataKuliahId, table.dosenId), index('mk_dosen_dosen_id_idx').on(table.dosenId)],
);
