import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { lkpsPeriodTable } from './lkps-period.table';
import { refOptionTable } from './ref-option.table';
import { aksesSistemEnum } from '../enums/akses-sistem.enum';

export const tataKelolaTable = pgTable(
  'tata_kelola',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    periodId: uuid('period_id')
      .notNull()
      .references(() => lkpsPeriodTable.id),
    jenisId: uuid('jenis_id').references(() => refOptionTable.id),
    jenisCustom: text('jenis_custom'),
    namaSistem: text('nama_sistem'),
    akses: aksesSistemEnum('akses'),
    unitPengelola: text('unit_pengelola'),
    ...workflowColumns(),
  },
  (table) => [index('tata_kelola_period_id_idx').on(table.periodId), index('tata_kelola_jenis_id_idx').on(table.jenisId)],
);
