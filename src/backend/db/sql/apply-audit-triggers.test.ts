import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getTestDb } from '../../../../tests/helpers/get-test-db';
import { createTestUserRow } from '../../../../tests/helpers/create-test-user-row';
import { withActor } from '../../shared/with-actor';
import { applyAuditTriggers } from './apply-audit-triggers';
import { fakultasTable } from '../tables/fakultas.table';
import { prodiTable } from '../tables/prodi.table';
import { dosenTable } from '../tables/dosen.table';
import { danaTable } from '../tables/dana.table';
import { danaTahunTable } from '../tables/dana-tahun.table';
import { academicYearTable } from '../tables/academic-year.table';
import { auditLogTable } from '../tables/audit-log.table';

const db = getTestDb();

let prodiId: string;
let userId: string;
let academicYearId: string;

beforeAll(async () => {
  const [fakultas] = await db.insert(fakultasTable).values({ kode: 'AUDIT-TEST', nama: 'Audit Test Fakultas' }).returning({ id: fakultasTable.id });
  const [prodi] = await db
    .insert(prodiTable)
    .values({ fakultasId: fakultas!.id, kode: 'AUDIT-TEST', nama: 'Audit Test Prodi', jenjang: 'S1' })
    .returning({ id: prodiTable.id });
  prodiId = prodi!.id;
  userId = await createTestUserRow();

  const [year] = await db.insert(academicYearTable).values({ startYear: 2099, label: '2099/2100' }).returning({ id: academicYearTable.id });
  academicYearId = year!.id;
});

afterAll(async () => {
  await db.delete(academicYearTable).where(eq(academicYearTable.startYear, 2099));
  await db.delete(prodiTable).where(eq(prodiTable.kode, 'AUDIT-TEST'));
  await db.delete(fakultasTable).where(eq(fakultasTable.kode, 'AUDIT-TEST'));
});

describe('applyAuditTriggers', () => {
  it('is idempotent: running it twice does not duplicate triggers', async () => {
    await applyAuditTriggers(db);
    await applyAuditTriggers(db);

    const { rows } = await db.execute(sql`select count(*)::int as count from pg_trigger where tgname = 'trg_audit' and tgrelid = 'dosen'::regclass`);
    expect((rows[0] as { count: number }).count).toBe(1);
  });

  it('exists on every business table, and on none of the tables excluded by TRD §19.1', async () => {
    const { rows } = await db.execute(sql`select count(*)::int as count from pg_trigger where tgname = 'trg_audit'`);
    expect((rows[0] as { count: number }).count).toBe(60);

    for (const excluded of ['audit_log', 'session', 'verification', 'import_job', 'period_snapshot']) {
      const { rows: excludedRows } = await db.execute(
        sql`select count(*)::int as count from pg_trigger where tgname = 'trg_audit' and tgrelid = ${sql.raw(`'${excluded}'`)}::regclass`,
      );
      expect((excludedRows[0] as { count: number }).count).toBe(0);
    }
  });

  it('records insert, update and delete with actor, before/after JSON and prodi_id when run inside withActor', async () => {
    const dosenId = await withActor(userId, async (tx) => {
      const [dosen] = await tx.insert(dosenTable).values({ prodiId, nidn: '000AUDIT', nama: 'Dosen Audit' }).returning({ id: dosenTable.id });
      return dosen!.id;
    });

    await withActor(userId, async (tx) => {
      await tx.update(dosenTable).set({ nama: 'Dosen Audit Updated' }).where(eq(dosenTable.id, dosenId));
    });

    await withActor(userId, async (tx) => {
      await tx.delete(dosenTable).where(eq(dosenTable.id, dosenId));
    });

    const rows = await db
      .select()
      .from(auditLogTable)
      .where(eq(auditLogTable.entityId, dosenId))
      .orderBy(auditLogTable.at);

    expect(rows).toHaveLength(3);
    expect(rows[0]!.action).toBe('insert');
    expect(rows[0]!.actorUserId).toBe(userId);
    expect(rows[0]!.prodiId).toBe(prodiId);
    expect(rows[0]!.before).toBeNull();
    expect((rows[0]!.after as { nama: string }).nama).toBe('Dosen Audit');

    expect(rows[1]!.action).toBe('update');
    expect((rows[1]!.before as { nama: string }).nama).toBe('Dosen Audit');
    expect((rows[1]!.after as { nama: string }).nama).toBe('Dosen Audit Updated');

    expect(rows[2]!.action).toBe('delete');
    expect(rows[2]!.after).toBeNull();
  });

  it('records parent_entity_type and parent_entity_id for a child-table write', async () => {
    const danaId = await withActor(userId, async (tx) => {
      const [dana] = await tx.insert(danaTable).values({ prodiId, kind: 'sumber', labelCustom: 'Audit Test Dana' }).returning({ id: danaTable.id });
      return dana!.id;
    });

    await withActor(userId, async (tx) => {
      await tx.insert(danaTahunTable).values({ danaId, academicYearId, amountRp: 1000 });
    });

    const [row] = await db.select().from(auditLogTable).where(eq(auditLogTable.parentEntityId, danaId));

    expect(row!.entityType).toBe('dana_tahun');
    expect(row!.parentEntityType).toBe('dana');
    expect(row!.parentEntityId).toBe(danaId);

    await db.delete(danaTahunTable).where(eq(danaTahunTable.danaId, danaId));
    await db.delete(danaTable).where(eq(danaTable.id, danaId));
  });

  it('records a null actor for a write outside withActor', async () => {
    const [fakultas] = await db.insert(fakultasTable).values({ kode: 'AUDIT-NOACTOR', nama: 'No Actor Test' }).returning({ id: fakultasTable.id });

    const [row] = await db.select().from(auditLogTable).where(eq(auditLogTable.entityId, fakultas!.id));

    expect(row!.actorUserId).toBeNull();

    await db.delete(fakultasTable).where(eq(fakultasTable.id, fakultas!.id));
  });
});
