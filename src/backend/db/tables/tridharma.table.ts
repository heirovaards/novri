import { index, integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { tridharmaKindEnum } from '../enums/tridharma-kind.enum';
import { lingkupEnum } from '../enums/lingkup.enum';
import { refOptionTable } from './ref-option.table';

export const tridharmaTable = pgTable(
  'tridharma',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kind: tridharmaKindEnum('kind').notNull(),
    judul: text('judul'),
    jenisHibahId: uuid('jenis_hibah_id').references(() => refOptionTable.id),
    sumberLingkup: lingkupEnum('sumber_lingkup'),
    durasiTahun: integer('durasi_tahun'),
    ...workflowColumns(),
  },
  (table) => [index('tridharma_jenis_hibah_id_idx').on(table.jenisHibahId)],
);
