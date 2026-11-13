import { boolean, index, integer, jsonb, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { prodiTable } from './prodi.table';

export const refOptionTable = pgTable(
  'ref_option',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    prodiId: uuid('prodi_id').references(() => prodiTable.id),
    type: text('type').notNull(),
    label: text('label').notNull(),
    sort: integer('sort').notNull(),
    active: boolean('active').notNull().default(true),
    meta: jsonb('meta'),
  },
  (table) => [uniqueIndex('ref_option_type_label_key').on(table.type, table.label), index('ref_option_prodi_id_idx').on(table.prodiId)],
);
