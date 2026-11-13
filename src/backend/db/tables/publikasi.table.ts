import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { dosenTable } from './dosen.table';
import { jenisPublikasiEnum } from '../enums/jenis-publikasi.enum';
import { academicYearTable } from './academic-year.table';
import { tridharmaTable } from './tridharma.table';

export const publikasiTable = pgTable(
  'publikasi',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    dosenId: uuid('dosen_id')
      .notNull()
      .references(() => dosenTable.id),
    judul: text('judul'),
    jenis: jenisPublikasiEnum('jenis'),
    academicYearId: uuid('academic_year_id')
      .notNull()
      .references(() => academicYearTable.id),
    tridharmaId: uuid('tridharma_id').references(() => tridharmaTable.id),
    urlDoi: text('url_doi'),
    ...workflowColumns(),
  },
  (table) => [
    index('publikasi_dosen_id_idx').on(table.dosenId),
    index('publikasi_academic_year_id_idx').on(table.academicYearId),
    index('publikasi_tridharma_id_idx').on(table.tridharmaId),
  ],
);
