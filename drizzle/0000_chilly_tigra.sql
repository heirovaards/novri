CREATE TYPE "public"."akses_sistem" AS ENUM('lokal', 'internet');--> statement-breakpoint
CREATE TYPE "public"."asal_mahasiswa" AS ENUM('kota_sama', 'kota_lain', 'provinsi_lain', 'negara_lain', 'afirmasi', 'kebutuhan_khusus');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('insert', 'update', 'delete', 'login', 'logout', 'login_failed', 'submit', 'verify', 'return', 'import', 'export', 'period_create', 'period_lock', 'period_reopen', 'nihil_set', 'nihil_clear', 'user_create', 'user_update', 'user_deactivate', 'user_activate', 'password_reset');--> statement-breakpoint
CREATE TYPE "public"."dana_kind" AS ENUM('sumber', 'penggunaan');--> statement-breakpoint
CREATE TYPE "public"."entry_status" AS ENUM('draft', 'submitted', 'verified', 'returned');--> statement-breakpoint
CREATE TYPE "public"."jalur_masuk" AS ENUM('reguler', 'rpl');--> statement-breakpoint
CREATE TYPE "public"."jenis_publikasi" AS ENUM('IB', 'I', 'S1', 'S2', 'S3', 'S4', 'T');--> statement-breakpoint
CREATE TYPE "public"."kepemilikan" AS ENUM('M', 'W');--> statement-breakpoint
CREATE TYPE "public"."lingkup" AS ENUM('L', 'N', 'I');--> statement-breakpoint
CREATE TYPE "public"."lisensi" AS ENUM('L', 'P', 'T');--> statement-breakpoint
CREATE TYPE "public"."peran_tridharma" AS ENUM('ketua', 'anggota');--> statement-breakpoint
CREATE TYPE "public"."period_attachment_kind" AS ENUM('org_chart', 'roadmap_penelitian', 'roadmap_pkm', 'sk_pendirian', 'sk_pembukaan', 'sk_akreditasi');--> statement-breakpoint
CREATE TYPE "public"."period_status" AS ENUM('open', 'locked');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin_sistem', 'kaprodi', 'admin_prodi', 'dtpr', 'dosen');--> statement-breakpoint
CREATE TYPE "public"."status_mahasiswa" AS ENUM('aktif', 'lulus', 'cuti', 'mengundurkan_diri', 'do');--> statement-breakpoint
CREATE TYPE "public"."tridharma_kind" AS ENUM('penelitian', 'pkm');--> statement-breakpoint
CREATE TABLE "academic_year" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"start_year" integer NOT NULL,
	"label" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_user_id" text,
	"action" "audit_action" NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"parent_entity_type" text,
	"parent_entity_id" text,
	"prodi_id" uuid,
	"before" jsonb,
	"after" jsonb,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE "cpl_pl" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cpl_id" uuid NOT NULL,
	"profil_lulusan_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cpl" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prodi_id" uuid NOT NULL,
	"kode" text NOT NULL,
	"deskripsi" text NOT NULL,
	"sort" integer NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cpmk_mk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cpmk_id" uuid NOT NULL,
	"mata_kuliah_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cpmk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cpl_id" uuid NOT NULL,
	"kode" text NOT NULL,
	"deskripsi" text NOT NULL,
	"sort" integer NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "dana_tahun" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dana_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"amount_rp" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dana" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "dana_kind" NOT NULL,
	"kategori_id" uuid,
	"label_custom" text,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "diseminasi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tridharma_id" uuid NOT NULL,
	"lingkup" "lingkup",
	"academic_year_id" uuid NOT NULL,
	"bentuk" text,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "dosen_year" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dosen_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"is_dtpr" boolean DEFAULT false NOT NULL,
	"jabatan_struktural_id" uuid
);
--> statement-breakpoint
CREATE TABLE "dosen" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prodi_id" uuid NOT NULL,
	"nidn" text NOT NULL,
	"nama" text NOT NULL,
	"pendidikan_terakhir" text,
	"jabatan_fungsional" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_link" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"slot" text DEFAULT 'bukti' NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ewmp" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dosen_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"sks_ps_sendiri" numeric(8, 2),
	"sks_ps_lain_pt_sendiri" numeric(8, 2),
	"sks_pt_lain" numeric(8, 2),
	"sks_penelitian" numeric(8, 2),
	"sks_pkm" numeric(8, 2),
	"sks_man_pt_sendiri" numeric(8, 2),
	"sks_man_pt_lain" numeric(8, 2),
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "fakultas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kode" text NOT NULL,
	"nama" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prodi_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"original_name" text NOT NULL,
	"mime" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"sha256" text NOT NULL,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fleksibilitas_tahun" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fleksibilitas_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"jumlah" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fleksibilitas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bentuk_id" uuid,
	"label_custom" text,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hki" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "tridharma_kind" NOT NULL,
	"judul" text,
	"jenis_id" uuid,
	"dosen_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"tridharma_id" uuid,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "identitas_pengusul" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_id" uuid NOT NULL,
	"perguruan_tinggi" text,
	"upps" text,
	"jenis_program" text,
	"nama_ps" text,
	"alamat" text,
	"telepon" text,
	"email" text,
	"website" text,
	"sk_pt_nomor" text,
	"sk_pt_tanggal" date,
	"sk_pt_pejabat" text,
	"sk_ps_nomor" text,
	"sk_ps_tanggal" date,
	"sk_ps_pejabat" text,
	"tahun_pertama" integer,
	"peringkat_id" uuid,
	"sk_akreditasi_nomor" text,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "import_job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prodi_id" uuid NOT NULL,
	"entity" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kepuasan_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"kemampuan" text NOT NULL,
	"pct_sangat_baik" numeric(5, 2),
	"pct_baik" numeric(5, 2),
	"pct_cukup" numeric(5, 2),
	"pct_kurang" numeric(5, 2),
	"rencana_tindak_lanjut" text
);
--> statement-breakpoint
CREATE TABLE "kepuasan_survey" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"jumlah_responden" integer,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "kerjasama_dana" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kerjasama_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"amount_rp" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kerjasama" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "tridharma_kind" NOT NULL,
	"judul" text,
	"mitra_id" uuid,
	"sumber_lingkup" "lingkup",
	"durasi_tahun" integer,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "kurikulum_pemetaan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_id" uuid NOT NULL,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lkps_period" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prodi_id" uuid NOT NULL,
	"ts_year_id" uuid NOT NULL,
	"status" "period_status" DEFAULT 'open' NOT NULL,
	"instrument_version" text DEFAULT '2.1' NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"locked_by" text,
	"locked_at" timestamp with time zone,
	"reopened_by" text,
	"reopened_at" timestamp with time zone,
	"reopen_reason" text
);
--> statement-breakpoint
CREATE TABLE "lulusan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"jumlah_lulusan" integer,
	"jumlah_terlacak" integer,
	"rata_tunggu_bulan" numeric(8, 2),
	"infokom" integer,
	"non_infokom" integer,
	"multinasional" integer,
	"nasional" integer,
	"wirausaha" integer,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mahasiswa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prodi_id" uuid NOT NULL,
	"nim" text NOT NULL,
	"nama" text NOT NULL,
	"angkatan_year_id" uuid NOT NULL,
	"jalur" "jalur_masuk" NOT NULL,
	"is_afirmasi" boolean DEFAULT false NOT NULL,
	"is_kebutuhan_khusus" boolean DEFAULT false NOT NULL,
	"status" "status_mahasiswa" NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mata_kuliah" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prodi_id" uuid NOT NULL,
	"kode" text NOT NULL,
	"nama" text NOT NULL,
	"sks" integer NOT NULL,
	"semester" integer NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mhs_asal_tahun" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mhs_asal_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"jumlah" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mhs_asal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kategori" "asal_mahasiswa" NOT NULL,
	"rincian" text,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mhs_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"daya_tampung" integer,
	"pendaftar" integer,
	"pendaftar_afirmasi" integer,
	"pendaftar_kk" integer,
	"baru_reg_diterima" integer,
	"baru_reg_afirmasi" integer,
	"baru_reg_kk" integer,
	"baru_rpl_diterima" integer,
	"baru_rpl_afirmasi" integer,
	"baru_rpl_kk" integer,
	"aktif_reg_diterima" integer,
	"aktif_reg_afirmasi" integer,
	"aktif_reg_kk" integer,
	"aktif_rpl_diterima" integer,
	"aktif_rpl_afirmasi" integer,
	"aktif_rpl_kk" integer,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mhs_kondisi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_id" uuid NOT NULL,
	"cohort_year_id" uuid NOT NULL,
	"aktif_ts" integer,
	"lulus_ts" integer,
	"do_ts" integer,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mitra" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prodi_id" uuid NOT NULL,
	"nama" text NOT NULL,
	"jenis_id" uuid,
	"negara" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mk_dosen" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mata_kuliah_id" uuid NOT NULL,
	"dosen_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mk_pl" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mata_kuliah_id" uuid NOT NULL,
	"profil_lulusan_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pengembangan_dtpr" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dosen_id" uuid NOT NULL,
	"jenis_id" uuid,
	"academic_year_id" uuid NOT NULL,
	"keterangan" text,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "period_attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_id" uuid NOT NULL,
	"kind" "period_attachment_kind" NOT NULL,
	"file_id" uuid NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "period_snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_id" uuid NOT NULL,
	"seq" integer NOT NULL,
	"compiled" jsonb NOT NULL,
	"export_file_id" uuid,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "period_table_flag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_id" uuid NOT NULL,
	"table_code" text NOT NULL,
	"is_nihil" boolean DEFAULT false NOT NULL,
	"note" text,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pimpinan_unit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_id" uuid NOT NULL,
	"unit_kerja" text,
	"dosen_id" uuid,
	"nama_ketua" text,
	"periode_jabatan" text,
	"pendidikan_terakhir" text,
	"jabatan_fungsional" text,
	"tupoksi" text,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "prasarana" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" text,
	"daya_tampung" integer,
	"luas_m2" numeric(8, 2),
	"kepemilikan" "kepemilikan",
	"lisensi" "lisensi",
	"perangkat" text,
	"use_penelitian" boolean DEFAULT false NOT NULL,
	"use_pkm" boolean DEFAULT false NOT NULL,
	"use_pendidikan" boolean DEFAULT false NOT NULL,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "prodi_setting" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prodi_id" uuid NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prodi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fakultas_id" uuid NOT NULL,
	"kode" text NOT NULL,
	"nama" text NOT NULL,
	"jenjang" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profil_lulusan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prodi_id" uuid NOT NULL,
	"kode" text NOT NULL,
	"deskripsi" text NOT NULL,
	"sort" integer NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "publikasi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dosen_id" uuid NOT NULL,
	"judul" text,
	"jenis" "jenis_publikasi",
	"academic_year_id" uuid NOT NULL,
	"tridharma_id" uuid,
	"url_doi" text,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ref_option" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prodi_id" uuid,
	"type" text NOT NULL,
	"label" text NOT NULL,
	"sort" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"meta" jsonb
);
--> statement-breakpoint
CREATE TABLE "rekognisi_tahun" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rekognisi_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"jumlah" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rekognisi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sumber_id" uuid,
	"sumber_custom" text,
	"jenis_pengakuan" text,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "spmi_unit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_id" uuid NOT NULL,
	"level" text,
	"level_custom" text,
	"nama" text,
	"jumlah_auditor" integer,
	"certified" integer,
	"non_certified" integer,
	"frekuensi_per_tahun" integer,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tata_kelola" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_id" uuid NOT NULL,
	"jenis_id" uuid,
	"jenis_custom" text,
	"nama_sistem" text,
	"akses" "akses_sistem",
	"unit_pengelola" text,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tendik_kualifikasi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"jenis_id" uuid NOT NULL,
	"n_s3" integer,
	"n_s2" integer,
	"n_s1" integer,
	"n_d4" integer,
	"n_d3" integer,
	"n_d2" integer,
	"n_d1" integer,
	"n_sma" integer,
	"unit_kerja" text,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tim_penyusun" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_id" uuid NOT NULL,
	"dosen_id" uuid,
	"nama" text,
	"nidn" text,
	"jabatan" text,
	"tanggal_pengisian" date,
	"sudah_tanda_tangan" boolean DEFAULT false NOT NULL,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tridharma_dana" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tridharma_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"amount_rp" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tridharma_dosen" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tridharma_id" uuid NOT NULL,
	"dosen_id" uuid NOT NULL,
	"peran" "peran_tridharma" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tridharma_mahasiswa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tridharma_id" uuid NOT NULL,
	"mahasiswa_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tridharma" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "tridharma_kind" NOT NULL,
	"judul" text,
	"jenis_hibah_id" uuid,
	"sumber_lingkup" "lingkup",
	"durasi_tahun" integer,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "upps_program" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_id" uuid NOT NULL,
	"jenis_program" text,
	"nama_ps" text,
	"peringkat_id" uuid,
	"sk_nomor" text,
	"sk_tanggal" date,
	"tanggal_kadaluarsa" date,
	"is_self" boolean DEFAULT false NOT NULL,
	"jumlah_mahasiswa_ts" integer,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_dosen" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"dosen_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"prodi_id" uuid NOT NULL,
	"role" "role" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visi_misi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period_id" uuid NOT NULL,
	"visi_pt" text,
	"visi_upps" text,
	"visi_keilmuan_ps" text,
	"misi_pt" text,
	"misi_upps" text,
	"prodi_id" uuid NOT NULL,
	"owner_dosen_id" uuid,
	"status" "entry_status" DEFAULT 'draft' NOT NULL,
	"return_note" text,
	"warning_notes" jsonb,
	"submitted_at" timestamp with time zone,
	"submitted_by" text,
	"verified_at" timestamp with time zone,
	"verified_by" text,
	"self_verified" boolean DEFAULT false NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"row_version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"must_change_password" boolean DEFAULT true,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpl_pl" ADD CONSTRAINT "cpl_pl_cpl_id_cpl_id_fk" FOREIGN KEY ("cpl_id") REFERENCES "public"."cpl"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpl_pl" ADD CONSTRAINT "cpl_pl_profil_lulusan_id_profil_lulusan_id_fk" FOREIGN KEY ("profil_lulusan_id") REFERENCES "public"."profil_lulusan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpl" ADD CONSTRAINT "cpl_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpmk_mk" ADD CONSTRAINT "cpmk_mk_cpmk_id_cpmk_id_fk" FOREIGN KEY ("cpmk_id") REFERENCES "public"."cpmk"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpmk_mk" ADD CONSTRAINT "cpmk_mk_mata_kuliah_id_mata_kuliah_id_fk" FOREIGN KEY ("mata_kuliah_id") REFERENCES "public"."mata_kuliah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cpmk" ADD CONSTRAINT "cpmk_cpl_id_cpl_id_fk" FOREIGN KEY ("cpl_id") REFERENCES "public"."cpl"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dana_tahun" ADD CONSTRAINT "dana_tahun_dana_id_dana_id_fk" FOREIGN KEY ("dana_id") REFERENCES "public"."dana"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dana_tahun" ADD CONSTRAINT "dana_tahun_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dana" ADD CONSTRAINT "dana_kategori_id_ref_option_id_fk" FOREIGN KEY ("kategori_id") REFERENCES "public"."ref_option"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dana" ADD CONSTRAINT "dana_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dana" ADD CONSTRAINT "dana_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dana" ADD CONSTRAINT "dana_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dana" ADD CONSTRAINT "dana_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dana" ADD CONSTRAINT "dana_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dana" ADD CONSTRAINT "dana_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diseminasi" ADD CONSTRAINT "diseminasi_tridharma_id_tridharma_id_fk" FOREIGN KEY ("tridharma_id") REFERENCES "public"."tridharma"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diseminasi" ADD CONSTRAINT "diseminasi_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diseminasi" ADD CONSTRAINT "diseminasi_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diseminasi" ADD CONSTRAINT "diseminasi_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diseminasi" ADD CONSTRAINT "diseminasi_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diseminasi" ADD CONSTRAINT "diseminasi_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diseminasi" ADD CONSTRAINT "diseminasi_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diseminasi" ADD CONSTRAINT "diseminasi_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dosen_year" ADD CONSTRAINT "dosen_year_dosen_id_dosen_id_fk" FOREIGN KEY ("dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dosen_year" ADD CONSTRAINT "dosen_year_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dosen_year" ADD CONSTRAINT "dosen_year_jabatan_struktural_id_ref_option_id_fk" FOREIGN KEY ("jabatan_struktural_id") REFERENCES "public"."ref_option"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dosen" ADD CONSTRAINT "dosen_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_link" ADD CONSTRAINT "evidence_link_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_link" ADD CONSTRAINT "evidence_link_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ewmp" ADD CONSTRAINT "ewmp_dosen_id_dosen_id_fk" FOREIGN KEY ("dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ewmp" ADD CONSTRAINT "ewmp_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ewmp" ADD CONSTRAINT "ewmp_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ewmp" ADD CONSTRAINT "ewmp_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ewmp" ADD CONSTRAINT "ewmp_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ewmp" ADD CONSTRAINT "ewmp_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ewmp" ADD CONSTRAINT "ewmp_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ewmp" ADD CONSTRAINT "ewmp_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file" ADD CONSTRAINT "file_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleksibilitas_tahun" ADD CONSTRAINT "fleksibilitas_tahun_fleksibilitas_id_fleksibilitas_id_fk" FOREIGN KEY ("fleksibilitas_id") REFERENCES "public"."fleksibilitas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleksibilitas_tahun" ADD CONSTRAINT "fleksibilitas_tahun_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleksibilitas" ADD CONSTRAINT "fleksibilitas_bentuk_id_ref_option_id_fk" FOREIGN KEY ("bentuk_id") REFERENCES "public"."ref_option"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleksibilitas" ADD CONSTRAINT "fleksibilitas_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleksibilitas" ADD CONSTRAINT "fleksibilitas_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleksibilitas" ADD CONSTRAINT "fleksibilitas_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleksibilitas" ADD CONSTRAINT "fleksibilitas_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleksibilitas" ADD CONSTRAINT "fleksibilitas_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleksibilitas" ADD CONSTRAINT "fleksibilitas_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hki" ADD CONSTRAINT "hki_jenis_id_ref_option_id_fk" FOREIGN KEY ("jenis_id") REFERENCES "public"."ref_option"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hki" ADD CONSTRAINT "hki_dosen_id_dosen_id_fk" FOREIGN KEY ("dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hki" ADD CONSTRAINT "hki_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hki" ADD CONSTRAINT "hki_tridharma_id_tridharma_id_fk" FOREIGN KEY ("tridharma_id") REFERENCES "public"."tridharma"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hki" ADD CONSTRAINT "hki_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hki" ADD CONSTRAINT "hki_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hki" ADD CONSTRAINT "hki_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hki" ADD CONSTRAINT "hki_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hki" ADD CONSTRAINT "hki_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hki" ADD CONSTRAINT "hki_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identitas_pengusul" ADD CONSTRAINT "identitas_pengusul_period_id_lkps_period_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."lkps_period"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identitas_pengusul" ADD CONSTRAINT "identitas_pengusul_peringkat_id_ref_option_id_fk" FOREIGN KEY ("peringkat_id") REFERENCES "public"."ref_option"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identitas_pengusul" ADD CONSTRAINT "identitas_pengusul_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identitas_pengusul" ADD CONSTRAINT "identitas_pengusul_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identitas_pengusul" ADD CONSTRAINT "identitas_pengusul_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identitas_pengusul" ADD CONSTRAINT "identitas_pengusul_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identitas_pengusul" ADD CONSTRAINT "identitas_pengusul_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identitas_pengusul" ADD CONSTRAINT "identitas_pengusul_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_job" ADD CONSTRAINT "import_job_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_job" ADD CONSTRAINT "import_job_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kepuasan_item" ADD CONSTRAINT "kepuasan_item_survey_id_kepuasan_survey_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."kepuasan_survey"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kepuasan_survey" ADD CONSTRAINT "kepuasan_survey_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kepuasan_survey" ADD CONSTRAINT "kepuasan_survey_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kepuasan_survey" ADD CONSTRAINT "kepuasan_survey_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kepuasan_survey" ADD CONSTRAINT "kepuasan_survey_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kepuasan_survey" ADD CONSTRAINT "kepuasan_survey_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kepuasan_survey" ADD CONSTRAINT "kepuasan_survey_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kepuasan_survey" ADD CONSTRAINT "kepuasan_survey_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kerjasama_dana" ADD CONSTRAINT "kerjasama_dana_kerjasama_id_kerjasama_id_fk" FOREIGN KEY ("kerjasama_id") REFERENCES "public"."kerjasama"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kerjasama_dana" ADD CONSTRAINT "kerjasama_dana_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kerjasama" ADD CONSTRAINT "kerjasama_mitra_id_mitra_id_fk" FOREIGN KEY ("mitra_id") REFERENCES "public"."mitra"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kerjasama" ADD CONSTRAINT "kerjasama_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kerjasama" ADD CONSTRAINT "kerjasama_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kerjasama" ADD CONSTRAINT "kerjasama_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kerjasama" ADD CONSTRAINT "kerjasama_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kerjasama" ADD CONSTRAINT "kerjasama_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kerjasama" ADD CONSTRAINT "kerjasama_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kurikulum_pemetaan" ADD CONSTRAINT "kurikulum_pemetaan_period_id_lkps_period_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."lkps_period"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kurikulum_pemetaan" ADD CONSTRAINT "kurikulum_pemetaan_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kurikulum_pemetaan" ADD CONSTRAINT "kurikulum_pemetaan_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kurikulum_pemetaan" ADD CONSTRAINT "kurikulum_pemetaan_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kurikulum_pemetaan" ADD CONSTRAINT "kurikulum_pemetaan_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kurikulum_pemetaan" ADD CONSTRAINT "kurikulum_pemetaan_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kurikulum_pemetaan" ADD CONSTRAINT "kurikulum_pemetaan_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lkps_period" ADD CONSTRAINT "lkps_period_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lkps_period" ADD CONSTRAINT "lkps_period_ts_year_id_academic_year_id_fk" FOREIGN KEY ("ts_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lkps_period" ADD CONSTRAINT "lkps_period_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lkps_period" ADD CONSTRAINT "lkps_period_locked_by_user_id_fk" FOREIGN KEY ("locked_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lkps_period" ADD CONSTRAINT "lkps_period_reopened_by_user_id_fk" FOREIGN KEY ("reopened_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lulusan" ADD CONSTRAINT "lulusan_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lulusan" ADD CONSTRAINT "lulusan_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lulusan" ADD CONSTRAINT "lulusan_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lulusan" ADD CONSTRAINT "lulusan_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lulusan" ADD CONSTRAINT "lulusan_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lulusan" ADD CONSTRAINT "lulusan_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lulusan" ADD CONSTRAINT "lulusan_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_angkatan_year_id_academic_year_id_fk" FOREIGN KEY ("angkatan_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mata_kuliah" ADD CONSTRAINT "mata_kuliah_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_asal_tahun" ADD CONSTRAINT "mhs_asal_tahun_mhs_asal_id_mhs_asal_id_fk" FOREIGN KEY ("mhs_asal_id") REFERENCES "public"."mhs_asal"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_asal_tahun" ADD CONSTRAINT "mhs_asal_tahun_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_asal" ADD CONSTRAINT "mhs_asal_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_asal" ADD CONSTRAINT "mhs_asal_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_asal" ADD CONSTRAINT "mhs_asal_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_asal" ADD CONSTRAINT "mhs_asal_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_asal" ADD CONSTRAINT "mhs_asal_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_asal" ADD CONSTRAINT "mhs_asal_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_data" ADD CONSTRAINT "mhs_data_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_data" ADD CONSTRAINT "mhs_data_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_data" ADD CONSTRAINT "mhs_data_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_data" ADD CONSTRAINT "mhs_data_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_data" ADD CONSTRAINT "mhs_data_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_data" ADD CONSTRAINT "mhs_data_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_data" ADD CONSTRAINT "mhs_data_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_kondisi" ADD CONSTRAINT "mhs_kondisi_period_id_lkps_period_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."lkps_period"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_kondisi" ADD CONSTRAINT "mhs_kondisi_cohort_year_id_academic_year_id_fk" FOREIGN KEY ("cohort_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_kondisi" ADD CONSTRAINT "mhs_kondisi_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_kondisi" ADD CONSTRAINT "mhs_kondisi_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_kondisi" ADD CONSTRAINT "mhs_kondisi_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_kondisi" ADD CONSTRAINT "mhs_kondisi_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_kondisi" ADD CONSTRAINT "mhs_kondisi_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mhs_kondisi" ADD CONSTRAINT "mhs_kondisi_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mitra" ADD CONSTRAINT "mitra_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mitra" ADD CONSTRAINT "mitra_jenis_id_ref_option_id_fk" FOREIGN KEY ("jenis_id") REFERENCES "public"."ref_option"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mk_dosen" ADD CONSTRAINT "mk_dosen_mata_kuliah_id_mata_kuliah_id_fk" FOREIGN KEY ("mata_kuliah_id") REFERENCES "public"."mata_kuliah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mk_dosen" ADD CONSTRAINT "mk_dosen_dosen_id_dosen_id_fk" FOREIGN KEY ("dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mk_pl" ADD CONSTRAINT "mk_pl_mata_kuliah_id_mata_kuliah_id_fk" FOREIGN KEY ("mata_kuliah_id") REFERENCES "public"."mata_kuliah"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mk_pl" ADD CONSTRAINT "mk_pl_profil_lulusan_id_profil_lulusan_id_fk" FOREIGN KEY ("profil_lulusan_id") REFERENCES "public"."profil_lulusan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengembangan_dtpr" ADD CONSTRAINT "pengembangan_dtpr_dosen_id_dosen_id_fk" FOREIGN KEY ("dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengembangan_dtpr" ADD CONSTRAINT "pengembangan_dtpr_jenis_id_ref_option_id_fk" FOREIGN KEY ("jenis_id") REFERENCES "public"."ref_option"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengembangan_dtpr" ADD CONSTRAINT "pengembangan_dtpr_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengembangan_dtpr" ADD CONSTRAINT "pengembangan_dtpr_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengembangan_dtpr" ADD CONSTRAINT "pengembangan_dtpr_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengembangan_dtpr" ADD CONSTRAINT "pengembangan_dtpr_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengembangan_dtpr" ADD CONSTRAINT "pengembangan_dtpr_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengembangan_dtpr" ADD CONSTRAINT "pengembangan_dtpr_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pengembangan_dtpr" ADD CONSTRAINT "pengembangan_dtpr_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "period_attachment" ADD CONSTRAINT "period_attachment_period_id_lkps_period_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."lkps_period"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "period_attachment" ADD CONSTRAINT "period_attachment_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "period_attachment" ADD CONSTRAINT "period_attachment_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "period_snapshot" ADD CONSTRAINT "period_snapshot_period_id_lkps_period_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."lkps_period"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "period_snapshot" ADD CONSTRAINT "period_snapshot_export_file_id_file_id_fk" FOREIGN KEY ("export_file_id") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "period_snapshot" ADD CONSTRAINT "period_snapshot_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "period_table_flag" ADD CONSTRAINT "period_table_flag_period_id_lkps_period_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."lkps_period"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "period_table_flag" ADD CONSTRAINT "period_table_flag_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pimpinan_unit" ADD CONSTRAINT "pimpinan_unit_period_id_lkps_period_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."lkps_period"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pimpinan_unit" ADD CONSTRAINT "pimpinan_unit_dosen_id_dosen_id_fk" FOREIGN KEY ("dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pimpinan_unit" ADD CONSTRAINT "pimpinan_unit_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pimpinan_unit" ADD CONSTRAINT "pimpinan_unit_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pimpinan_unit" ADD CONSTRAINT "pimpinan_unit_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pimpinan_unit" ADD CONSTRAINT "pimpinan_unit_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pimpinan_unit" ADD CONSTRAINT "pimpinan_unit_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pimpinan_unit" ADD CONSTRAINT "pimpinan_unit_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prasarana" ADD CONSTRAINT "prasarana_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prasarana" ADD CONSTRAINT "prasarana_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prasarana" ADD CONSTRAINT "prasarana_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prasarana" ADD CONSTRAINT "prasarana_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prasarana" ADD CONSTRAINT "prasarana_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prasarana" ADD CONSTRAINT "prasarana_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prodi_setting" ADD CONSTRAINT "prodi_setting_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prodi_setting" ADD CONSTRAINT "prodi_setting_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prodi" ADD CONSTRAINT "prodi_fakultas_id_fakultas_id_fk" FOREIGN KEY ("fakultas_id") REFERENCES "public"."fakultas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profil_lulusan" ADD CONSTRAINT "profil_lulusan_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publikasi" ADD CONSTRAINT "publikasi_dosen_id_dosen_id_fk" FOREIGN KEY ("dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publikasi" ADD CONSTRAINT "publikasi_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publikasi" ADD CONSTRAINT "publikasi_tridharma_id_tridharma_id_fk" FOREIGN KEY ("tridharma_id") REFERENCES "public"."tridharma"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publikasi" ADD CONSTRAINT "publikasi_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publikasi" ADD CONSTRAINT "publikasi_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publikasi" ADD CONSTRAINT "publikasi_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publikasi" ADD CONSTRAINT "publikasi_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publikasi" ADD CONSTRAINT "publikasi_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publikasi" ADD CONSTRAINT "publikasi_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ref_option" ADD CONSTRAINT "ref_option_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rekognisi_tahun" ADD CONSTRAINT "rekognisi_tahun_rekognisi_id_rekognisi_id_fk" FOREIGN KEY ("rekognisi_id") REFERENCES "public"."rekognisi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rekognisi_tahun" ADD CONSTRAINT "rekognisi_tahun_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rekognisi" ADD CONSTRAINT "rekognisi_sumber_id_ref_option_id_fk" FOREIGN KEY ("sumber_id") REFERENCES "public"."ref_option"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rekognisi" ADD CONSTRAINT "rekognisi_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rekognisi" ADD CONSTRAINT "rekognisi_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rekognisi" ADD CONSTRAINT "rekognisi_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rekognisi" ADD CONSTRAINT "rekognisi_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rekognisi" ADD CONSTRAINT "rekognisi_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rekognisi" ADD CONSTRAINT "rekognisi_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spmi_unit" ADD CONSTRAINT "spmi_unit_period_id_lkps_period_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."lkps_period"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spmi_unit" ADD CONSTRAINT "spmi_unit_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spmi_unit" ADD CONSTRAINT "spmi_unit_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spmi_unit" ADD CONSTRAINT "spmi_unit_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spmi_unit" ADD CONSTRAINT "spmi_unit_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spmi_unit" ADD CONSTRAINT "spmi_unit_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spmi_unit" ADD CONSTRAINT "spmi_unit_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tata_kelola" ADD CONSTRAINT "tata_kelola_period_id_lkps_period_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."lkps_period"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tata_kelola" ADD CONSTRAINT "tata_kelola_jenis_id_ref_option_id_fk" FOREIGN KEY ("jenis_id") REFERENCES "public"."ref_option"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tata_kelola" ADD CONSTRAINT "tata_kelola_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tata_kelola" ADD CONSTRAINT "tata_kelola_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tata_kelola" ADD CONSTRAINT "tata_kelola_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tata_kelola" ADD CONSTRAINT "tata_kelola_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tata_kelola" ADD CONSTRAINT "tata_kelola_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tata_kelola" ADD CONSTRAINT "tata_kelola_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tendik_kualifikasi" ADD CONSTRAINT "tendik_kualifikasi_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tendik_kualifikasi" ADD CONSTRAINT "tendik_kualifikasi_jenis_id_ref_option_id_fk" FOREIGN KEY ("jenis_id") REFERENCES "public"."ref_option"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tendik_kualifikasi" ADD CONSTRAINT "tendik_kualifikasi_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tendik_kualifikasi" ADD CONSTRAINT "tendik_kualifikasi_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tendik_kualifikasi" ADD CONSTRAINT "tendik_kualifikasi_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tendik_kualifikasi" ADD CONSTRAINT "tendik_kualifikasi_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tendik_kualifikasi" ADD CONSTRAINT "tendik_kualifikasi_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tendik_kualifikasi" ADD CONSTRAINT "tendik_kualifikasi_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tim_penyusun" ADD CONSTRAINT "tim_penyusun_period_id_lkps_period_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."lkps_period"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tim_penyusun" ADD CONSTRAINT "tim_penyusun_dosen_id_dosen_id_fk" FOREIGN KEY ("dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tim_penyusun" ADD CONSTRAINT "tim_penyusun_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tim_penyusun" ADD CONSTRAINT "tim_penyusun_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tim_penyusun" ADD CONSTRAINT "tim_penyusun_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tim_penyusun" ADD CONSTRAINT "tim_penyusun_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tim_penyusun" ADD CONSTRAINT "tim_penyusun_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tim_penyusun" ADD CONSTRAINT "tim_penyusun_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tridharma_dana" ADD CONSTRAINT "tridharma_dana_tridharma_id_tridharma_id_fk" FOREIGN KEY ("tridharma_id") REFERENCES "public"."tridharma"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tridharma_dana" ADD CONSTRAINT "tridharma_dana_academic_year_id_academic_year_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_year"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tridharma_dosen" ADD CONSTRAINT "tridharma_dosen_tridharma_id_tridharma_id_fk" FOREIGN KEY ("tridharma_id") REFERENCES "public"."tridharma"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tridharma_dosen" ADD CONSTRAINT "tridharma_dosen_dosen_id_dosen_id_fk" FOREIGN KEY ("dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tridharma_mahasiswa" ADD CONSTRAINT "tridharma_mahasiswa_tridharma_id_tridharma_id_fk" FOREIGN KEY ("tridharma_id") REFERENCES "public"."tridharma"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tridharma_mahasiswa" ADD CONSTRAINT "tridharma_mahasiswa_mahasiswa_id_mahasiswa_id_fk" FOREIGN KEY ("mahasiswa_id") REFERENCES "public"."mahasiswa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tridharma" ADD CONSTRAINT "tridharma_jenis_hibah_id_ref_option_id_fk" FOREIGN KEY ("jenis_hibah_id") REFERENCES "public"."ref_option"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tridharma" ADD CONSTRAINT "tridharma_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tridharma" ADD CONSTRAINT "tridharma_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tridharma" ADD CONSTRAINT "tridharma_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tridharma" ADD CONSTRAINT "tridharma_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tridharma" ADD CONSTRAINT "tridharma_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tridharma" ADD CONSTRAINT "tridharma_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upps_program" ADD CONSTRAINT "upps_program_period_id_lkps_period_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."lkps_period"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upps_program" ADD CONSTRAINT "upps_program_peringkat_id_ref_option_id_fk" FOREIGN KEY ("peringkat_id") REFERENCES "public"."ref_option"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upps_program" ADD CONSTRAINT "upps_program_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upps_program" ADD CONSTRAINT "upps_program_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upps_program" ADD CONSTRAINT "upps_program_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upps_program" ADD CONSTRAINT "upps_program_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upps_program" ADD CONSTRAINT "upps_program_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upps_program" ADD CONSTRAINT "upps_program_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_dosen" ADD CONSTRAINT "user_dosen_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_dosen" ADD CONSTRAINT "user_dosen_dosen_id_dosen_id_fk" FOREIGN KEY ("dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visi_misi" ADD CONSTRAINT "visi_misi_period_id_lkps_period_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."lkps_period"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visi_misi" ADD CONSTRAINT "visi_misi_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visi_misi" ADD CONSTRAINT "visi_misi_owner_dosen_id_dosen_id_fk" FOREIGN KEY ("owner_dosen_id") REFERENCES "public"."dosen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visi_misi" ADD CONSTRAINT "visi_misi_submitted_by_user_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visi_misi" ADD CONSTRAINT "visi_misi_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visi_misi" ADD CONSTRAINT "visi_misi_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visi_misi" ADD CONSTRAINT "visi_misi_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "academic_year_start_year_key" ON "academic_year" USING btree ("start_year");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id","at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "audit_log_parent_entity_idx" ON "audit_log" USING btree ("parent_entity_type","parent_entity_id","at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "audit_log_at_idx" ON "audit_log" USING btree ("at");--> statement-breakpoint
CREATE UNIQUE INDEX "cpl_pl_cpl_profil_lulusan_key" ON "cpl_pl" USING btree ("cpl_id","profil_lulusan_id");--> statement-breakpoint
CREATE INDEX "cpl_pl_profil_lulusan_id_idx" ON "cpl_pl" USING btree ("profil_lulusan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cpl_prodi_kode_key" ON "cpl" USING btree ("prodi_id","kode");--> statement-breakpoint
CREATE UNIQUE INDEX "cpmk_mk_cpmk_mata_kuliah_key" ON "cpmk_mk" USING btree ("cpmk_id","mata_kuliah_id");--> statement-breakpoint
CREATE INDEX "cpmk_mk_mata_kuliah_id_idx" ON "cpmk_mk" USING btree ("mata_kuliah_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cpmk_cpl_kode_key" ON "cpmk" USING btree ("cpl_id","kode");--> statement-breakpoint
CREATE UNIQUE INDEX "dana_tahun_dana_academic_year_key" ON "dana_tahun" USING btree ("dana_id","academic_year_id");--> statement-breakpoint
CREATE INDEX "dana_tahun_academic_year_id_idx" ON "dana_tahun" USING btree ("academic_year_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dana_prodi_kind_kategori_key" ON "dana" USING btree ("prodi_id","kind","kategori_id") WHERE "dana"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "dana_prodi_kind_label_key" ON "dana" USING btree ("prodi_id","kind",lower("label_custom")) WHERE "dana"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "dana_kategori_id_idx" ON "dana" USING btree ("kategori_id");--> statement-breakpoint
CREATE INDEX "diseminasi_tridharma_id_idx" ON "diseminasi" USING btree ("tridharma_id");--> statement-breakpoint
CREATE INDEX "diseminasi_academic_year_id_idx" ON "diseminasi" USING btree ("academic_year_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dosen_year_dosen_academic_year_key" ON "dosen_year" USING btree ("dosen_id","academic_year_id");--> statement-breakpoint
CREATE INDEX "dosen_year_jabatan_struktural_id_idx" ON "dosen_year" USING btree ("jabatan_struktural_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dosen_prodi_nidn_key" ON "dosen" USING btree ("prodi_id","nidn");--> statement-breakpoint
CREATE UNIQUE INDEX "evidence_link_entity_slot_file_key" ON "evidence_link" USING btree ("entity_type","entity_id","slot","file_id");--> statement-breakpoint
CREATE INDEX "evidence_link_entity_idx" ON "evidence_link" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ewmp_dosen_academic_year_key" ON "ewmp" USING btree ("dosen_id","academic_year_id") WHERE "ewmp"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "ewmp_academic_year_id_idx" ON "ewmp" USING btree ("academic_year_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fakultas_kode_key" ON "fakultas" USING btree ("kode");--> statement-breakpoint
CREATE UNIQUE INDEX "file_prodi_sha256_key" ON "file" USING btree ("prodi_id","sha256");--> statement-breakpoint
CREATE INDEX "file_prodi_id_idx" ON "file" USING btree ("prodi_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fleksibilitas_tahun_fleksibilitas_academic_year_key" ON "fleksibilitas_tahun" USING btree ("fleksibilitas_id","academic_year_id");--> statement-breakpoint
CREATE INDEX "fleksibilitas_tahun_academic_year_id_idx" ON "fleksibilitas_tahun" USING btree ("academic_year_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fleksibilitas_prodi_bentuk_key" ON "fleksibilitas" USING btree ("prodi_id","bentuk_id") WHERE "fleksibilitas"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "fleksibilitas_prodi_label_key" ON "fleksibilitas" USING btree ("prodi_id",lower("label_custom")) WHERE "fleksibilitas"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "hki_jenis_id_idx" ON "hki" USING btree ("jenis_id");--> statement-breakpoint
CREATE INDEX "hki_dosen_id_idx" ON "hki" USING btree ("dosen_id");--> statement-breakpoint
CREATE INDEX "hki_academic_year_id_idx" ON "hki" USING btree ("academic_year_id");--> statement-breakpoint
CREATE INDEX "hki_tridharma_id_idx" ON "hki" USING btree ("tridharma_id");--> statement-breakpoint
CREATE UNIQUE INDEX "identitas_pengusul_period_key" ON "identitas_pengusul" USING btree ("period_id") WHERE "identitas_pengusul"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "import_job_prodi_id_idx" ON "import_job" USING btree ("prodi_id");--> statement-breakpoint
CREATE UNIQUE INDEX "kepuasan_item_survey_kemampuan_key" ON "kepuasan_item" USING btree ("survey_id","kemampuan");--> statement-breakpoint
CREATE UNIQUE INDEX "kepuasan_survey_prodi_academic_year_key" ON "kepuasan_survey" USING btree ("prodi_id","academic_year_id") WHERE "kepuasan_survey"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "kerjasama_dana_kerjasama_academic_year_key" ON "kerjasama_dana" USING btree ("kerjasama_id","academic_year_id");--> statement-breakpoint
CREATE INDEX "kerjasama_dana_academic_year_id_idx" ON "kerjasama_dana" USING btree ("academic_year_id");--> statement-breakpoint
CREATE INDEX "kerjasama_mitra_id_idx" ON "kerjasama" USING btree ("mitra_id");--> statement-breakpoint
CREATE UNIQUE INDEX "kurikulum_pemetaan_period_key" ON "kurikulum_pemetaan" USING btree ("period_id") WHERE "kurikulum_pemetaan"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "lkps_period_prodi_ts_year_key" ON "lkps_period" USING btree ("prodi_id","ts_year_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lkps_period_prodi_open_key" ON "lkps_period" USING btree ("prodi_id") WHERE "lkps_period"."status" = 'open';--> statement-breakpoint
CREATE UNIQUE INDEX "lulusan_prodi_academic_year_key" ON "lulusan" USING btree ("prodi_id","academic_year_id") WHERE "lulusan"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "mahasiswa_prodi_nim_key" ON "mahasiswa" USING btree ("prodi_id","nim");--> statement-breakpoint
CREATE INDEX "mahasiswa_angkatan_year_id_idx" ON "mahasiswa" USING btree ("angkatan_year_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mata_kuliah_prodi_kode_key" ON "mata_kuliah" USING btree ("prodi_id","kode");--> statement-breakpoint
CREATE UNIQUE INDEX "mhs_asal_tahun_mhs_asal_academic_year_key" ON "mhs_asal_tahun" USING btree ("mhs_asal_id","academic_year_id");--> statement-breakpoint
CREATE INDEX "mhs_asal_tahun_academic_year_id_idx" ON "mhs_asal_tahun" USING btree ("academic_year_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mhs_asal_prodi_kategori_rincian_key" ON "mhs_asal" USING btree ("prodi_id","kategori",lower(coalesce("rincian", ''))) WHERE "mhs_asal"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "mhs_data_prodi_academic_year_key" ON "mhs_data" USING btree ("prodi_id","academic_year_id") WHERE "mhs_data"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "mhs_kondisi_period_cohort_year_key" ON "mhs_kondisi" USING btree ("period_id","cohort_year_id") WHERE "mhs_kondisi"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "mhs_kondisi_cohort_year_id_idx" ON "mhs_kondisi" USING btree ("cohort_year_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mitra_prodi_nama_key" ON "mitra" USING btree ("prodi_id","nama");--> statement-breakpoint
CREATE INDEX "mitra_jenis_id_idx" ON "mitra" USING btree ("jenis_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mk_dosen_mata_kuliah_dosen_key" ON "mk_dosen" USING btree ("mata_kuliah_id","dosen_id");--> statement-breakpoint
CREATE INDEX "mk_dosen_dosen_id_idx" ON "mk_dosen" USING btree ("dosen_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mk_pl_mata_kuliah_profil_lulusan_key" ON "mk_pl" USING btree ("mata_kuliah_id","profil_lulusan_id");--> statement-breakpoint
CREATE INDEX "mk_pl_profil_lulusan_id_idx" ON "mk_pl" USING btree ("profil_lulusan_id");--> statement-breakpoint
CREATE INDEX "pengembangan_dtpr_dosen_id_idx" ON "pengembangan_dtpr" USING btree ("dosen_id");--> statement-breakpoint
CREATE INDEX "pengembangan_dtpr_academic_year_id_idx" ON "pengembangan_dtpr" USING btree ("academic_year_id");--> statement-breakpoint
CREATE UNIQUE INDEX "period_attachment_period_kind_key" ON "period_attachment" USING btree ("period_id","kind");--> statement-breakpoint
CREATE INDEX "period_attachment_file_id_idx" ON "period_attachment" USING btree ("file_id");--> statement-breakpoint
CREATE UNIQUE INDEX "period_snapshot_period_seq_key" ON "period_snapshot" USING btree ("period_id","seq");--> statement-breakpoint
CREATE INDEX "period_snapshot_export_file_id_idx" ON "period_snapshot" USING btree ("export_file_id");--> statement-breakpoint
CREATE UNIQUE INDEX "period_table_flag_period_code_key" ON "period_table_flag" USING btree ("period_id","table_code");--> statement-breakpoint
CREATE INDEX "pimpinan_unit_period_id_idx" ON "pimpinan_unit" USING btree ("period_id");--> statement-breakpoint
CREATE INDEX "pimpinan_unit_dosen_id_idx" ON "pimpinan_unit" USING btree ("dosen_id");--> statement-breakpoint
CREATE UNIQUE INDEX "prasarana_prodi_nama_key" ON "prasarana" USING btree ("prodi_id",lower("nama")) WHERE "prasarana"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "prodi_setting_prodi_key_key" ON "prodi_setting" USING btree ("prodi_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "prodi_kode_key" ON "prodi" USING btree ("kode");--> statement-breakpoint
CREATE INDEX "prodi_fakultas_id_idx" ON "prodi" USING btree ("fakultas_id");--> statement-breakpoint
CREATE UNIQUE INDEX "profil_lulusan_prodi_kode_key" ON "profil_lulusan" USING btree ("prodi_id","kode");--> statement-breakpoint
CREATE INDEX "publikasi_dosen_id_idx" ON "publikasi" USING btree ("dosen_id");--> statement-breakpoint
CREATE INDEX "publikasi_academic_year_id_idx" ON "publikasi" USING btree ("academic_year_id");--> statement-breakpoint
CREATE INDEX "publikasi_tridharma_id_idx" ON "publikasi" USING btree ("tridharma_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ref_option_type_label_key" ON "ref_option" USING btree ("type","label");--> statement-breakpoint
CREATE INDEX "ref_option_prodi_id_idx" ON "ref_option" USING btree ("prodi_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rekognisi_tahun_rekognisi_academic_year_key" ON "rekognisi_tahun" USING btree ("rekognisi_id","academic_year_id");--> statement-breakpoint
CREATE INDEX "rekognisi_tahun_academic_year_id_idx" ON "rekognisi_tahun" USING btree ("academic_year_id");--> statement-breakpoint
CREATE INDEX "rekognisi_sumber_id_idx" ON "rekognisi" USING btree ("sumber_id");--> statement-breakpoint
CREATE INDEX "spmi_unit_period_id_idx" ON "spmi_unit" USING btree ("period_id");--> statement-breakpoint
CREATE INDEX "tata_kelola_period_id_idx" ON "tata_kelola" USING btree ("period_id");--> statement-breakpoint
CREATE INDEX "tata_kelola_jenis_id_idx" ON "tata_kelola" USING btree ("jenis_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tendik_kualifikasi_prodi_year_jenis_key" ON "tendik_kualifikasi" USING btree ("prodi_id","academic_year_id","jenis_id") WHERE "tendik_kualifikasi"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "tendik_kualifikasi_jenis_id_idx" ON "tendik_kualifikasi" USING btree ("jenis_id");--> statement-breakpoint
CREATE INDEX "tim_penyusun_period_id_idx" ON "tim_penyusun" USING btree ("period_id");--> statement-breakpoint
CREATE INDEX "tim_penyusun_dosen_id_idx" ON "tim_penyusun" USING btree ("dosen_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tridharma_dana_tridharma_academic_year_key" ON "tridharma_dana" USING btree ("tridharma_id","academic_year_id");--> statement-breakpoint
CREATE INDEX "tridharma_dana_academic_year_id_idx" ON "tridharma_dana" USING btree ("academic_year_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tridharma_dosen_tridharma_dosen_key" ON "tridharma_dosen" USING btree ("tridharma_id","dosen_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tridharma_dosen_ketua_key" ON "tridharma_dosen" USING btree ("tridharma_id") WHERE "tridharma_dosen"."peran" = 'ketua';--> statement-breakpoint
CREATE INDEX "tridharma_dosen_dosen_id_idx" ON "tridharma_dosen" USING btree ("dosen_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tridharma_mahasiswa_tridharma_mahasiswa_key" ON "tridharma_mahasiswa" USING btree ("tridharma_id","mahasiswa_id");--> statement-breakpoint
CREATE INDEX "tridharma_mahasiswa_mahasiswa_id_idx" ON "tridharma_mahasiswa" USING btree ("mahasiswa_id");--> statement-breakpoint
CREATE INDEX "tridharma_jenis_hibah_id_idx" ON "tridharma" USING btree ("jenis_hibah_id");--> statement-breakpoint
CREATE UNIQUE INDEX "upps_program_period_self_key" ON "upps_program" USING btree ("period_id") WHERE "upps_program"."is_self" and "upps_program"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "user_dosen_user_id_key" ON "user_dosen" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_dosen_dosen_id_key" ON "user_dosen" USING btree ("dosen_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_role_user_prodi_role_key" ON "user_role" USING btree ("user_id","prodi_id","role");--> statement-breakpoint
CREATE INDEX "user_role_prodi_id_idx" ON "user_role" USING btree ("prodi_id");--> statement-breakpoint
CREATE UNIQUE INDEX "visi_misi_period_key" ON "visi_misi" USING btree ("period_id") WHERE "visi_misi"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");