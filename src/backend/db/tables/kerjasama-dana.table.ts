import { bigint, index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { kerjasamaTable } from './kerjasama.table';
import { academicYearTable } from './academic-year.table';

export const kerjasamaDanaTable = pgTable(
  'kerjasama_dana',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kerjasamaId: uuid('kerjasama_id')
      .notNull()
      .references(() => kerjasamaTable.id),
    academicYearId: uuid('academic_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    amountRp: bigint('amount_rp', { mode: 'number' }).notNull(),
  },
  (table) => [
    uniqueIndex('kerjasama_dana_kerjasama_academic_year_key').on(table.kerjasamaId, table.academicYearId),
    index('kerjasama_dana_academic_year_id_idx').on(table.academicYearId),
  ],
);
