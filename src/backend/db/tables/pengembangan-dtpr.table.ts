import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { dosenTable } from './dosen.table';
import { refOptionTable } from './ref-option.table';
import { academicYearTable } from './academic-year.table';

export const pengembanganDtprTable = pgTable(
  'pengembangan_dtpr',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    dosenId: uuid('dosen_id')
      .notNull()
      .references(() => dosenTable.id),
    jenisId: uuid('jenis_id').references(() => refOptionTable.id),
    academicYearId: uuid('academic_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    keterangan: text('keterangan'),
    ...workflowColumns(),
  },
  (table) => [index('pengembangan_dtpr_dosen_id_idx').on(table.dosenId), index('pengembangan_dtpr_academic_year_id_idx').on(table.academicYearId)],
);
