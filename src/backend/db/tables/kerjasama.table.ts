import { index, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { tridharmaKindEnum } from '../enums/tridharma-kind.enum';
import { lingkupEnum } from '../enums/lingkup.enum';
import { mitraTable } from './mitra.table';

export const kerjasamaTable = pgTable(
  'kerjasama',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kind: tridharmaKindEnum('kind').notNull(),
    judul: text('judul'),
    mitraId: uuid('mitra_id').references(() => mitraTable.id),
    sumberLingkup: lingkupEnum('sumber_lingkup'),
    durasiTahun: integer('durasi_tahun'),
    ...workflowColumns(),
  },
  (table) => [index('kerjasama_mitra_id_idx').on(table.mitraId)],
);
