import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { lkpsPeriodTable } from './lkps-period.table';
import { fileTable } from './file.table';
import { user } from '../auth-schema';

export const periodSnapshotTable = pgTable(
  'period_snapshot',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    periodId: uuid('period_id')
      .notNull()
      .references(() => lkpsPeriodTable.id),
    seq: integer('seq').notNull(),
    compiled: jsonb('compiled').notNull(),
    exportFileId: uuid('export_file_id').references(() => fileTable.id),
    createdBy: text('created_by').references(() => user.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('period_snapshot_period_seq_key').on(table.periodId, table.seq), index('period_snapshot_export_file_id_idx').on(table.exportFileId)],
);
