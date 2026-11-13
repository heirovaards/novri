import { sql } from 'drizzle-orm';
import { integer, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { academicYearTable } from './academic-year.table';

export const mhsDataTable = pgTable(
  'mhs_data',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    academicYearId: uuid('academic_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    dayaTampung: integer('daya_tampung'),
    pendaftar: integer('pendaftar'),
    pendaftarAfirmasi: integer('pendaftar_afirmasi'),
    pendaftarKk: integer('pendaftar_kk'),
    baruRegDiterima: integer('baru_reg_diterima'),
    baruRegAfirmasi: integer('baru_reg_afirmasi'),
    baruRegKk: integer('baru_reg_kk'),
    baruRplDiterima: integer('baru_rpl_diterima'),
    baruRplAfirmasi: integer('baru_rpl_afirmasi'),
    baruRplKk: integer('baru_rpl_kk'),
    aktifRegDiterima: integer('aktif_reg_diterima'),
    aktifRegAfirmasi: integer('aktif_reg_afirmasi'),
    aktifRegKk: integer('aktif_reg_kk'),
    aktifRplDiterima: integer('aktif_rpl_diterima'),
    aktifRplAfirmasi: integer('aktif_rpl_afirmasi'),
    aktifRplKk: integer('aktif_rpl_kk'),
    ...workflowColumns(),
  },
  (table) => [uniqueIndex('mhs_data_prodi_academic_year_key').on(table.prodiId, table.academicYearId).where(sql`${table.deletedAt} is null`)],
);
