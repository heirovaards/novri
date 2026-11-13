import { sql } from 'drizzle-orm';
import { pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { lkpsPeriodTable } from './lkps-period.table';

export const visiMisiTable = pgTable(
  'visi_misi',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    periodId: uuid('period_id')
      .notNull()
      .references(() => lkpsPeriodTable.id),
    visiPt: text('visi_pt'),
    visiUpps: text('visi_upps'),
    visiKeilmuanPs: text('visi_keilmuan_ps'),
    misiPt: text('misi_pt'),
    misiUpps: text('misi_upps'),
    ...workflowColumns(),
  },
  (table) => [uniqueIndex('visi_misi_period_key').on(table.periodId).where(sql`${table.deletedAt} is null`)],
);
