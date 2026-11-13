import { auditLogTable } from '../../../db/tables/audit-log.table';
import { db } from '../../../db/client';

type AuditAction = (typeof auditLogTable.action)['enumValues'][number];
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

type LogAppEventInput = {
  action: AuditAction;
  actorUserId: string | null;
  entityType?: string;
  entityId?: string;
  prodiId?: string;
  meta?: Record<string, unknown>;
};

export async function logAppEvent(tx: typeof db | Tx, input: LogAppEventInput): Promise<void> {
  await tx.insert(auditLogTable).values({
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    prodiId: input.prodiId,
    meta: input.meta,
  });
}
