import { bigint, index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { tridharmaTable } from './tridharma.table';
import { academicYearTable } from './academic-year.table';

export const tridharmaDanaTable = pgTable(
  'tridharma_dana',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tridharmaId: uuid('tridharma_id')
      .notNull()
      .references(() => tridharmaTable.id),
    academicYearId: uuid('academic_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    amountRp: bigint('amount_rp', { mode: 'number' }).notNull(),
  },
  (table) => [
    uniqueIndex('tridharma_dana_tridharma_academic_year_key').on(table.tridharmaId, table.academicYearId),
    index('tridharma_dana_academic_year_id_idx').on(table.academicYearId),
  ],
);
