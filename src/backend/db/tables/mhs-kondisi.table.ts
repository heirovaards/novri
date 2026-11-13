import { sql } from 'drizzle-orm';
import { index, integer, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { lkpsPeriodTable } from './lkps-period.table';
import { academicYearTable } from './academic-year.table';

export const mhsKondisiTable = pgTable(
  'mhs_kondisi',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    periodId: uuid('period_id')
      .notNull()
      .references(() => lkpsPeriodTable.id),
    cohortYearId: uuid('cohort_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    aktifTs: integer('aktif_ts'),
    lulusTs: integer('lulus_ts'),
    doTs: integer('do_ts'),
    ...workflowColumns(),
  },
  (table) => [
    uniqueIndex('mhs_kondisi_period_cohort_year_key').on(table.periodId, table.cohortYearId).where(sql`${table.deletedAt} is null`),
    index('mhs_kondisi_cohort_year_id_idx').on(table.cohortYearId),
  ],
);
