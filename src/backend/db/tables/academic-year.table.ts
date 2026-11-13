import { integer, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

export const academicYearTable = pgTable(
  'academic_year',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    startYear: integer('start_year').notNull(),
    label: text('label').notNull(),
  },
  (table) => [uniqueIndex('academic_year_start_year_key').on(table.startYear)],
);
