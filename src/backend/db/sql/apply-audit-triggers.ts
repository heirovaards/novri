import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

type AuditedTable = { name: string; parent?: { fkColumn: string; parentTable: string } };

// Every business table except audit_log, session, verification, import_job, period_snapshot (TRD §19.1).
// Workflow-entity child tables pass their parent so audit_log can record parent_entity_type/parent_entity_id.
const AUDITED_TABLES: AuditedTable[] = [
  { name: 'fakultas' },
  { name: 'prodi' },
  { name: 'academic_year' },
  { name: 'lkps_period' },
  { name: 'period_attachment' },
  { name: 'period_table_flag' },
  { name: 'ref_option' },
  { name: 'prodi_setting' },
  { name: 'user' },
  { name: 'account' },
  { name: 'user_role' },
  { name: 'user_dosen' },
  { name: 'dosen' },
  { name: 'dosen_year' },
  { name: 'mahasiswa' },
  { name: 'mitra' },
  { name: 'mata_kuliah' },
  { name: 'mk_dosen' },
  { name: 'profil_lulusan' },
  { name: 'cpl' },
  { name: 'cpmk' },
  { name: 'mk_pl' },
  { name: 'cpl_pl' },
  { name: 'cpmk_mk' },
  { name: 'identitas_pengusul' },
  { name: 'upps_program' },
  { name: 'tim_penyusun' },
  { name: 'pimpinan_unit' },
  { name: 'dana' },
  { name: 'dana_tahun', parent: { fkColumn: 'dana_id', parentTable: 'dana' } },
  { name: 'ewmp' },
  { name: 'tendik_kualifikasi' },
  { name: 'spmi_unit' },
  { name: 'mhs_data' },
  { name: 'mhs_asal' },
  { name: 'mhs_asal_tahun', parent: { fkColumn: 'mhs_asal_id', parentTable: 'mhs_asal' } },
  { name: 'mhs_kondisi' },
  { name: 'kurikulum_pemetaan' },
  { name: 'lulusan' },
  { name: 'kepuasan_survey' },
  { name: 'kepuasan_item', parent: { fkColumn: 'survey_id', parentTable: 'kepuasan_survey' } },
  { name: 'fleksibilitas' },
  { name: 'fleksibilitas_tahun', parent: { fkColumn: 'fleksibilitas_id', parentTable: 'fleksibilitas' } },
  { name: 'rekognisi' },
  { name: 'rekognisi_tahun', parent: { fkColumn: 'rekognisi_id', parentTable: 'rekognisi' } },
  { name: 'prasarana' },
  { name: 'tridharma' },
  { name: 'tridharma_dosen', parent: { fkColumn: 'tridharma_id', parentTable: 'tridharma' } },
  { name: 'tridharma_mahasiswa', parent: { fkColumn: 'tridharma_id', parentTable: 'tridharma' } },
  { name: 'tridharma_dana', parent: { fkColumn: 'tridharma_id', parentTable: 'tridharma' } },
  { name: 'pengembangan_dtpr' },
  { name: 'kerjasama' },
  { name: 'kerjasama_dana', parent: { fkColumn: 'kerjasama_id', parentTable: 'kerjasama' } },
  { name: 'publikasi' },
  { name: 'diseminasi' },
  { name: 'hki' },
  { name: 'tata_kelola' },
  { name: 'visi_misi' },
  { name: 'file' },
  { name: 'evidence_link' },
];

export async function applyAuditTriggers(db: NodePgDatabase): Promise<void> {
  const functionSql = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'audit-trigger.sql'), 'utf8');
  await db.execute(sql.raw(functionSql));

  for (const table of AUDITED_TABLES) {
    const quotedTable = sql.identifier(table.name);
    await db.execute(sql`drop trigger if exists trg_audit on ${quotedTable}`);
    const args = table.parent
      ? sql`audit_row(${sql.raw(`'${table.parent.fkColumn}'`)}, ${sql.raw(`'${table.parent.parentTable}'`)})`
      : sql`audit_row()`;
    await db.execute(sql`create trigger trg_audit after insert or update or delete on ${quotedTable} for each row execute function ${args}`);
  }
}

async function runDirectly() {
  const { db } = await import('../client');
  await applyAuditTriggers(db);
  console.log(`Applied audit triggers to ${AUDITED_TABLES.length} tables.`);
  process.exit(0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void runDirectly();
}
