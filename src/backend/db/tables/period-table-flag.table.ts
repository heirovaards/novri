import { boolean, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { lkpsPeriodTable } from './lkps-period.table';
import { user } from '../auth-schema';

export const periodTableFlagTable = pgTable(
  'period_table_flag',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    periodId: uuid('period_id')
      .notNull()
      .references(() => lkpsPeriodTable.id),
    tableCode: text('table_code').notNull(),
    isNihil: boolean('is_nihil').notNull().default(false),
    note: text('note'),
    updatedBy: text('updated_by').references(() => user.id),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('period_table_flag_period_code_key').on(table.periodId, table.tableCode)],
);
