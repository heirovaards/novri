import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getTestDb } from '../../../../tests/helpers/get-test-db';
import { fakultasTable } from './fakultas.table';
import { prodiTable } from './prodi.table';
import { dosenTable } from './dosen.table';
import { academicYearTable } from './academic-year.table';
import { ewmpTable } from './ewmp.table';

const db = getTestDb();

let prodiId: string;
let dosenId: string;
let academicYearId: string;

beforeAll(async () => {
  const [fakultas] = await db.insert(fakultasTable).values({ kode: 'EWMP-TEST', nama: 'EWMP Test Fakultas' }).returning({ id: fakultasTable.id });
  const [prodi] = await db
    .insert(prodiTable)
    .values({ fakultasId: fakultas!.id, kode: 'EWMP-TEST', nama: 'EWMP Test Prodi', jenjang: 'S1' })
    .returning({ id: prodiTable.id });
  prodiId = prodi!.id;
  const [dosen] = await db.insert(dosenTable).values({ prodiId, nidn: '000EWMP', nama: 'Dosen EWMP Test' }).returning({ id: dosenTable.id });
  dosenId = dosen!.id;
  const [year] = await db.insert(academicYearTable).values({ startYear: 2098, label: '2098/2099' }).returning({ id: academicYearTable.id });
  academicYearId = year!.id;
});

afterAll(async () => {
  await db.delete(ewmpTable).where(eq(ewmpTable.dosenId, dosenId));
  await db.delete(academicYearTable).where(eq(academicYearTable.startYear, 2098));
  await db.delete(dosenTable).where(eq(dosenTable.id, dosenId));
  await db.delete(prodiTable).where(eq(prodiTable.kode, 'EWMP-TEST'));
  await db.delete(fakultasTable).where(eq(fakultasTable.kode, 'EWMP-TEST'));
});

describe('ewmp partial unique (dosen_id, academic_year_id) where deleted_at is null', () => {
  it('rejects a second live row for the same dosen and year, then accepts one after the first is soft-deleted', async () => {
    const [first] = await db.insert(ewmpTable).values({ dosenId, academicYearId, prodiId }).returning({ id: ewmpTable.id });

    await expect(db.insert(ewmpTable).values({ dosenId, academicYearId, prodiId })).rejects.toThrow();

    await db.update(ewmpTable).set({ deletedAt: new Date() }).where(eq(ewmpTable.id, first!.id));

    const [second] = await db.insert(ewmpTable).values({ dosenId, academicYearId, prodiId }).returning({ id: ewmpTable.id });
    expect(second!.id).not.toBe(first!.id);

    await db.delete(ewmpTable).where(eq(ewmpTable.id, second!.id));
  });
});
