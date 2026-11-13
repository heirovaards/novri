import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { refOptionTable } from '../tables/ref-option.table';

const JABATAN_STRUKTURAL_SKS: Record<string, number> = {
  'Rektor/Direktur Politeknik': 12,
  'Wakil Rektor/Dekan/Ketua Sekolah Tinggi/Direktur Akademi': 10,
  'Ketua Lembaga/Kepala UPT': 8,
  'Wakil Dekan/Ketua Jurusan/Kepala Pusat/Ketua Senat': 6,
  'Sekretaris Jurusan/Kepala Lab/Ketua PS': 4,
  'Sekretaris PS': 3,
};

const REFERENCE_LISTS: Record<string, string[]> = {
  peringkat_akreditasi: ['Unggul', 'Baik Sekali', 'Baik', 'A', 'B', 'C', 'Terakreditasi Sementara', 'Belum Terakreditasi'],
  jabatan_struktural: Object.keys(JABATAN_STRUKTURAL_SKS),
  sumber_dana: ['Mahasiswa (SPP)', 'Yayasan', 'Hibah Pemerintah', 'Kerja Sama', 'Lainnya'],
  penggunaan_dana: ['Pendidikan', 'Penelitian', 'PkM', 'Investasi Sarana dan Prasarana', 'Pengembangan SDM', 'Operasional Lainnya'],
  jenis_tendik: ['Pustakawan', 'Laboran/Teknisi', 'Administrasi', 'Lainnya'],
  bentuk_pembelajaran: ['Micro-credensial', 'RPL tipe A-2', 'Pembelajaran di PS lain', 'Pembelajaran di PT lain', 'CBL/ PBL'],
  sumber_rekognisi: ['Masyarakat', 'Dunia Usaha', 'Dunia Industri', 'Dunia Kerja'],
  jenis_hibah: ['Hibah Internal PT', 'Hibah Kemdiktisaintek', 'Hibah Pemerintah Lainnya', 'Hibah Industri/Mitra', 'Hibah Luar Negeri', 'Mandiri'],
  jenis_hki: ['Hak Cipta', 'Paten', 'Paten Sederhana', 'Merek', 'Desain Industri', 'Rahasia Dagang', 'DTLST'],
  jenis_pengembangan_dtpr: ['Tugas Belajar', 'Sertifikasi Kompetensi', 'Pelatihan/Workshop', 'Magang Industri', 'Postdoctoral', 'Lainnya'],
  jenis_tata_kelola: ['Pendidikan', 'Keuangan', 'SDM', 'Sarana Prasarana', 'Sistem Penjaminan Mutu'],
  jenis_mitra: ['Perguruan Tinggi', 'Industri', 'Pemerintah', 'Komunitas', 'Lainnya'],
};

export async function seedReferenceLists(db: NodePgDatabase): Promise<void> {
  const rows = Object.entries(REFERENCE_LISTS).flatMap(([type, labels]) =>
    labels.map((label, index) => ({
      prodiId: null,
      type,
      label,
      sort: index + 1,
      active: true,
      meta: type === 'jabatan_struktural' ? { defaultSks: JABATAN_STRUKTURAL_SKS[label] } : null,
    })),
  );

  await db.insert(refOptionTable).values(rows).onConflictDoNothing({ target: [refOptionTable.type, refOptionTable.label] });
}
