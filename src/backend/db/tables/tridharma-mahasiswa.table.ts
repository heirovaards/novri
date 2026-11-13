import { index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { tridharmaTable } from './tridharma.table';
import { mahasiswaTable } from './mahasiswa.table';

export const tridharmaMahasiswaTable = pgTable(
  'tridharma_mahasiswa',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tridharmaId: uuid('tridharma_id')
      .notNull()
      .references(() => tridharmaTable.id),
    mahasiswaId: uuid('mahasiswa_id')
      .notNull()
      .references(() => mahasiswaTable.id),
  },
  (table) => [
    uniqueIndex('tridharma_mahasiswa_tridharma_mahasiswa_key').on(table.tridharmaId, table.mahasiswaId),
    index('tridharma_mahasiswa_mahasiswa_id_idx').on(table.mahasiswaId),
  ],
);
