import { bigserial, index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { auditActionEnum } from '../enums/audit-action.enum';
import { user } from '../auth-schema';

export const auditLogTable = pgTable(
  'audit_log',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
    actorUserId: text('actor_user_id').references(() => user.id),
    action: auditActionEnum('action').notNull(),
    entityType: text('entity_type'),
    entityId: text('entity_id'),
    parentEntityType: text('parent_entity_type'),
    parentEntityId: text('parent_entity_id'),
    prodiId: uuid('prodi_id'),
    before: jsonb('before'),
    after: jsonb('after'),
    meta: jsonb('meta'),
  },
  (table) => [
    index('audit_log_entity_idx').on(table.entityType, table.entityId, table.at.desc()),
    index('audit_log_parent_entity_idx').on(table.parentEntityType, table.parentEntityId, table.at.desc()),
    index('audit_log_at_idx').on(table.at),
  ],
);
