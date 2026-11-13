import { sql } from 'drizzle-orm';
import { date, integer, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { lkpsPeriodTable } from './lkps-period.table';
import { refOptionTable } from './ref-option.table';

export const identitasPengusulTable = pgTable(
  'identitas_pengusul',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    periodId: uuid('period_id')
      .notNull()
      .references(() => lkpsPeriodTable.id),
    perguruanTinggi: text('perguruan_tinggi'),
    upps: text('upps'),
    jenisProgram: text('jenis_program'),
    namaPs: text('nama_ps'),
    alamat: text('alamat'),
    telepon: text('telepon'),
    email: text('email'),
    website: text('website'),
    skPtNomor: text('sk_pt_nomor'),
    skPtTanggal: date('sk_pt_tanggal'),
    skPtPejabat: text('sk_pt_pejabat'),
    skPsNomor: text('sk_ps_nomor'),
    skPsTanggal: date('sk_ps_tanggal'),
    skPsPejabat: text('sk_ps_pejabat'),
    tahunPertama: integer('tahun_pertama'),
    peringkatId: uuid('peringkat_id').references(() => refOptionTable.id),
    skAkreditasiNomor: text('sk_akreditasi_nomor'),
    ...workflowColumns(),
  },
  (table) => [uniqueIndex('identitas_pengusul_period_key').on(table.periodId).where(sql`${table.deletedAt} is null`)],
);
