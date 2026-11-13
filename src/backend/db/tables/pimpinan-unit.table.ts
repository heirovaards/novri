import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { lkpsPeriodTable } from './lkps-period.table';
import { dosenTable } from './dosen.table';

export const pimpinanUnitTable = pgTable(
  'pimpinan_unit',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    periodId: uuid('period_id')
      .notNull()
      .references(() => lkpsPeriodTable.id),
    unitKerja: text('unit_kerja'),
    dosenId: uuid('dosen_id').references(() => dosenTable.id),
    namaKetua: text('nama_ketua'),
    periodeJabatan: text('periode_jabatan'),
    pendidikanTerakhir: text('pendidikan_terakhir'),
    jabatanFungsional: text('jabatan_fungsional'),
    tupoksi: text('tupoksi'),
    ...workflowColumns(),
  },
  (table) => [index('pimpinan_unit_period_id_idx').on(table.periodId), index('pimpinan_unit_dosen_id_idx').on(table.dosenId)],
);
