import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { periodAttachmentKindEnum } from '../enums/period-attachment-kind.enum';
import { lkpsPeriodTable } from './lkps-period.table';
import { fileTable } from './file.table';
import { user } from '../auth-schema';

export const periodAttachmentTable = pgTable(
  'period_attachment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    periodId: uuid('period_id')
      .notNull()
      .references(() => lkpsPeriodTable.id),
    kind: periodAttachmentKindEnum('kind').notNull(),
    fileId: uuid('file_id')
      .notNull()
      .references(() => fileTable.id),
    createdBy: text('created_by').references(() => user.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('period_attachment_period_kind_key').on(table.periodId, table.kind), index('period_attachment_file_id_idx').on(table.fileId)],
);
