import { numeric, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { kepuasanSurveyTable } from './kepuasan-survey.table';

export const kepuasanItemTable = pgTable(
  'kepuasan_item',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    surveyId: uuid('survey_id')
      .notNull()
      .references(() => kepuasanSurveyTable.id),
    kemampuan: text('kemampuan').notNull(),
    pctSangatBaik: numeric('pct_sangat_baik', { precision: 5, scale: 2 }),
    pctBaik: numeric('pct_baik', { precision: 5, scale: 2 }),
    pctCukup: numeric('pct_cukup', { precision: 5, scale: 2 }),
    pctKurang: numeric('pct_kurang', { precision: 5, scale: 2 }),
    rencanaTindakLanjut: text('rencana_tindak_lanjut'),
  },
  (table) => [uniqueIndex('kepuasan_item_survey_kemampuan_key').on(table.surveyId, table.kemampuan)],
);
