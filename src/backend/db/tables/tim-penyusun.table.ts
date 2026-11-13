import { boolean, date, index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { lkpsPeriodTable } from './lkps-period.table';
import { dosenTable } from './dosen.table';

export const timPenyusunTable = pgTable(
  'tim_penyusun',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    periodId: uuid('period_id')
      .notNull()
      .references(() => lkpsPeriodTable.id),
    dosenId: uuid('dosen_id').references(() => dosenTable.id),
    nama: text('nama'),
    nidn: text('nidn'),
    jabatan: text('jabatan'),
    tanggalPengisian: date('tanggal_pengisian'),
    sudahTandaTangan: boolean('sudah_tanda_tangan').notNull().default(false),
    ...workflowColumns(),
  },
  (table) => [index('tim_penyusun_period_id_idx').on(table.periodId), index('tim_penyusun_dosen_id_idx').on(table.dosenId)],
);
