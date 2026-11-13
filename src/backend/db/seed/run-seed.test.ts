import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { getTestDb } from '../../../../tests/helpers/get-test-db';
import { runSeed } from './run-seed';
import { fakultasTable } from '../tables/fakultas.table';
import { prodiTable } from '../tables/prodi.table';
import { academicYearTable } from '../tables/academic-year.table';
import { refOptionTable } from '../tables/ref-option.table';

const db = getTestDb();

async function countRows() {
  const [fakultas] = await db.select({ count: sql<number>`count(*)` }).from(fakultasTable);
  const [prodi] = await db.select({ count: sql<number>`count(*)` }).from(prodiTable);
  const [years] = await db.select({ count: sql<number>`count(*)` }).from(academicYearTable);
  const [refs] = await db.select({ count: sql<number>`count(*)` }).from(refOptionTable);
  return { fakultas: fakultas!.count, prodi: prodi!.count, years: years!.count, refs: refs!.count };
}

describe('runSeed', () => {
  it('produces the same row counts when run twice', async () => {
    await runSeed(db);
    const first = await countRows();

    await runSeed(db);
    const second = await countRows();

    expect(second).toEqual(first);
  });
});
