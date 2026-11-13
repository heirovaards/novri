import { index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { fileTable } from './file.table';
import { user } from '../auth-schema';

export const evidenceLinkTable = pgTable(
  'evidence_link',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fileId: uuid('file_id')
      .notNull()
      .references(() => fileTable.id),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    slot: text('slot').notNull().default('bukti'),
    createdBy: text('created_by').references(() => user.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('evidence_link_entity_slot_file_key').on(table.entityType, table.entityId, table.slot, table.fileId),
    index('evidence_link_entity_idx').on(table.entityType, table.entityId),
  ],
);
