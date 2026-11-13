import { index, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { lkpsPeriodTable } from './lkps-period.table';

export const spmiUnitTable = pgTable(
  'spmi_unit',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    periodId: uuid('period_id')
      .notNull()
      .references(() => lkpsPeriodTable.id),
    level: text('level'),
    levelCustom: text('level_custom'),
    nama: text('nama'),
    jumlahAuditor: integer('jumlah_auditor'),
    certified: integer('certified'),
    nonCertified: integer('non_certified'),
    frekuensiPerTahun: integer('frekuensi_per_tahun'),
    ...workflowColumns(),
  },
  (table) => [index('spmi_unit_period_id_idx').on(table.periodId)],
);
