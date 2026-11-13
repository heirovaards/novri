import { sql } from 'drizzle-orm';
import { boolean, date, integer, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { lkpsPeriodTable } from './lkps-period.table';
import { refOptionTable } from './ref-option.table';

export const uppsProgramTable = pgTable(
  'upps_program',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    periodId: uuid('period_id')
      .notNull()
      .references(() => lkpsPeriodTable.id),
    jenisProgram: text('jenis_program'),
    namaPs: text('nama_ps'),
    peringkatId: uuid('peringkat_id').references(() => refOptionTable.id),
    skNomor: text('sk_nomor'),
    skTanggal: date('sk_tanggal'),
    tanggalKadaluarsa: date('tanggal_kadaluarsa'),
    isSelf: boolean('is_self').notNull().default(false),
    jumlahMahasiswaTs: integer('jumlah_mahasiswa_ts'),
    ...workflowColumns(),
  },
  (table) => [uniqueIndex('upps_program_period_self_key').on(table.periodId).where(sql`${table.isSelf} and ${table.deletedAt} is null`)],
);
