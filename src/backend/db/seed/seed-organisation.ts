import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { fakultasTable } from '../tables/fakultas.table';
import { prodiTable } from '../tables/prodi.table';
import { prodiSettingTable } from '../tables/prodi-setting.table';

export async function seedOrganisation(db: NodePgDatabase): Promise<void> {
  await db
    .insert(fakultasTable)
    .values({ kode: 'FBTI', nama: 'Fakultas Biosains, Teknologi, dan Inovasi' })
    .onConflictDoNothing({ target: fakultasTable.kode });
  const [fakultas] = await db.select({ id: fakultasTable.id }).from(fakultasTable).where(eq(fakultasTable.kode, 'FBTI')).limit(1);

  await db
    .insert(prodiTable)
    .values({ fakultasId: fakultas!.id, kode: 'SI', nama: 'Sistem Informasi', jenjang: 'S1' })
    .onConflictDoNothing({ target: prodiTable.kode });
  const [prodi] = await db.select({ id: prodiTable.id }).from(prodiTable).where(eq(prodiTable.kode, 'SI')).limit(1);

  await db
    .insert(prodiSettingTable)
    .values({ prodiId: prodi!.id, key: 'ewmp_sks_range', value: { min: 12, max: 16 } })
    .onConflictDoNothing({ target: [prodiSettingTable.prodiId, prodiSettingTable.key] });
}
