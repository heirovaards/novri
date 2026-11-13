import { boolean, integer, jsonb, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { entryStatusEnum } from '../enums/entry-status.enum';
import { prodiTable } from '../tables/prodi.table';
import { dosenTable } from '../tables/dosen.table';
import { user } from '../auth-schema';

export function workflowColumns() {
  return {
    prodiId: uuid('prodi_id')
      .notNull()
      .references(() => prodiTable.id),
    ownerDosenId: uuid('owner_dosen_id').references(() => dosenTable.id),
    status: entryStatusEnum('status').notNull().default('draft'),
    returnNote: text('return_note'),
    warningNotes: jsonb('warning_notes'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    submittedBy: text('submitted_by').references(() => user.id),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    verifiedBy: text('verified_by').references(() => user.id),
    selfVerified: boolean('self_verified').notNull().default(false),
    createdBy: text('created_by').references(() => user.id),
    updatedBy: text('updated_by').references(() => user.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    rowVersion: integer('row_version').notNull().default(1),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  };
}
