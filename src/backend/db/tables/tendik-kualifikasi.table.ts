import { sql } from 'drizzle-orm';
import { index, integer, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { academicYearTable } from './academic-year.table';
import { refOptionTable } from './ref-option.table';

export const tendikKualifikasiTable = pgTable(
  'tendik_kualifikasi',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    academicYearId: uuid('academic_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    jenisId: uuid('jenis_id')
      .notNull()
      .references(() => refOptionTable.id),
    nS3: integer('n_s3'),
    nS2: integer('n_s2'),
    nS1: integer('n_s1'),
    nD4: integer('n_d4'),
    nD3: integer('n_d3'),
    nD2: integer('n_d2'),
    nD1: integer('n_d1'),
    nSma: integer('n_sma'),
    unitKerja: text('unit_kerja'),
    ...workflowColumns(),
  },
  (table) => [
    uniqueIndex('tendik_kualifikasi_prodi_year_jenis_key')
      .on(table.prodiId, table.academicYearId, table.jenisId)
      .where(sql`${table.deletedAt} is null`),
    index('tendik_kualifikasi_jenis_id_idx').on(table.jenisId),
  ],
);
