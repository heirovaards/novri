import { index, integer, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { mhsAsalTable } from './mhs-asal.table';
import { academicYearTable } from './academic-year.table';

export const mhsAsalTahunTable = pgTable(
  'mhs_asal_tahun',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    mhsAsalId: uuid('mhs_asal_id')
      .notNull()
      .references(() => mhsAsalTable.id),
    academicYearId: uuid('academic_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    jumlah: integer('jumlah').notNull(),
  },
  (table) => [uniqueIndex('mhs_asal_tahun_mhs_asal_academic_year_key').on(table.mhsAsalId, table.academicYearId), index('mhs_asal_tahun_academic_year_id_idx').on(table.academicYearId)],
);
