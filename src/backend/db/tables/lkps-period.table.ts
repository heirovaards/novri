import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { periodStatusEnum } from '../enums/period-status.enum';
import { prodiTable } from './prodi.table';
import { academicYearTable } from './academic-year.table';
import { user } from '../auth-schema';

export const lkpsPeriodTable = pgTable(
  'lkps_period',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    prodiId: uuid('prodi_id')
      .notNull()
      .references(() => prodiTable.id),
    tsYearId: uuid('ts_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    status: periodStatusEnum('status').notNull().default('open'),
    instrumentVersion: text('instrument_version').notNull().default('2.1'),
    createdBy: text('created_by').references(() => user.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lockedBy: text('locked_by').references(() => user.id),
    lockedAt: timestamp('locked_at', { withTimezone: true }),
    reopenedBy: text('reopened_by').references(() => user.id),
    reopenedAt: timestamp('reopened_at', { withTimezone: true }),
    reopenReason: text('reopen_reason'),
  },
  (table) => [
    uniqueIndex('lkps_period_prodi_ts_year_key').on(table.prodiId, table.tsYearId),
    uniqueIndex('lkps_period_prodi_open_key').on(table.prodiId).where(sql`${table.status} = 'open'`),
  ],
);
