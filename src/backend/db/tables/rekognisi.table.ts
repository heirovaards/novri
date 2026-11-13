import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { refOptionTable } from './ref-option.table';

export const rekognisiTable = pgTable(
  'rekognisi',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sumberId: uuid('sumber_id').references(() => refOptionTable.id),
    sumberCustom: text('sumber_custom'),
    jenisPengakuan: text('jenis_pengakuan'),
    ...workflowColumns(),
  },
  (table) => [index('rekognisi_sumber_id_idx').on(table.sumberId)],
);
