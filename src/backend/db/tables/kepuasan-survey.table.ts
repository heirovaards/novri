import { sql } from 'drizzle-orm';
import { integer, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { academicYearTable } from './academic-year.table';

export const kepuasanSurveyTable = pgTable(
  'kepuasan_survey',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    academicYearId: uuid('academic_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    jumlahResponden: integer('jumlah_responden'),
    ...workflowColumns(),
  },
  (table) => [uniqueIndex('kepuasan_survey_prodi_academic_year_key').on(table.prodiId, table.academicYearId).where(sql`${table.deletedAt} is null`)],
);
