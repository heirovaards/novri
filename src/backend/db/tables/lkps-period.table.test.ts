import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getTestDb } from '../../../../tests/helpers/get-test-db';
import { fakultasTable } from './fakultas.table';
import { prodiTable } from './prodi.table';
import { academicYearTable } from './academic-year.table';
import { lkpsPeriodTable } from './lkps-period.table';

const db = getTestDb();

let prodiId: string;
let yearOneId: string;
let yearTwoId: string;

beforeAll(async () => {
  const [fakultas] = await db.insert(fakultasTable).values({ kode: 'PERIOD-TEST', nama: 'Period Test Fakultas' }).returning({ id: fakultasTable.id });
  const [prodi] = await db
    .insert(prodiTable)
    .values({ fakultasId: fakultas!.id, kode: 'PERIOD-TEST', nama: 'Period Test Prodi', jenjang: 'S1' })
    .returning({ id: prodiTable.id });
  prodiId = prodi!.id;
  const [yearOne] = await db.insert(academicYearTable).values({ startYear: 2097, label: '2097/2098' }).returning({ id: academicYearTable.id });
  yearOneId = yearOne!.id;
  const [yearTwo] = await db.insert(academicYearTable).values({ startYear: 2096, label: '2096/2097' }).returning({ id: academicYearTable.id });
  yearTwoId = yearTwo!.id;
});

afterAll(async () => {
  await db.delete(lkpsPeriodTable).where(eq(lkpsPeriodTable.prodiId, prodiId));
  await db.delete(academicYearTable).where(eq(academicYearTable.startYear, 2097));
  await db.delete(academicYearTable).where(eq(academicYearTable.startYear, 2096));
  await db.delete(prodiTable).where(eq(prodiTable.kode, 'PERIOD-TEST'));
  await db.delete(fakultasTable).where(eq(fakultasTable.kode, 'PERIOD-TEST'));
});

describe('lkps_period partial unique (prodi_id) where status = open', () => {
  it('rejects a second open period for the same prodi', async () => {
    await db.insert(lkpsPeriodTable).values({ prodiId, tsYearId: yearOneId, status: 'open' });

    await expect(db.insert(lkpsPeriodTable).values({ prodiId, tsYearId: yearTwoId, status: 'open' })).rejects.toThrow();
  });
});
