import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { prodiTable } from './prodi.table';
import { academicYearTable } from './academic-year.table';
import { jalurMasukEnum } from '../enums/jalur-masuk.enum';
import { statusMahasiswaEnum } from '../enums/status-mahasiswa.enum';
import { timestampsColumns } from '../columns/timestamps-columns';

export const mahasiswaTable = pgTable(
  'mahasiswa',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    prodiId: uuid('prodi_id')
      .notNull()
      .references(() => prodiTable.id),
    nim: text('nim').notNull(),
    nama: text('nama').notNull(),
    angkatanYearId: uuid('angkatan_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    jalur: jalurMasukEnum('jalur').notNull(),
    isAfirmasi: boolean('is_afirmasi').notNull().default(false),
    isKebutuhanKhusus: boolean('is_kebutuhan_khusus').notNull().default(false),
    status: statusMahasiswaEnum('status').notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    ...timestampsColumns(),
  },
  (table) => [uniqueIndex('mahasiswa_prodi_nim_key').on(table.prodiId, table.nim), index('mahasiswa_angkatan_year_id_idx').on(table.angkatanYearId)],
);
