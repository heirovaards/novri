import { index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { cplTable } from './cpl.table';
import { profilLulusanTable } from './profil-lulusan.table';

export const cplPlTable = pgTable(
  'cpl_pl',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cplId: uuid('cpl_id')
      .notNull()
      .references(() => cplTable.id),
    profilLulusanId: uuid('profil_lulusan_id')
      .notNull()
      .references(() => profilLulusanTable.id),
  },
  (table) => [uniqueIndex('cpl_pl_cpl_profil_lulusan_key').on(table.cplId, table.profilLulusanId), index('cpl_pl_profil_lulusan_id_idx').on(table.profilLulusanId)],
);
