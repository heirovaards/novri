import { index, integer, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { rekognisiTable } from './rekognisi.table';
import { academicYearTable } from './academic-year.table';

export const rekognisiTahunTable = pgTable(
  'rekognisi_tahun',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    rekognisiId: uuid('rekognisi_id')
      .notNull()
      .references(() => rekognisiTable.id),
    academicYearId: uuid('academic_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    jumlah: integer('jumlah').notNull(),
  },
  (table) => [
    uniqueIndex('rekognisi_tahun_rekognisi_academic_year_key').on(table.rekognisiId, table.academicYearId),
    index('rekognisi_tahun_academic_year_id_idx').on(table.academicYearId),
  ],
);
