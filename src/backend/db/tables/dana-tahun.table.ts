import { bigint, index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { danaTable } from './dana.table';
import { academicYearTable } from './academic-year.table';

export const danaTahunTable = pgTable(
  'dana_tahun',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    danaId: uuid('dana_id')
      .notNull()
      .references(() => danaTable.id),
    academicYearId: uuid('academic_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    amountRp: bigint('amount_rp', { mode: 'number' }).notNull(),
  },
  (table) => [uniqueIndex('dana_tahun_dana_academic_year_key').on(table.danaId, table.academicYearId), index('dana_tahun_academic_year_id_idx').on(table.academicYearId)],
);
