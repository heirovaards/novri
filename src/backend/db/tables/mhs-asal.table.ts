import { sql } from 'drizzle-orm';
import { pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { asalMahasiswaEnum } from '../enums/asal-mahasiswa.enum';

export const mhsAsalTable = pgTable(
  'mhs_asal',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kategori: asalMahasiswaEnum('kategori').notNull(),
    rincian: text('rincian'),
    ...workflowColumns(),
  },
  (table) => [
    uniqueIndex('mhs_asal_prodi_kategori_rincian_key')
      .on(table.prodiId, table.kategori, sql`lower(coalesce(${table.rincian}, ''))`)
      .where(sql`${table.deletedAt} is null`),
  ],
);
