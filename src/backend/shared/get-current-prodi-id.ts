import { cache } from 'react';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { prodiTable } from '../db/tables/prodi.table';
import { DomainError } from './domain-error';

export const getCurrentProdiId = cache(async (): Promise<string> => {
  const kode = process.env.DEFAULT_PRODI_CODE;
  if (!kode) throw new DomainError('UNEXPECTED', 'DEFAULT_PRODI_CODE is not set');

  const [prodi] = await db.select({ id: prodiTable.id }).from(prodiTable).where(eq(prodiTable.kode, kode)).limit(1);
  if (!prodi) throw new DomainError('UNEXPECTED', `No prodi found with kode "${kode}"`);

  return prodi.id;
});
