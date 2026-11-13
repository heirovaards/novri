import { sql } from 'drizzle-orm';
import { index, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { danaKindEnum } from '../enums/dana-kind.enum';
import { refOptionTable } from './ref-option.table';

export const danaTable = pgTable(
  'dana',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kind: danaKindEnum('kind').notNull(),
    kategoriId: uuid('kategori_id').references(() => refOptionTable.id),
    labelCustom: text('label_custom'),
    ...workflowColumns(),
  },
  (table) => [
    uniqueIndex('dana_prodi_kind_kategori_key')
      .on(table.prodiId, table.kind, table.kategoriId)
      .where(sql`${table.deletedAt} is null`),
    uniqueIndex('dana_prodi_kind_label_key')
      .on(table.prodiId, table.kind, sql`lower(${table.labelCustom})`)
      .where(sql`${table.deletedAt} is null`),
    index('dana_kategori_id_idx').on(table.kategoriId),
  ],
);
