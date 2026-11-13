import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { tridharmaKindEnum } from '../enums/tridharma-kind.enum';
import { refOptionTable } from './ref-option.table';
import { dosenTable } from './dosen.table';
import { academicYearTable } from './academic-year.table';
import { tridharmaTable } from './tridharma.table';

export const hkiTable = pgTable(
  'hki',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kind: tridharmaKindEnum('kind').notNull(),
    judul: text('judul'),
    jenisId: uuid('jenis_id').references(() => refOptionTable.id),
    dosenId: uuid('dosen_id')
      .notNull()
      .references(() => dosenTable.id),
    academicYearId: uuid('academic_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    tridharmaId: uuid('tridharma_id').references(() => tridharmaTable.id),
    ...workflowColumns(),
  },
  (table) => [
    index('hki_jenis_id_idx').on(table.jenisId),
    index('hki_dosen_id_idx').on(table.dosenId),
    index('hki_academic_year_id_idx').on(table.academicYearId),
    index('hki_tridharma_id_idx').on(table.tridharmaId),
  ],
);
