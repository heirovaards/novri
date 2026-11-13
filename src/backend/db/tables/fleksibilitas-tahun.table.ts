import { index, integer, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { fleksibilitasTable } from './fleksibilitas.table';
import { academicYearTable } from './academic-year.table';

export const fleksibilitasTahunTable = pgTable(
  'fleksibilitas_tahun',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fleksibilitasId: uuid('fleksibilitas_id')
      .notNull()
      .references(() => fleksibilitasTable.id),
    academicYearId: uuid('academic_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    jumlah: integer('jumlah').notNull(),
  },
  (table) => [
    uniqueIndex('fleksibilitas_tahun_fleksibilitas_academic_year_key').on(table.fleksibilitasId, table.academicYearId),
    index('fleksibilitas_tahun_academic_year_id_idx').on(table.academicYearId),
  ],
);
