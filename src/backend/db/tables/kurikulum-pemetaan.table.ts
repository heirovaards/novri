import { sql } from 'drizzle-orm';
import { pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { lkpsPeriodTable } from './lkps-period.table';

export const kurikulumPemetaanTable = pgTable(
  'kurikulum_pemetaan',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    periodId: uuid('period_id')
      .notNull()
      .references(() => lkpsPeriodTable.id),
    ...workflowColumns(),
  },
  (table) => [uniqueIndex('kurikulum_pemetaan_period_key').on(table.periodId).where(sql`${table.deletedAt} is null`)],
);
