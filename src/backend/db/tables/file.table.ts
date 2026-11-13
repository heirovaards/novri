import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { prodiTable } from './prodi.table';
import { user } from '../auth-schema';

export const fileTable = pgTable(
  'file',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    prodiId: uuid('prodi_id')
      .notNull()
      .references(() => prodiTable.id),
    storageKey: text('storage_key').notNull(),
    originalName: text('original_name').notNull(),
    mime: text('mime').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    sha256: text('sha256').notNull(),
    uploadedBy: text('uploaded_by').references(() => user.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('file_prodi_sha256_key').on(table.prodiId, table.sha256), index('file_prodi_id_idx').on(table.prodiId)],
);
