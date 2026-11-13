import { sql } from 'drizzle-orm';
import { pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { refOptionTable } from './ref-option.table';

export const fleksibilitasTable = pgTable(
  'fleksibilitas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bentukId: uuid('bentuk_id').references(() => refOptionTable.id),
    labelCustom: text('label_custom'),
    ...workflowColumns(),
  },
  (table) => [
    uniqueIndex('fleksibilitas_prodi_bentuk_key').on(table.prodiId, table.bentukId).where(sql`${table.deletedAt} is null`),
    uniqueIndex('fleksibilitas_prodi_label_key')
      .on(table.prodiId, sql`lower(${table.labelCustom})`)
      .where(sql`${table.deletedAt} is null`),
  ],
);
