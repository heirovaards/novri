import { sql } from 'drizzle-orm';
import { index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { tridharmaTable } from './tridharma.table';
import { dosenTable } from './dosen.table';
import { peranTridharmaEnum } from '../enums/peran-tridharma.enum';

export const tridharmaDosenTable = pgTable(
  'tridharma_dosen',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tridharmaId: uuid('tridharma_id')
      .notNull()
      .references(() => tridharmaTable.id),
    dosenId: uuid('dosen_id')
      .notNull()
      .references(() => dosenTable.id),
    peran: peranTridharmaEnum('peran').notNull(),
  },
  (table) => [
    uniqueIndex('tridharma_dosen_tridharma_dosen_key').on(table.tridharmaId, table.dosenId),
    uniqueIndex('tridharma_dosen_ketua_key')
      .on(table.tridharmaId)
      .where(sql`${table.peran} = 'ketua'`),
    index('tridharma_dosen_dosen_id_idx').on(table.dosenId),
  ],
);
