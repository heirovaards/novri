import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { tridharmaTable } from './tridharma.table';
import { lingkupEnum } from '../enums/lingkup.enum';
import { academicYearTable } from './academic-year.table';

export const diseminasiTable = pgTable(
  'diseminasi',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tridharmaId: uuid('tridharma_id')
      .notNull()
      .references(() => tridharmaTable.id),
    lingkup: lingkupEnum('lingkup'),
    academicYearId: uuid('academic_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    bentuk: text('bentuk'),
    ...workflowColumns(),
  },
  (table) => [index('diseminasi_tridharma_id_idx').on(table.tridharmaId), index('diseminasi_academic_year_id_idx').on(table.academicYearId)],
);
