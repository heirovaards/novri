import { boolean, index, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { dosenTable } from './dosen.table';
import { academicYearTable } from './academic-year.table';
import { refOptionTable } from './ref-option.table';

export const dosenYearTable = pgTable(
  'dosen_year',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    dosenId: uuid('dosen_id')
      .notNull()
      .references(() => dosenTable.id),
    academicYearId: uuid('academic_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    isDtpr: boolean('is_dtpr').notNull().default(false),
    jabatanStrukturalId: uuid('jabatan_struktural_id').references(() => refOptionTable.id),
  },
  (table) => [
    uniqueIndex('dosen_year_dosen_academic_year_key').on(table.dosenId, table.academicYearId),
    index('dosen_year_jabatan_struktural_id_idx').on(table.jabatanStrukturalId),
  ],
);
