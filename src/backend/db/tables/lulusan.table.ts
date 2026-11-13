import { sql } from 'drizzle-orm';
import { integer, numeric, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { academicYearTable } from './academic-year.table';

export const lulusanTable = pgTable(
  'lulusan',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    academicYearId: uuid('academic_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    jumlahLulusan: integer('jumlah_lulusan'),
    jumlahTerlacak: integer('jumlah_terlacak'),
    rataTungguBulan: numeric('rata_tunggu_bulan', { precision: 8, scale: 2 }),
    infokom: integer('infokom'),
    nonInfokom: integer('non_infokom'),
    multinasional: integer('multinasional'),
    nasional: integer('nasional'),
    wirausaha: integer('wirausaha'),
    ...workflowColumns(),
  },
  (table) => [uniqueIndex('lulusan_prodi_academic_year_key').on(table.prodiId, table.academicYearId).where(sql`${table.deletedAt} is null`)],
);
