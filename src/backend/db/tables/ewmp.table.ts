import { sql } from 'drizzle-orm';
import { index, numeric, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { dosenTable } from './dosen.table';
import { academicYearTable } from './academic-year.table';

export const ewmpTable = pgTable(
  'ewmp',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    dosenId: uuid('dosen_id')
      .notNull()
      .references(() => dosenTable.id),
    academicYearId: uuid('academic_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    sksPsSendiri: numeric('sks_ps_sendiri', { precision: 8, scale: 2 }),
    sksPsLainPtSendiri: numeric('sks_ps_lain_pt_sendiri', { precision: 8, scale: 2 }),
    sksPtLain: numeric('sks_pt_lain', { precision: 8, scale: 2 }),
    sksPenelitian: numeric('sks_penelitian', { precision: 8, scale: 2 }),
    sksPkm: numeric('sks_pkm', { precision: 8, scale: 2 }),
    sksManPtSendiri: numeric('sks_man_pt_sendiri', { precision: 8, scale: 2 }),
    sksManPtLain: numeric('sks_man_pt_lain', { precision: 8, scale: 2 }),
    ...workflowColumns(),
  },
  (table) => [
    uniqueIndex('ewmp_dosen_academic_year_key').on(table.dosenId, table.academicYearId).where(sql`${table.deletedAt} is null`),
    index('ewmp_academic_year_id_idx').on(table.academicYearId),
  ],
);
