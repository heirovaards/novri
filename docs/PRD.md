# PRD — Sistem Informasi LKPS

**Product:** Sistem Informasi LKPS (Laporan Kinerja Program Studi)
**Owner:** Satriya Wardhana (supervisor) · **Developer:** Novriani Ambarita with AI coding agents
**Context:** Thesis project "Rancang Bangun Sistem Informasi Laporan Kinerja Program Studi Menggunakan Pendekatan Scrum", Prodi Sistem Informasi, Fakultas Biosains, Teknologi, dan Inovasi (FBTI), Universitas Katolik Indonesia Atma Jaya
**Reference instrument:** LAM INFOKOM, Instrumen APS 2.1 Program Sarjana, Panduan Penyusunan LKPS (Lampiran 4, Peraturan No. 11/PERLAM/MA/LAM-INFOKOM/X/2025)
**PRD type:** Main PRD (source of truth) · **Status:** Baseline for build

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | 2026-11-08 | Satriya Wardhana | First draft from proposal, instrument, canvas review |
| 1.0 | 2026-11-13 | Satriya Wardhana | Re-baselined for AI-agent execution: field-level spec for all 31 tables, decision log, simplified edit rule (no shadow revision), Kaprodi auto-verify, "Nihil" marking, merged 2.B.4/2.B.5 input, evidence rule aligned to Link Bukti columns, assumptions marked `[CONFIRM]` |

---

## 1. Overview

### 1.1 Problem
Prodi SI collects LKPS data in OneDrive folders and spreadsheets from different sources, and nothing links them. The same research title gets typed into several tables, figures drift between reports, verification is manual, and readiness only becomes visible when the accreditation deadline is close.

### 1.2 Goals

| ID | Goal | Thesis mapping |
|---|---|---|
| G1 | Every raw record (lecturer, student, research, publication, facility, partner) is entered once and reused in every LKPS table that needs it. | Rumusan Masalah 1 / Tujuan 1 |
| G2 | Automatic validation and an evidence repository keep data accurate, consistent and traceable across TS-2, TS-1 and TS. | Rumusan Masalah 2 / Tujuan 2 |
| G3 | A dashboard shows data readiness and raw indicator values. Each official table compiles automatically and exports in the instrument's layout. | Rumusan Masalah 3 / Tujuan 3 |

### 1.3 Non-goals (hard limits from the proposal's Batasan Masalah)
1. No Laporan Evaluasi Diri (LED) content.
2. No accreditation scoring, predicted rating, thresholds, targets, "readiness for Unggul" or action plans.
3. No multi-prodi or multi-fakultas UI. The data model carries `prodi_id` everywhere, but only Prodi SI exists.
4. No external integrations (PDDikti, Sekata, Google Scholar), no SSO, no email.

### 1.4 Success metrics

| Metric | Target |
|---|---|
| Instrument coverage | 31 of 31 tables compile and export with the columns in §8 |
| No duplicate input | Each research, PkM, publication, HKI, facility and partner item is entered once and appears in every table that uses it |
| Validation coverage | All rules in §10 implemented, each with a passing and a failing test |
| UAT | Kaprodi accepts every High-priority FR; zero open High defects |
| Compilation time | Full LKPS export for one period in under 10 s at reference volume (§12) |

---

## 2. Scope

| In scope (MVP) | Future scope (do not build) |
|---|---|
| Identitas Pengusul, Daftar PS di UPPS, Identitas Tim Penyusun | PDDikti lookup by NIM/NIDN |
| All 31 data tables in 6 criteria, plus Gambar 1.A and the two roadmap links | Sekata research/PkM import |
| Master data (Dosen, Mahasiswa, Mitra, Mata Kuliah, PL, CPL, CPMK) | Google Scholar publication lookup |
| Excel import for Dosen and Mahasiswa | Multi-prodi onboarding UI |
| Entry-level verification by Kaprodi | SSO (Microsoft 365), email notifications |
| Evidence file upload and library | Copying period-scoped data into a new period |
| Validation rules (errors and warnings) | Curriculum versioning |
| Dashboard (readiness and raw indicators, no scoring) | Dark mode |
| Official-table preview and Excel export (table, criterion, full, full + evidence ZIP) | |
| Period submission, lock and snapshot | |
| Audit trail, in-app notification counts | |

---

## 3. Users & Roles

### 3.1 Roles

| Role | Code | Who | Summary |
|---|---|---|---|
| Admin Sistem | `admin_sistem` | IT / system owner | Manages user accounts and reference lists, reopens locked periods, views the audit log. Has no access to LKPS data screens. |
| Kaprodi | `kaprodi` | Head of Prodi SI | The only verifier. Verifies or returns entries, manages periods, submits and locks, exports. Can create and edit any entry. |
| Admin Prodi | `admin_prodi` | Prodi operator | Enters and edits data in every section, including on behalf of lecturers. Manages master data, runs imports and exports. Cannot verify. |
| DTPR | `dtpr` | Dosen Tetap Penghitung Rasio | Enters own records in the DTPR-owned tables (§3.3). |
| Dosen | `dosen` | Any lecturer | Edits curriculum mappings for the courses they teach (2.B.1, 2.B.3). |

- A user can hold several roles. Permissions are the union of the roles.
- DTPR and Dosen accounts must be linked to one Dosen master record. That link defines "own".

### 3.2 Permission matrix

| Capability | Admin Sistem | Kaprodi | Admin Prodi | DTPR | Dosen |
|---|---|---|---|---|---|
| Manage user accounts | ✓ | – | – | – | – |
| Manage reference lists | ✓ | ✓ | – | – | – |
| View audit log | ✓ | ✓ | – | – | – |
| Reopen a locked period | ✓ | – | – | – | – |
| Create a period; submit and lock it | – | ✓ | – | – | – |
| Edit validation settings | – | ✓ | – | – | – |
| Manage master data and run imports | – | ✓ | ✓ | – | – |
| Create, edit, submit, delete entries in any table | – | ✓ | ✓ | – | – |
| Create, edit, submit, delete **own** entries in DTPR-owned tables | – | ✓ | ✓ | ✓ | – |
| Edit curriculum mappings for own courses | – | ✓ | ✓ | – | ✓ |
| Verify or return entries; mark a table "Nihil" | – | ✓ | – (Nihil: ✓) | – | – |
| View criterion previews and export | – | ✓ | ✓ | – | – |
| View dashboard | – | Full | Full | "Tugas Saya" only | "Tugas Saya" only |
| View evidence library | – | All files | All files | Own uploads | Own uploads |
| Change own password | ✓ | ✓ | ✓ | ✓ | ✓ |

Admin Sistem landing page is `/admin/pengguna`. Everyone else lands on `/dashboard`.

### 3.3 Table ownership

| Owner | Tables | "Own" means |
|---|---|---|
| DTPR | 1.A.4 EWMP; 3.A.2 Penelitian; 3.A.3 Pengembangan DTPR; 3.C.1 Kerjasama Penelitian; 3.C.2 Publikasi; 3.C.3 HKI; 4.A.2 PkM; 4.C.1 Kerjasama PkM; 4.C.2 Diseminasi PkM; 4.C.3 HKI PkM | `owner_dosen_id` equals the user's linked Dosen. For 3.A.2 / 4.A.2 the owner is the Ketua. For 4.C.2 the owner is the Ketua of the linked PkM. |
| Dosen | 2.B.1 and 2.B.3 mapping cells | The course (Mata Kuliah) lists the user's Dosen as a pengampu. |
| Prodi (Kaprodi, Admin Prodi) | Everything else | No personal owner (`owner_dosen_id` is null). |

A DTPR sees only their own rows in DTPR-owned work screens. Kaprodi and Admin Prodi see all rows and can pick the owner when they enter data on a lecturer's behalf.

---

## 4. Key Concepts

The numbered items below are referenced elsewhere as §4.1 to §4.8.

1. **Academic year (Tahun Akademik).** A year such as 2025/2026, stored once in `academic_year`. Every time-series value points to an academic year, never to a label like "TS-1".
2. **LKPS Period.** One prodi plus one TS academic year. The period derives TS-1, TS-2 and TS-3 (TS-3 is used only by Table 2.A.1). Status is `open` or `locked`. Only one period per prodi may be open.
3. **Entry.** One row a user creates, with a workflow status. Examples: one research project, one publication, one year of Data Mahasiswa.
4. **Input types.**

| Type | Meaning | UI pattern |
|---|---|---|
| **E** | Entry list: many rows, each an entry | List + side sheet form |
| **Y** | Year record: one entry per required year | Year cards + form |
| **S** | Single record per period | One form |
| **M** | Mapping (curriculum matrices), one workflow status for the whole set | Matrix editor |
| **D** | Derived view of the Prasarana entries, filtered by usage | List + side sheet form (shared Prasarana form) |

5. **Entry status.**

| Status | UI label | Meaning |
|---|---|---|
| `draft` | Draf | Saved, not submitted. Not counted anywhere. |
| `submitted` | Diajukan | Waiting for Kaprodi. Shown in previews with a marker, excluded from exports. |
| `verified` | Terverifikasi | Counts in official tables and exports. |
| `returned` | Dikembalikan | Sent back with a mandatory note. Owner edits and resubmits. |

6. **Table status** (per official table, per period).

| Status | UI label | Condition |
|---|---|---|
| `not_started` | Belum mulai | No entries and not marked Nihil |
| `incomplete` | Belum lengkap | Data exists but a required year/record is missing, an entry is `draft` or `returned`, or a submitted/verified entry has a validation error |
| `awaiting_verification` | Menunggu verifikasi | All required data present; at least one entry is `submitted`; none are `draft` or `returned` |
| `complete` | Lengkap | All required data present and every entry `verified`; **or** the table is marked Nihil and has no entries |

Required data per input type: E and D need at least 1 entry (or Nihil); Y needs one entry for every required year; S needs the single record; M needs at least one mapping in each matrix and a verified set.

7. **Nihil.** Kaprodi or Admin Prodi can mark an E or D table "Nihil" (the prodi has nothing to report, for example no HKI from PkM). A Nihil table counts as complete and exports with the single row "Tidak ada data". Adding an entry clears the flag.
8. **Official table.** A read-only table compiled from entries and master data in the instrument's layout. Users never edit it directly.

---

## 5. Decision Log

| ID | Date | Decision |
|---|---|---|
| D-01 | 2026-11-08 | Scope follows the thesis proposal: Prodi SI only, 6 criteria, no scoring. Data model is multi-prodi-ready. |
| D-02 | 2026-11-08 | "Rencana Aksi → Unggul" and any accreditation target are removed from the product. |
| D-03 | 2026-11-08 | Five roles; Kaprodi is the only verifier (one-step verification). |
| D-04 | 2026-11-08 | Email + password login only. Accounts are created by Admin Sistem. |
| D-05 | 2026-11-08 | Evidence is uploaded as files (PDF/JPG/PNG ≤ 5 MB), not pasted links. |
| D-06 | 2026-11-08 | Excel import for Dosen and Mahasiswa, audit trail and period lock are in the MVP. External integrations are future scope. |
| D-07 | 2026-11-08 | Stack: Next.js + PostgreSQL, shadcn/ui + Tailwind, MyAtma-orange theme, Docker for local/UAT. Production hosting undecided. |
| D-08 | 2026-11-08 | Code convention: one file per page and one file per function, with distinct names. |
| D-09 | 2026-11-13 | One Next.js app with code split into `src/frontend` and `src/backend`, folders named by feature. |
| D-10 | 2026-11-13 | Drizzle ORM and Better Auth are confirmed. |
| D-11 | 2026-11-13 | Editing a verified entry sets it back to `submitted`; it leaves exports until re-verified. No shadow revisions. |
| D-12 | 2026-11-13 | Any submit performed by a user with the Kaprodi role results in `verified` immediately, recorded as self-verified in the audit log. |
| D-13 | 2026-11-13 | Unconfirmed domain assumptions are built as stated in §14, marked `[CONFIRM]`, each isolated in one function or setting. |
| D-14 | 2026-11-13 | Brand colours, logo and font remain placeholders (see DESIGN.md). |
| D-15 | 2026-11-13 | Phases carry order, dependencies and a sprint label; no dates. Dates are managed in Jira. |
| D-16 | 2026-11-13 | Evidence is mandatory only for tables whose official layout has a Link Bukti (or equivalent document) column. Other tables accept optional internal attachments that are never exported. |
| D-17 | 2026-11-13 | Tables 2.B.4 and 2.B.5 are fed by one input form ("Data Lulusan") per graduation year. |
| D-18 | 2026-11-13 | DTPR and Dosen have no access to previews or exports. |
| D-19 | 2026-11-13 | A table with nothing to report can be marked "Nihil" and then counts as complete. |

---

## 6. Functional Requirements

Priority: High / Medium / Low. Acceptance criteria (AC) are numbered and testable.

### FR-01 Authentication & accounts (High)
1. `/login` accepts email and password. There is no self-registration and no "forgot password" flow; the page shows "Lupa kata sandi? Hubungi Admin Sistem."
2. A failed login shows one generic message: "Email atau kata sandi salah." It never reveals whether the email exists.
3. After 5 failed attempts for the same email within 15 minutes, further attempts are rejected for 15 minutes with "Terlalu banyak percobaan. Coba lagi dalam 15 menit."
4. Admin Sistem creates an account with: name, email (unique), one or more roles, optional linked Dosen (required when the roles include DTPR or Dosen), and an initial password (minimum 10 characters).
5. A new or password-reset account must change its password on first login: every page redirects to `/ganti-kata-sandi` until done.
6. Passwords: minimum 10 characters, at least one letter and one digit, different from the previous password.
7. A session ends after 60 minutes of inactivity (configurable by environment variable). The user is redirected to `/login`.
8. Admin Sistem can deactivate and reactivate an account. Deactivation ends active sessions. Past entries and audit records remain.
9. Admin Sistem can reset a password (sets a new initial password and the must-change flag).
10. Admin Sistem cannot deactivate their own account or remove their own Admin Sistem role.

### FR-02 Authorisation (High)
1. Every page, Server Action and Route Handler checks the session and the permission matrix (§3.2) on the server.
2. A user who opens a URL they may not access sees the 403 page "Anda tidak memiliki akses ke halaman ini." with a link to their landing page.
3. Navigation shows only items the user may open.
4. Ownership (§3.3) is enforced on the server for every read and write of DTPR-owned and Dosen-owned data.

### FR-03 Period management (High)
1. Kaprodi creates a period by choosing the TS academic year. Before saving, the dialog shows the derived years: TS-3, TS-2, TS-1, TS.
2. Only one period per prodi can be `open`. Creating a period while one is open is rejected.
3. Two periods cannot share the same TS year for the same prodi.
4. Every data screen shows the active period in the top bar ("TS 2025/2026" plus status) and year labels in the form "TS-1 · 2024/2025".
5. When no period exists, data screens show an empty state: "Belum ada periode LKPS. Kaprodi perlu membuat periode terlebih dahulu." Master data remains usable.
6. The period page lists all periods with status, created/locked dates, and (for locked periods) a link to download the snapshot export.
7. Year-scoped data is stored by academic year, so a later period automatically sees values entered for years it shares with an earlier period.

### FR-04 Master data (High)
Master data is entered once and picked everywhere else. It has no verification workflow.

| Master | Fields | Rules |
|---|---|---|
| Dosen | NIDN (text, unique, required), Nama (required), Pendidikan Terakhir (S1/S2/S3/Sp-1/Sp-2/Profesi), Jabatan Fungsional (Tenaga Pengajar / Asisten Ahli / Lektor / Lektor Kepala / Guru Besar), Aktif (boolean) | NIDN 8–16 characters, digits only |
| Dosen per year | For each academic year: DTPR (yes/no), Jabatan Struktural (reference list, optional) | Drives who appears in 1.A.4 and the "Jumlah Dosen DTPR" row of 3.A.3 |
| Mahasiswa | NIM (text, unique, required), Nama (required), Angkatan (academic year), Jalur (Reguler / RPL), Afirmasi (boolean), Kebutuhan Khusus (boolean), Status (Aktif / Lulus / Cuti / Mengundurkan Diri / DO) | NIM 6–20 characters |
| Mitra | Nama (required, unique), Jenis (reference list: Perguruan Tinggi / Industri / Pemerintah / Komunitas / Lainnya), Negara (default "Indonesia") | Used by 3.C.1 and 4.C.1 |
| Mata Kuliah | Kode (unique), Nama, SKS (1–8), Semester (1–14), Pengampu (multi-pick Dosen) | Used by 2.B.1 and 2.B.3 |
| Profil Lulusan (PL) | Kode (e.g. "PL 1", unique), Deskripsi | Column headers of 2.B.1 and 2.B.2 |
| CPL | Kode (e.g. "CPL 01", unique), Deskripsi | Rows of 2.B.2 and 2.B.3 |
| CPMK | Kode (unique within its CPL), Deskripsi, parent CPL | Rows of 2.B.3 |

1. Each master has a list with search, a create/edit side sheet, and an "Arsipkan" action.
2. A master record referenced by any entry cannot be deleted, only archived. Archived records stay visible on existing entries but are not offered in pickers.
3. The Dosen form includes a "Status per Tahun Akademik" section listing the active period's four years with DTPR and Jabatan Struktural for each.
4. Uniqueness errors are shown inline on the offending field (V-04).

### FR-05 Excel import (High)
1. Available for Dosen and Mahasiswa, from downloadable `.xlsx` templates (one header row, two sample rows, dropdowns for enumerated columns).
2. Three-step wizard: Unggah → Tinjau → Selesai.
3. The review step shows counts for Valid, Galat and Duplikat, and a table of problem rows with the reason per row in Bahasa Indonesia.
4. Only valid rows are committed, in one transaction. Maximum 2,000 data rows per file; larger files are rejected.
5. A row whose NIDN/NIM already exists is a duplicate. It is skipped unless the user ticks "Perbarui data yang sudah ada", in which case it updates the existing record.
6. The error report can be downloaded as `.xlsx` (original columns plus a "Keterangan" column).
7. Each committed import writes one audit record with counts (inserted, updated, skipped).

Template columns:
- **Dosen:** NIDN · Nama · Pendidikan Terakhir · Jabatan Fungsional · DTPR pada TS (Y/N) · Jabatan Struktural (optional)
- **Mahasiswa:** NIM · Nama · Angkatan (YYYY, the starting year of the academic year) · Jalur (Reguler/RPL) · Afirmasi (Y/N) · Kebutuhan Khusus (Y/N) · Status

### FR-06 Reference lists & settings (Medium)
1. Admin Sistem and Kaprodi manage the reference lists in §13.2: add, rename, reorder, activate/deactivate. An option in use cannot be deleted, only deactivated.
2. Kaprodi edits validation settings: EWMP reasonable range (minimum and maximum SKS; default 12 and 16 `[CONFIRM A-02]`).
3. Changes take effect immediately for new validations.

### FR-07 Identitas (High)
1. **Identitas Pengusul** (type S): the fields in §8.1, plus three required attachments (SK Pendirian PT, SK Pembukaan PS, SK Akreditasi PS terbaru).
2. **Daftar Program Studi di UPPS** (type E): rows per §8.2 with a computed JUMLAH. The row flagged "Program studi ini" takes "Jumlah Mahasiswa saat TS" from Table 2.A.1 and is not editable there.
3. **Identitas Tim Penyusun** (type E): one to many members per §8.3. Picking a Dosen pre-fills Nama and NIDN.
4. The Identitas section shows a status badge using the table-status rules (§4.6). It is not counted in the "31 tables".

### FR-08 Criteria data entry (High)
General behaviour for every table in §8:
1. Each table has its own page (work screen) under its criterion, reachable from the sidebar and from tabs listing the criterion's tables by code.
2. The page header shows the exact instrument title, the table status badge, a "Pratinjau" button (Kaprodi and Admin Prodi only) and the primary add button.
3. **Type E / D:** a list with search, filters (status, year where relevant), columns as specified per table, and row actions Ubah, Riwayat, Hapus. Clicking a row opens the side sheet form. A footer line summarises counts by status.
4. **Type Y:** one card per required year showing the year chip, status and two or three key numbers; selecting a card shows that year's form.
5. **Type S:** one form.
6. **Type M:** the matrix editors in §8.13–8.15 with one "Ajukan Pemetaan" button.
7. Every form has "Batal", "Simpan Draf" and "Ajukan". "Simpan Draf" requires only fields needed to identify the entry; "Ajukan" runs all validation.
8. Money is typed in full rupiah; the form shows the Rp juta equivalent. Official tables show Rp juta with 2 decimals.
9. Computed values (totals, counts, derived rows) are shown as read-only "Dihitung otomatis" fields and are never typed.
10. Kaprodi and Admin Prodi can mark an E or D table "Nihil" from the page header menu, with an optional note, and can clear it.
11. When the period is locked or absent, all inputs are disabled and action buttons hidden; a banner explains why.
12. Unsaved changes: closing a form with edits asks "Buang perubahan yang belum disimpan?".

### FR-09 Verification workflow (High)
The state machine is defined in §7. In addition:
1. `/verifikasi` (Kaprodi only) lists all `submitted` entries with: table code, summary, owner, submitted time, age in days, warning count. Filters: criterion, table, owner, "Lebih dari 3 hari", "Ada peringatan".
2. Selecting a row shows a detail panel: all fields, evidence files (open in new tab), warning notes, and the entry's history.
3. Kaprodi can verify one entry, bulk-verify the selected entries, or return one entry with a note (minimum 10 characters).
4. A returned entry shows the note at the top of its form to the owner and to Admin Prodi.
5. Bulk verify is atomic: if any selected entry is no longer `submitted`, nothing changes and the list refreshes with a message.
6. When Admin Prodi or Kaprodi enters data in a DTPR-owned table, they must choose the owning DTPR; the audit trail records the real actor.

### FR-10 Evidence repository (High)
1. Tables with a Link Bukti column (marked "Evidence: required" in §8) require at least one file per entry before submission (V-02).
2. Tables without a Link Bukti column accept optional attachments ("Lampiran internal") that are never exported.
3. Accepted: PDF, JPG, PNG; maximum 5 MB per file (configurable). The real file type is detected from content, not the extension (V-21).
4. Uploading a file whose content already exists for the prodi reuses the stored file instead of duplicating it.
5. "Pilih dari pustaka bukti" attaches an existing file to another entry.
6. Table 1.B has three named evidence slots (Dokumen SPMI, Bukti Certified Auditor, Laporan Audit). All other tables have one slot, "Link Bukti".
7. Period-level attachments: Gambar 1.A (organisation chart), Roadmap Penelitian (3.A.2), Roadmap PkM (4.A.2), and the three Identitas SK files.
8. Files are private. Download requires a session and permission to read at least one entry or period attachment the file is linked to. Kaprodi and Admin Prodi can download any file of the prodi.
9. `/bukti` lists files with name, type, size, uploader, upload date and number of linked entries, with a filter "Tidak tertaut". Unlinked files can be deleted by their uploader, Admin Prodi or Kaprodi.
10. Removing a file from an entry unlinks it; the file stays in the library.

### FR-11 Validation (High)
1. Two severities. **Error (Galat):** blocks "Ajukan". **Warning (Peringatan):** allows "Ajukan" only after the user writes a note for each warning (minimum 5 characters); Kaprodi sees the notes.
2. Field-level checks run as the user types or leaves a field. Cross-field and cross-table rules run on "Simpan Draf" (shown, not blocking) and on "Ajukan" (blocking for errors).
3. The rule set is §10. Messages are in Bahasa Indonesia and name the values involved.
4. Each work screen has "Periksa Semua" which re-runs the rules for every entry in the table and lists the problems.
5. Thresholds marked configurable are read from validation settings (FR-06).

### FR-12 Official-table preview (High)
1. Each criterion has a preview page (Kaprodi and Admin Prodi) showing its official tables in an accordion: code and title, row count, status badge.
2. Each table renders exactly per §8: header rows with merged groups, a column-number row, data rows, footer rows, and the notes under the table.
3. Unverified (`submitted`) rows appear in italics with a "Diajukan" marker. `draft` and `returned` rows are never shown.
4. Above each table, an issue line lists entries with errors or missing evidence, each linking to its entry.
5. A Nihil table shows the single row "Tidak ada data" and its note.
6. For a locked period, previews render from the stored snapshot, not from live data.
7. Preview and export are produced from the same compiled model, so they cannot differ.

### FR-13 Excel export (High)
1. Scopes: one table, one criterion, full LKPS, full LKPS + evidence ZIP. Kaprodi and Admin Prodi only.
2. Format `.xlsx`, one sheet per table, sheet name = table code (`1.A.4`). Full export adds sheets `Sampul`, `Identitas`, `Daftar PS`, `Tim Penyusun` before the tables and `Ringkasan` at the end.
3. Each sheet: title row, header rows with merged cells, column-number row, data, footer rows, notes. Numeric cells are numbers, not text.
4. Only `verified` rows are exported.
5. A table that is not `complete` gets a red banner row: "BELUM LENGKAP: n entri belum terverifikasi, m entri tanpa bukti".
6. `Ringkasan` lists every table: code, title, status, verified rows, excluded rows, entries without evidence.
7. Link Bukti cells: in the plain export, a hyperlink to the file's download URL; in the ZIP export, a relative path `bukti/<table-code>/<row>-<file-name>` and the files are included in the ZIP. Several files for one row are listed one per line.
8. File name: `LKPS - Sistem Informasi - TS 2025-2026 - <Scope> - YYYY-MM-DD.xlsx` (or `.zip`).
9. Every export writes an audit record.

### FR-14 Dashboard (High)
1. **Full view** (Kaprodi, Admin Prodi):
   - Five KPI boxes: Tabel Lengkap (x / 31), Menunggu Verifikasi (entries), Dikembalikan (entries), Bukti Belum Ada (entries in evidence-required tables without a file), Peringatan Validasi (entries with unresolved warnings). Each links to a filtered list.
   - "Kelengkapan per Kriteria": Identitas plus the six criteria, with tables complete / total, a progress bar and a link.
   - "Nilai Indikator": the raw values in §11, labelled "Angka mentah dari data terverifikasi · tanpa penilaian".
2. **"Tugas Saya"** (DTPR, Dosen; also shown to Kaprodi/Admin Prodi who are linked to a Dosen): own returned entries, own drafts, own entries without evidence; each row links to the entry.
3. The dashboard shows the latest accreditation rating only as the plain value recorded in Identitas Pengusul. No targets.
4. Without an open or locked period the dashboard shows the "Belum ada periode" empty state.

### FR-15 Period submission & lock (High)
1. Kaprodi opens "Ajukan & Kunci LKPS". The dialog lists tables that are not complete and counts of unresolved warnings.
2. Kaprodi may proceed with gaps after ticking "Saya memahami masih ada data yang belum lengkap".
3. On confirmation the system compiles all tables (verified rows only), stores an immutable snapshot of the compiled tables and the full export file, and sets the period to `locked`.
4. In a locked period every LKPS data write is rejected with "Periode terkunci. Data hanya dapat dilihat dan diekspor." Master data stays editable but does not change the snapshot.
5. Admin Sistem can reopen a locked period with a mandatory reason (minimum 10 characters). Earlier snapshots are kept and numbered.
6. Submitting again after a reopen creates a new snapshot.

### FR-16 Audit trail (Medium)
1. Every insert, update and delete on business tables is recorded with actor, time, entity, and before/after values.
2. Workflow and system events are recorded: login, logout, failed login, submit, verify, return, import, export, period create/lock/reopen, Nihil set/clear, user create/deactivate/reset.
3. Each entry form has "Riwayat" showing its records newest first, with a field-by-field difference for updates.
4. `/admin/audit` (Admin Sistem, Kaprodi) lists all records with filters: date range, actor, action, entity type.
5. Audit records cannot be changed or deleted through the application.

### FR-17 Notifications (Low)
1. The top-bar bell shows a count: for Kaprodi, the number of `submitted` entries; for other roles, the number of their own `returned` entries.
2. Clicking it opens `/verifikasi` (Kaprodi) or "Tugas Saya" (others).
3. No email, no push, no stored notification items.

---

## 7. Workflow Rules

### 7.1 State machine

| From | Action | Who | To | Conditions |
|---|---|---|---|---|
| (new) | Simpan Draf | Anyone allowed to create | `draft` | Identity fields valid |
| (new) / `draft` / `returned` | Ajukan | Owner, Admin Prodi | `submitted` | No errors; evidence present where required; every warning has a note |
| (new) / `draft` / `returned` / `submitted` / `verified` | Ajukan | Kaprodi | `verified` | Same conditions; audit marks `self_verified = true` (D-12) |
| `draft` / `returned` | Simpan Draf | Owner, Admin Prodi, Kaprodi | unchanged | — |
| `submitted` | Simpan / Ajukan (edit) | Owner, Admin Prodi | `submitted` | Same conditions as Ajukan |
| `verified` | Edit then Ajukan | Owner, Admin Prodi | `submitted` | Confirmation: "Entri ini sudah terverifikasi. Jika diubah, entri kembali berstatus Diajukan dan tidak masuk ekspor sampai diverifikasi ulang." (D-11) |
| `submitted` | Verifikasi | Kaprodi | `verified` | — |
| `submitted` | Kembalikan | Kaprodi | `returned` | Note ≥ 10 characters |
| `draft` / `returned` | Hapus | Owner, Admin Prodi, Kaprodi | deleted (soft) | Confirmation |
| `submitted` / `verified` | Hapus | Admin Prodi, Kaprodi | deleted (soft) | Confirmation naming the consequence |

### 7.2 Rules
1. "Simpan Draf" is not offered on a `submitted` or `verified` entry (an edit there is always a re-submit).
2. Verifying sets `verified_by` and `verified_at`. Returning stores the note and clears any previous verification fields.
3. Deleting is a soft delete; deleted entries disappear from every list, preview and export, and remain in the audit trail.
4. An entry that other entries link to (a Penelitian linked by a Publikasi; a PkM linked by a Diseminasi) cannot be deleted until the links are removed. Message: "Entri ini masih ditautkan oleh n entri lain."
5. Concurrent edits: saving an entry that someone else changed since it was opened is rejected with "Data telah diubah oleh pengguna lain. Muat ulang untuk melihat versi terbaru."
6. Type M (curriculum): any change to a mapping cell sets the mapping set to `draft` if it was `returned`, keeps `draft`, and sets `submitted` or `verified` back to `submitted` (or keeps `verified` when the actor is Kaprodi).

---

## 8. Table Specifications

Conventions for this section:
- **Field types:** `text` (≤ 255), `textarea` (≤ 5,000), `int` (integer ≥ 0), `dec` (decimal ≥ 0, 2 places), `money` (integer rupiah ≥ 0), `select(list)`, `pick(Master)`, `multi-pick(Master)`, `year` (one of the period's years), `date`, `file`.
- **Req** = required for "Ajukan". Fields marked **ID** are also required for "Simpan Draf".
- **Official columns** are listed left to right. `Group[A, B]` means a merged header "Group" above sub-columns A and B.
- Year columns always appear in the order TS-2, TS-1, TS (TS-3 first where stated). In money columns the value is Rp juta.
- A "√" column shows "√" in the year the item belongs to and is empty in the others.
- "Footer" rows are computed and appear after the data rows in bold.
- "Notes" are printed under the table exactly as written.

### 8.1 Identitas Pengusul — type S, period-scoped, owner Prodi, evidence: three required attachments

| Field | Type | Req | Notes |
|---|---|---|---|
| Perguruan Tinggi | text | ✓ ID | Seed: "Universitas Katolik Indonesia Atma Jaya" |
| Unit Pengelola Program Studi | text | ✓ | Seed: "Fakultas Biosains, Teknologi, dan Inovasi" |
| Jenis Program | select(Sarjana, Sarjana Terapan, Magister, Doktor, Diploma) | ✓ | Seed: Sarjana |
| Nama Program Studi | text | ✓ | Seed: "Sistem Informasi" |
| Alamat | textarea | ✓ | |
| Nomor Telepon | text | ✓ | |
| E-Mail | text (email format) | ✓ | Exported together with Website as "E-Mail dan Website" |
| Website | text (URL format) | ✓ | |
| Nomor SK Pendirian PT | text | ✓ | Footnote 1 |
| Tanggal SK Pendirian PT | date | ✓ | |
| Pejabat Penandatangan SK Pendirian PT | text | ✓ | |
| Nomor SK Pembukaan PS | text | ✓ | Footnote 2 |
| Tanggal SK Pembukaan PS | date | ✓ | |
| Pejabat Penandatangan SK Pembukaan PS | text | ✓ | |
| Tahun Pertama Kali Menerima Mahasiswa | int (1900–current year) | ✓ | |
| Peringkat Terbaru Akreditasi PS | select(ref `peringkat_akreditasi`) | ✓ | |
| Nomor SK BAN-PT | text | ✓ | Footnote 3. Label in UI: "Nomor SK BAN-PT / LAM" |
| Lampiran: SK Pendirian PT | file | ✓ | Period attachment `sk_pendirian` |
| Lampiran: SK Pembukaan PS | file | ✓ | Period attachment `sk_pembukaan` |
| Lampiran: SK Akreditasi PS terbaru | file | ✓ | Period attachment `sk_akreditasi` |

Export: a two-column sheet "Keterangan / Isian" in the order above, followed by the Keterangan footnotes 1–3 from the instrument.

### 8.2 Daftar Program Studi di UPPS — type E, period-scoped, owner Prodi, evidence: none

| Field | Type | Req | Notes |
|---|---|---|---|
| Jenis Program | select(as 8.1) | ✓ ID | |
| Nama Program Studi | text | ✓ ID | |
| Status/Peringkat | select(ref `peringkat_akreditasi`) | ✓ | |
| No. SK | text | ✓ | |
| Tgl. SK | date | ✓ | |
| Tgl. Kadaluarsa | date | ✓ | Must be after Tgl. SK |
| Program studi ini | boolean | | At most one row per period may be ticked |
| Jumlah Mahasiswa saat TS | int | ✓ | Read-only and derived from 2.A.1 (total Mahasiswa Aktif at TS) when "Program studi ini" is ticked |

Official columns: No. · Jenis Program · Nama Program Studi · Akreditasi Program Studi[Status/Peringkat, No. dan Tgl. SK, Tgl. Kadaluarsa] · Jumlah Mahasiswa saat TS
Footer: JUMLAH = sum of Jumlah Mahasiswa saat TS.
Notes: "4) Diisi dengan jumlah mahasiswa aktif di masing-masing PS saat TS."

### 8.3 Identitas Tim Penyusun — type E, period-scoped, owner Prodi, evidence: none

| Field | Type | Req | Notes |
|---|---|---|---|
| Dosen | pick(Dosen) | | Optional; pre-fills Nama and NIDN |
| Nama | text | ✓ ID | |
| NIDN | text | ✓ | |
| Jabatan | text | ✓ | e.g. "Ketua Tim" |
| Tanggal Pengisian | date | ✓ | Exported as DD-MM-YYYY |
| Sudah menandatangani | boolean | | Internal tracking only |

Export: one block per member (Nama, NIDN, Jabatan, Tanggal Pengisian, Tanda Tangan left blank for wet signature), as in the instrument.

---

### Criterion 1 — Budaya Mutu

### 8.4 Gambar 1.A Struktur Organisasi UPPS dan PS — period attachment, owner Prodi
- One image or PDF (`file`), stored as period attachment `org_chart`. Replaceable.
- Page shows the current file (image inline; PDF as a link) and upload/replace/remove controls.
- Not one of the 31 tables. Export: `Sampul` sheet lists "Gambar 1.A: <link or ZIP path>" or "Belum diunggah".

### 8.5 Tabel 1.A.1 Tabel Pimpinan dan Tupoksi UPPS dan PS — type E, period-scoped, owner Prodi, evidence: optional internal

| Field | Type | Req | Notes |
|---|---|---|---|
| Unit Kerja | text | ✓ ID | e.g. "Fakultas", "Program Studi", "Unit Penjaminan Mutu" |
| Dosen | pick(Dosen) | | Optional; pre-fills the next three fields |
| Nama Ketua | text | ✓ | |
| Periode Jabatan | text | ✓ | e.g. "2023–2027" |
| Pendidikan Terakhir | select(S1, S2, S3, Sp-1, Sp-2, Profesi) | ✓ | |
| Jabatan Fungsional | select(Tenaga Pengajar, Asisten Ahli, Lektor, Lektor Kepala, Guru Besar, –) | ✓ | |
| Tugas Pokok dan Fungsi | textarea | ✓ | |

Official columns: Unit Kerja · Nama Ketua · Periode Jabatan · Pendidikan Terakhir · Jabatan Fungsional · Tugas Pokok dan Fungsi
Footer: none. Notes: "Keterangan: Data yang ditulis dalam tabel ini termasuk Unit Penjaminan Mutu"
Order: creation order.

### 8.6 Tabel 1.A.2 Sumber Pendanaan UPPS/PS — type E, year values, owner Prodi, evidence: required

| Field | Type | Req | Notes |
|---|---|---|---|
| Sumber Pendanaan | select(ref `sumber_dana`) or "Lainnya" + text | ✓ ID | Unique per prodi (V-22) |
| Jumlah TS-2 / TS-1 / TS | money ×3 | ✓ (0 allowed) | Stored per academic year |
| Link Bukti | file | ✓ | |

Official columns: Sumber Pendanaan · TS-2 · TS-1 · TS · Link Bukti
Footer: none. Notes: "Keterangan: Data ditulis dalam jutaan rupiah"
Order: reference-list order, then custom labels alphabetically.

### 8.7 Tabel 1.A.3 Penggunaan Dana UPPS/PS — type E, year values, owner Prodi, evidence: required
Same as 8.6 with "Penggunaan Dana" from ref `penggunaan_dana`.
Official columns: Penggunaan Dana · TS-2 · TS-1 · TS · Link Bukti
Notes: "Keterangan: Data ditulis dalam jutaan rupiah"

### 8.8 Tabel 1.A.4 Rata-rata Beban DTPR per semester (EWMP) pada TS — type E, year = TS, owner DTPR, evidence: optional internal

| Field | Type | Req | Notes |
|---|---|---|---|
| Nama DTPR | pick(Dosen flagged DTPR at TS) | ✓ ID | One entry per Dosen for the TS year. DTPR users: fixed to themselves |
| SKS Pengajaran pada PS Sendiri | dec | ✓ | |
| SKS Pengajaran pada PS Lain, PT Sendiri | dec | ✓ | |
| SKS Pengajaran pada PT Lain | dec | ✓ | |
| SKS Penelitian | dec | ✓ | |
| SKS Pengabdian kepada Masyarakat | dec | ✓ | |
| SKS Manajemen PT Sendiri | dec | ✓ | Pre-filled with the default for the Dosen's Jabatan Struktural at TS (0 if none); editable (V-07) |
| SKS Manajemen PT Lain | dec | ✓ | |
| Total SKS | computed | | Sum of the seven values |

Official columns: No. · Nama DTPR · SKS Pengajaran Pada[PS Sendiri, PS Lain PT Sendiri, PT Lain] · SKS Penelitian · SKS Pengabdian kepada Masyarakat · SKS Manajemen[PT Sendiri, PT Lain] · Total SKS
Footer: "Jumlah" = sum of each numeric column; "Rata-rata" = average of each numeric column over the listed DTPR (2 decimals).
Notes (print all):
- "1) SKS pengajaran sama dengan sks mata kuliah yang diajarkan."
- "2) SKS penelitian dan pengabdian kepada masyarakat dihitung sesuai dengan peraturan yang berlaku di Perguruan Tinggi."
- "3) SKS (beban kerja) manajemen: rektor/direktur politeknik 12 sks; pembantu rektor/dekan/ketua sekolah tinggi/direktur akademi 10 sks; ketua lembaga/kepala UPT 8 sks; pembantu dekan/ketua jurusan/kepala pusat/ketua senat akademik/ketua senat fakultas 6 sks; sekretaris jurusan/sekretaris pusat/sekretaris senat akademik/sekretaris senat universitas/sekretaris senat fakultas/kepala lab. atau studio/kepala balai/ketua PS 4 sks; sekretaris PS 3 sks."
- "* Diisi dengan jumlah dari masing-masing kolom. ** Diisi dengan rata-rata dari masing-masing kolom."
Order: Nama DTPR A–Z. Form help text: "Isi rata-rata beban per semester pada tahun TS."

### 8.9 Tabel 1.A.5 Kualifikasi Tenaga Kependidikan — type E, year = TS, owner Prodi, evidence: optional internal

| Field | Type | Req | Notes |
|---|---|---|---|
| Jenis Tenaga Kependidikan | select(ref `jenis_tendik`) | ✓ ID | One entry per jenis for the TS year |
| S3, S2, S1, D4, D3, D2, D1, SMA/SMK/MA | int ×8 | ✓ (0 allowed) | |
| Unit Kerja | text | ✓ | |

Official columns: No. · Jenis Tenaga Kependidikan · Jumlah Tenaga Kependidikan dengan Pendidikan Terakhir[S3, S2, S1, D4, D3, D2, D1, SMA/SMK/MA] · Unit Kerja
Footer: "Total" = sum of each education column.
Notes: "*) Pustakawan adalah staf perpustakaan yang memiliki ijazah atau sertifikat kompetensi pada bidang ilmu perpustakaan." (the row label Pustakawan is printed "Pustakawan *)")
Order: reference-list order (Pustakawan, Laboran/Teknisi, Administrasi, Lainnya).

### 8.10 Tabel 1.B Tabel Unit SPMI dan SDM — type E, period-scoped, owner Prodi, evidence: required (three slots)

| Field | Type | Req | Notes |
|---|---|---|---|
| Unit SPMI | select(PT, UPPS, PS, Lainnya + text) | ✓ ID | |
| Nama Unit SPMI | text | ✓ | |
| Dokumen SPMI | file (slot `dokumen_spmi`) | ✓ | |
| Jumlah Auditor Mutu Internal | int | ✓ | |
| Certified | int | ✓ | V-08 |
| Non Certified | int | ✓ | V-08 |
| Frekuensi audit/monev per tahun | int | ✓ | |
| Bukti Certified Auditor | file (slot `bukti_certified`) | ✓ when Certified > 0 | |
| Laporan Audit | file (slot `laporan_audit`) | ✓ | |

Official columns: Unit SPMI · Nama Unit SPMI · Dokumen SPMI · Jumlah Auditor Mutu Internal · Certified · Non Certified · Frekuensi audit/monev per tahun · Bukti Certified Auditor · Laporan Audit
Footer: none. Order: PT, UPPS, PS, others.

---

### Criterion 2 — Relevansi Pendidikan

### 8.11 Tabel 2.A.1 Data Mahasiswa — type Y (TS-3, TS-2, TS-1, TS), owner Prodi, evidence: optional internal

| Field | Type | Req |
|---|---|---|
| Daya Tampung | int | ✓ |
| Pendaftar | int | ✓ |
| Pendaftar Afirmasi | int | ✓ |
| Pendaftar Kebutuhan Khusus | int | ✓ |
| Mahasiswa Baru · Reguler · Diterima / Afirmasi / Kebutuhan Khusus | int ×3 | ✓ |
| Mahasiswa Baru · RPL · Diterima / Afirmasi / Kebutuhan Khusus | int ×3 | ✓ |
| Mahasiswa Aktif · Reguler · Diterima / Afirmasi / Kebutuhan Khusus | int ×3 | ✓ |
| Mahasiswa Aktif · RPL · Diterima / Afirmasi / Kebutuhan Khusus | int ×3 | ✓ |

Computed, shown in the form: **Total Mahasiswa Baru** and **Total Mahasiswa Aktif** = sum of the six values in the respective group `[CONFIRM A-01]`.

Official columns: TS · Daya Tampung · Jumlah Calon Mahasiswa[Pendaftar, Pendaftar Afirmasi, Pendaftar Kebutuhan Khusus] · Jumlah Mahasiswa Baru[Reguler[Diterima, Afirmasi, Kebutuhan Khusus], RPL[Diterima, Afirmasi, Kebutuhan Khusus]] · Jumlah Mahasiswa Aktif[Reguler[Diterima, Afirmasi, Kebutuhan Khusus], RPL[Diterima, Afirmasi, Kebutuhan Khusus]]
Rows: TS-3, TS-2, TS-1, TS (label only, e.g. "TS-1"). A year without a verified entry shows "—" in every cell.
Footer: "Jumlah" = sum of each column over the four rows.
Notes:
- "1. Mahasiswa (baru/aktif) transfer adalah mahasiswa pindahan/alih jenjang dari PS dalam institusi sendiri atau institusi lain. Mahasiswa tersebut tidak mengikuti program PS mulai dari awal, karena ada sejumlah SKS yang diakui, yang diperoleh dari PS asal."
- "2. RPL (Rekognisi Pembelajaran Lampau) yang dimaksud adalah RPL tipe A-1 berupa rekognisi dari pendidikan formal, misalnya untuk mahasiswa yang pindah program studi."
Year-card key numbers: Pendaftar, Total Mahasiswa Baru, Total Mahasiswa Aktif.

### 8.12 Tabel 2.A.2 Keragaman Asal Mahasiswa — type E, year values, owner Prodi, evidence: required

| Field | Type | Req | Notes |
|---|---|---|---|
| Asal Mahasiswa | select(Kota/Kab sama dengan PS, Kota/Kabupaten Lain, Provinsi Lain, Negara Lain, Afirmasi, Berkebutuhan Khusus) | ✓ ID | |
| Rincian | text | | Optional name of the kota/provinsi/negara. Unique within its Asal category |
| Jumlah Mahasiswa Baru TS-2 / TS-1 / TS | int ×3 | ✓ | |
| Link Bukti | file | ✓ | |

Official columns: Asal Mahasiswa · Jumlah Mahasiswa Baru[TS-2, TS-1, TS] · Link Bukti
Rows: grouped in the category order above. A category with one entry and no Rincian prints the category name. Entries with Rincian print the category name as a group row (no numbers) followed by indented Rincian rows.
Footer: "Jumlah" = sum of all entries per year `[CONFIRM A-01]`.

### 8.13 Tabel 2.A.3 Kondisi Jumlah Mahasiswa — type Y by cohort (TS-2, TS-1, TS), period-scoped, owner Prodi, evidence: optional internal

One entry per cohort year (students who entered in that year):

| Field | Type | Req | Notes |
|---|---|---|---|
| Mahasiswa Baru | computed | | Total Mahasiswa Baru of that year from 2.A.1 (verified); "—" if missing |
| Mahasiswa Aktif pada saat TS | int | ✓ | |
| Lulus pada saat TS | int | ✓ | |
| Mengundurkan Diri/DO pada saat TS | int | ✓ | |

Official layout (rows are measures, columns are cohorts): first column blank header; columns TS-2 · TS-1 · TS · Jumlah.
Rows: Mahasiswa Baru · Mahasiswa Aktif pada saat TS · Lulus pada saat TS · Mengundurkan Diri/DO pada saat TS. "Jumlah" = sum across the three cohorts.

### 8.14 Tabel 2.B.1 Tabel Isi Pembelajaran — type M, owner Dosen (own courses) / Prodi

- Matrix: rows = active Mata Kuliah; columns = active Profil Lulusan. A cell is a checkbox "mata kuliah supports this PL".
- Dosen may toggle cells only in rows of courses they teach.
Official columns: No · Mata Kuliah · SKS · Semester · Profil Lulusan (PL)[PL 1, PL 2, …, PL n]. Mapped cells show "√".
Order: Semester, then Kode.

### 8.15 Tabel 2.B.2 Pemetaan Capaian Pembelajaran Lulusan dan Profil Lulusan — type M, owner Prodi

- Matrix: rows = active CPL; columns = active PL; checkbox cells.
Official columns: (CPL code) · PL 1 · PL 2 · … · PL n. Mapped cells show "√".

### 8.16 Tabel 2.B.3 Peta Pemenuhan CPL — type M, owner Dosen (own courses) / Prodi

- Editor: accordion per CPL; inside, one row per CPMK with a multi-pick of Mata Kuliah. Dosen may add or remove only their own courses.
Official columns: CPL · CPMK · Semester 1 · Semester 2 · … · Semester n (n = highest semester among active courses, minimum 8). A cell lists the Kode of every course mapped to that CPMK and taught in that semester, comma-separated. The CPL cell is merged over its CPMK rows.

Rules for 8.14–8.16: they share one workflow record ("Pemetaan Kurikulum") per period. "Ajukan Pemetaan" is available to Kaprodi and Admin Prodi. Requirements to submit: every active Mata Kuliah maps to at least one PL (warning V-23 otherwise), every CPL maps to at least one PL, every CPMK maps to at least one Mata Kuliah (warnings).

### 8.17 Data Lulusan → Tabel 2.B.4 and Tabel 2.B.5 — type Y by graduation year (TS-2, TS-1, TS), owner Prodi, evidence: optional internal (D-17)

| Field | Type | Req | Feeds |
|---|---|---|---|
| Jumlah Lulusan | int | ✓ | 2.B.4, 2.B.5, 2.B.6, 2.D |
| Jumlah Lulusan yang Terlacak | int | ✓ | 2.B.4, 2.B.5 |
| Rata-rata Waktu Tunggu (Bulan) | dec | ✓ | 2.B.4 |
| Profesi Kerja Bidang Infokom | int | ✓ | 2.B.5 |
| Profesi Kerja Bidang NON Infokom | int | ✓ | 2.B.5 |
| Lingkup: Multinasional/Internasional | int | ✓ | 2.B.5 |
| Lingkup: Nasional | int | ✓ | 2.B.5 |
| Lingkup: Wirausaha | int | ✓ | 2.B.5 |

**Tabel 2.B.4 Rata-rata Masa Tunggu Lulusan untuk Bekerja Pertama Kali**
Official columns: Tahun Lulus · Jumlah Lulusan · Jumlah Lulusan yang Terlacak · Rata-rata Waktu Tunggu (Bulan)
Rows: TS-2, TS-1, TS. Footer "Jumlah": sum, sum, and the average waiting time weighted by Jumlah Lulusan yang Terlacak (2 decimals).

**Tabel 2.B.5 Kesesuaian Bidang Kerja Lulusan**
Official columns: Tahun Lulus · Jumlah Lulusan · Jumlah Lulusan yang Terlacak · Profesi Kerja Bidang Infokom · Profesi Kerja Bidang NON Infokom · Lingkup Tempat Kerja[Multinasional/Internasional, Nasional, Wirausaha]
Rows: TS-2, TS-1, TS. Footer "Jumlah": sum of each column.

Both tables share the status of the Data Lulusan entries `[CONFIRM A-03]`.

### 8.18 Tabel 2.B.6 Kepuasan Pengguna Lulusan — type S (year = TS), owner Prodi, evidence: optional internal

Seven fixed rows, in this order: Kerjasama Tim · Keahlian di Bidang Prodi · Kemampuan Berbahasa Asing (Inggris) · Kemampuan Berkomunikasi · Pengembangan Diri · Kepemimpinan · Etos Kerja.

| Field (per row) | Type | Req |
|---|---|---|
| Sangat Baik (%) | dec 0–100 | ✓ |
| Baik (%) | dec 0–100 | ✓ |
| Cukup (%) | dec 0–100 | ✓ |
| Kurang (%) | dec 0–100 | ✓ |
| Rencana Tindak Lanjut oleh UPPS/PS | textarea | ✓ |

Plus one field: **Jumlah pengguna lulusan sebagai responden** (int, ✓).

Official columns: No · Jenis Kemampuan · Tingkat Kepuasan Pengguna (%)[Sangat Baik, Baik, Cukup, Kurang] · Rencana Tindak Lanjut oleh UPPS/PS
Footer rows:
- "Jumlah" = sum of each percentage column.
- "Jumlah alumni/lulusan dalam 3 tahun terakhir" = sum of Jumlah Lulusan for TS-2..TS from Data Lulusan (verified).
- "Jumlah pengguna lulusan sebagai responden" = the input.
- "Jumlah mahasiswa aktif pada tahun TS" = Total Mahasiswa Aktif at TS from 2.A.1 (verified).

### 8.19 Tabel 2.C Fleksibilitas Dalam Proses Pembelajaran — type E, year values, owner Prodi, evidence: required

| Field | Type | Req | Notes |
|---|---|---|---|
| Bentuk Pembelajaran | select(ref `bentuk_pembelajaran`) or "Lainnya" + text | ✓ ID | Unique per prodi |
| Jumlah mahasiswa TS-2 / TS-1 / TS | int ×3 | ✓ | V-16 |
| Link Bukti | file | ✓ | |

Official layout:
- Header row: Tahun Akademik · TS-2 · TS-1 · TS · Link Bukti
- Row "Jumlah Mahasiswa Aktif" = Total Mahasiswa Aktif per year from 2.A.1 (verified).
- Sub-header row: "Bentuk Pembelajaran" · "Jumlah mahasiswa untuk setiap bentuk pembelajaran" (merged over the year columns).
- One row per entry (reference-list order).
- Footer "Jumlah" = sum per year. Footer "Persentase" = Jumlah ÷ Jumlah Mahasiswa Aktif × 100 (1 decimal, "—" if the divisor is 0 or missing).

### 8.20 Tabel 2.D Rekognisi dan Apresiasi Kompetensi Lulusan — type E, year values, owner Prodi, evidence: required

| Field | Type | Req | Notes |
|---|---|---|---|
| Sumber Rekognisi | select(ref `sumber_rekognisi`) or "Lainnya" + text | ✓ ID | |
| Jenis Pengakuan Lulusan (Rekognisi) | text | ✓ ID | |
| Jumlah TS-2 / TS-1 / TS | int ×3 | ✓ | |
| Link Bukti | file | ✓ | |

Official columns: Sumber Rekognisi · Jenis Pengakuan Lulusan (Rekognisi) · Tahun Akademik[TS-2, TS-1, TS] · Link Bukti
Footer: "Jumlah Rekognisi" = sum per year; "Jumlah Lulusan" = Jumlah Lulusan per year from Data Lulusan (verified); "Persentase" = Jumlah Rekognisi ÷ Jumlah Lulusan × 100 (1 decimal).
Order: Sumber (reference-list order), then Jenis Pengakuan A–Z.

---

### Criterion 3 — Relevansi Penelitian

### 8.21 Prasarana (shared by Tabel 3.A.1, 4.A.1 and 5.2) — entries of type E, not year-bound, owner Prodi, evidence: required

| Field | Type | Req | Notes |
|---|---|---|---|
| Nama Prasarana | text | ✓ ID | Unique per prodi |
| Daya Tampung | int | ✓ | |
| Luas Ruang (m²) | dec | ✓ | |
| Kepemilikan | select(M = Milik sendiri, W = Sewa) | ✓ | |
| Lisensi | select(L = Berlisensi, P = Public Domain, T = Tidak Berlisensi) | ✓ | |
| Perangkat | textarea | ✓ | Hardware, software, bandwidth, devices, tools |
| Digunakan untuk | checkboxes: Penelitian, PkM, Pendidikan | ✓ (at least one) | Decides which tables list it |
| Link Bukti | file | ✓ | |

**Tabel 3.A.1 Sarana dan Prasarana Penelitian** (type D: Prasarana with "Penelitian" ticked)
Official columns: Nama Prasarana · Daya Tampung · Luas Ruang (m²) · Milik sendiri (M)/Sewa (W) · Berlisensi (L)/Public Domain (P)/Tidak Berlisensi (T) · Perangkat · Link Bukti
Notes: "Prasarana diisi nama laboratorium" · "Perangkat yang dimiliki diisi perangkat keras, perangkat lunak, bandwidth, device, tool dan lain-lain."
The work screen for 3.A.1 lists those Prasarana; "Tambah" opens the shared form with "Penelitian" pre-ticked. Order: Nama A–Z.

### 8.22 Tabel 3.A.2 Penelitian DTPR, Hibah dan Pembiayaan Penelitian — type E, year values, owner DTPR (Ketua), evidence: required

| Field | Type | Req | Notes |
|---|---|---|---|
| Judul Penelitian | text (≤ 500) | ✓ ID | V-19 |
| Ketua | pick(Dosen) | ✓ ID | Becomes the owner. DTPR users: fixed to themselves. V-17 |
| Anggota Dosen | multi-pick(Dosen) | | Excludes the Ketua |
| Mahasiswa yang Terlibat | multi-pick(Mahasiswa) | | The count is derived |
| Jenis Hibah Penelitian | select(ref `jenis_hibah`) | ✓ | |
| Sumber | select(L = Lokal/Wilayah, N = Nasional, I = Internasional) | ✓ | |
| Durasi (tahun) | int ≥ 1 | ✓ | |
| Pendanaan TS-2 / TS-1 / TS | money ×3 | ✓ at least one year entered (0 allowed) | A blank year prints "—" |
| Link Bukti | file | ✓ | |

Period attachment on this page: **Roadmap Penelitian** (file, `roadmap_penelitian`).

Official layout:
- Preamble row: "Roadmap" · link to the roadmap file (or "Belum diunggah").
- Columns: No · Nama DTPR (Ketua) · Judul Penelitian · Jumlah Mahasiswa yang Terlibat · Jenis Hibah Penelitian · Sumber L/N/I · Durasi (tahun) · Pendanaan (Rp juta)[TS-2, TS-1, TS] · Link Bukti
- Footer: "Jumlah Dana" = sum per year; "Jumlah Jenis Hibah" = number of distinct Jenis Hibah; "Jumlah Penelitian" = number of rows.
- Notes: "L: Lokal/Wilayah, N: Nasional, I : Internasional"
A research item appears when it has funding entered for at least one of TS-2..TS. Order: Ketua A–Z, then Judul.
The side sheet also shows read-only "Publikasi terkait" and "HKI terkait" (entries of 3.C.2 / 3.C.3 linked to this research).

### 8.23 Tabel 3.A.3 Pengembangan DTPR di Bidang Penelitian — type E, year = one of TS-2..TS, owner DTPR, evidence: required

| Field | Type | Req | Notes |
|---|---|---|---|
| Nama DTPR | pick(Dosen) | ✓ ID | DTPR users: fixed to themselves |
| Jenis Pengembangan DTPR | select(ref `jenis_pengembangan_dtpr`) | ✓ ID | |
| Tahun Akademik | year (TS-2..TS) | ✓ ID | V-20 |
| Keterangan | text | | Internal, e.g. name of the programme |
| Link Bukti | file | ✓ | |

Official layout:
- Header row: Tahun Akademik · TS-2 · TS-1 · TS · Link Bukti
- Row "Jumlah Dosen DTPR" = number of Dosen flagged DTPR in each year.
- Sub-header: Jenis Pengembangan DTPR · Nama DTPR · Jumlah (merged over the year columns)
- One row per (Jenis, DTPR): the count of entries in each year.
- Notes: "Keterangan: Pengisian data tidak berulang, jika dosen dikirim tugas belajar di tahun TS-3, maka tidak lagi dihitung di TS-2."
Order: Jenis (reference-list order), then Nama DTPR.

Section 3.B of the instrument is covered by Tabel 3.A.2 (print nothing).

### 8.24 Tabel 3.C.1 Kerjasama Penelitian — type E, year values, owner DTPR (creator's Dosen) or Prodi, evidence: required

| Field | Type | Req | Notes |
|---|---|---|---|
| Judul Kerjasama | text (≤ 500) | ✓ ID | |
| Mitra Kerja Sama | pick(Mitra) | ✓ ID | "Tambah mitra baru" available to Kaprodi/Admin Prodi inside the picker |
| Penanggung Jawab (DTPR) | pick(Dosen) | ✓ for DTPR users (fixed to themselves); optional for Prodi | Sets the owner |
| Sumber | select(L, N, I) | ✓ | |
| Durasi (Tahun) | int ≥ 1 | ✓ | |
| Pendanaan TS-2 / TS-1 / TS | money ×3 | ✓ at least one year entered | |
| Link Bukti | file | ✓ | |

Official columns: No · Judul Kerjasama · Mitra Kerja Sama · Sumber L/N/I · Durasi (Tahun) · Pendanaan (Rp Juta)[TS-2, TS-1, TS] · Link Bukti
Footer: "Jumlah Dana" = sum per year; "Jumlah Mitra Kerjasama" = number of distinct Mitra.
Notes: "L: Lokal/Wilayah, N: Nasional, I : Internasional". Order: Judul A–Z.

### 8.25 Tabel 3.C.2 Publikasi Penelitian — type E, year = one of TS-2..TS, owner DTPR, evidence: required

| Field | Type | Req | Notes |
|---|---|---|---|
| Nama DTPR | pick(Dosen) | ✓ ID | One DTPR per publication `[CONFIRM A-04]` |
| Judul Publikasi | text (≤ 500) | ✓ ID | V-19 |
| Jenis Publikasi | select(IB, I, S1, S2, S3, S4, T) | ✓ | Shown with labels: IB = Internasional Bereputasi; I = Internasional tidak Bereputasi; S1–S4 = Jurnal Sinta 1–4; T = Tidak Terakreditasi |
| Tahun Terbit | year (TS-2..TS) | ✓ | |
| Penelitian terkait | pick(Penelitian of 3.A.2) | | Optional link |
| URL / DOI | text (URL) | | Internal convenience, not exported |
| Link Bukti | file | ✓ | |

Official columns: No · Nama DTPR · Judul Publikasi · Jenis Publikasi (IB/I/S1,S2,S3,S4,T) · Tahun Terbit (beri tanda √)[TS-2, TS-1, TS] · Link Bukti
Footer: "Jumlah Publikasi" = count per year.
Notes: "1. IB: Internasional Bereputasi, I: Internasional tidak Bereputasi" · "2. S1: Jurnal Sinta 1, S2: Jurnal Sinta 2, S3: Jurnal Sinta 3, S4: Jurnal Sinta 4, T: Tidak Terakreditasi"
Order: Nama DTPR, then Tahun, then Judul.

### 8.26 Tabel 3.C.3 Perolehan HKI (Granted) — type E, year = one of TS-2..TS, owner DTPR, evidence: required

| Field | Type | Req | Notes |
|---|---|---|---|
| Judul | text (≤ 500) | ✓ ID | V-19 |
| Jenis HKI | select(ref `jenis_hki`) | ✓ | |
| Nama DTPR | pick(Dosen) | ✓ ID | `[CONFIRM A-04]` |
| Tahun Perolehan | year (TS-2..TS) | ✓ | |
| Penelitian terkait | pick(Penelitian of 3.A.2) | | Optional link |
| Link Bukti | file | ✓ | |

Official columns: No · Judul · Jenis HKI · Nama DTPR · Tahun Perolehan (Beri Tanda √)[TS-2, TS-1, TS] · Link Bukti
Footer: "Jumlah HKI" = count per year. Order: Tahun, then Judul.

---

### Criterion 4 — Relevansi PkM

### 8.27 Tabel 4.A.1 Sarana dan Prasarana PkM — type D (Prasarana with "PkM" ticked)
Official columns: Nama Prasarana · Daya Tampung · Luas Ruang (m2) · Milik Sendiri (M)/ Sewa (W) · Berlisensi (L)/Public Domain (P)/Tidak Berlisensi (T) · Perangkat · Link Bukti
Notes: "Prasarana diisi nama laboratorium, nama bengkel dan lain-lain" · "Perangkat yang dimiliki diisi perangkat keras, perangkat lunak, bandwidth, device, tool dan lain-lain"

### 8.28 Tabel 4.A.2 PkM DTPR, Hibah dan Pembiayaan PkM — type E, year values, owner DTPR (Ketua), evidence: required
Fields: identical to 8.22 with "Judul PkM", "Jenis Hibah PkM" (same ref `jenis_hibah`), "Sumber Dana".
Period attachment on this page: **Roadmap PkM** (`roadmap_pkm`).
Official layout:
- Preamble row: "Roadmap" · link.
- Columns: No · Nama DTPR (Sebagai Ketua PkM) · Judul PkM · Jumlah Mahasiswa yang Terlibat · Jenis Hibah PkM · Sumber Dana L/N/I · Durasi (tahun) · Pendanaan (Rp Juta)[TS-2, TS-1, TS] · Link Bukti
- Footer: "Jumlah Dana" = sum per year; "Jumlah PkM" = number of rows; "Jumlah Jenis Hibah PKM" = distinct Jenis Hibah.
- Notes: "L: Lokal/Wilayah, N: Nasional, I : Internasional"
The side sheet shows read-only "Diseminasi terkait" and "HKI terkait".

Section 4.B of the instrument is covered by Tabel 4.A.2 (print nothing).

### 8.29 Tabel 4.C.1 Kerjasama PkM — type E, year values, owner as 8.24, evidence: required
Fields: identical to 8.24.
Official columns: No · Judul Kerjasama · Mitra kerja sama · Sumber L/N/I · Durasi (tahun) · Pendanaan (Rp Juta)[TS-2, TS-1, TS] · Link Bukti
Footer: "Jumlah Dana" = sum per year; "Jumlah Kerjasama" = number of rows.
Notes: "L: Lokal/Wilayah, N: Nasional, I : Internasional"

### 8.30 Tabel 4.C.2 Diseminasi Hasil PkM — type E, year = one of TS-2..TS, owner DTPR (Ketua of the linked PkM), evidence: required

| Field | Type | Req | Notes |
|---|---|---|---|
| PkM | pick(PkM of 4.A.2) | ✓ ID | DTPR users: only PkM they lead. Provides Nama DTPR (Ketua) and Judul |
| Diseminasi Hasil PkM | select(L, N, I) | ✓ | Scope of the dissemination |
| Tahun Akademik | year (TS-2..TS) | ✓ | |
| Bentuk Diseminasi | text | | Internal, e.g. "Seminar nasional" |
| Link Bukti | file | ✓ | |

Official columns: No · Nama DTPR (Ketua) · Judul · Diseminasi Hasil PkM (L/N/I) · TS-2 · TS-1 · TS · Link Bukti (year columns show "√")
Footer rows: "Jumlah Judul PkM" = distinct PkM; "Jumlah Diseminasi Hasil PkM" = number of rows; "Jumlah PkM Lokal" / "Jumlah PkM Nasional" / "Jumlah PkM Internasional" = rows by scope.
Order: Nama DTPR, then Judul, then Tahun.

### 8.31 Tabel 4.C.3 Perolehan HKI PkM — type E, year = one of TS-2..TS, owner DTPR, evidence: required
Fields: identical to 8.26, with optional "PkM terkait" instead of "Penelitian terkait".
Official columns: No · Judul · Jenis HKI · Nama DTPR · Tahun Perolehan (beri tanda √)[TS-2, TS-1, TS] · Link Bukti
Footer: "Jumlah HKI" = count per year.

---

### Criterion 5 — Akuntabilitas

### 8.32 Tabel 5.1. Sistem Tata Kelola — type E, period-scoped, owner Prodi, evidence: required

| Field | Type | Req | Notes |
|---|---|---|---|
| Jenis Tata Kelola | select(ref `jenis_tata_kelola`) or "Lainnya" + text | ✓ ID | Several systems per jenis are allowed |
| Nama Sistem Informasi | text | ✓ ID | |
| Akses | select(Lokal, Internet) | ✓ | |
| Unit Kerja/SDM Pengelola | text | ✓ | |
| Link Bukti | file | ✓ | |

Official columns: No · Jenis Tata Kelola · Nama Sistem Informasi · Akses (Lokal/Internet) · Unit Kerja/SDM Pengelola · Link Bukti
Order: reference-list order of Jenis (Pendidikan, Keuangan, SDM, Sarana Prasarana, Sistem Penjaminan Mutu, others), then Nama Sistem.

### 8.33 Tabel 5.2 Sarana dan Prasarana Pendidikan — type D (Prasarana with "Pendidikan" ticked)
Official columns: Nama Prasarana · Daya Tampung · Luas Ruang (m²) · Milik sendiri (M)/Sewa (W) · Berlisensi (L)/Public Domain (P)/Tidak berlisensi (T) · Perangkat · Link Bukti
Notes: "Prasarana diisi prasarana untuk pembelajaran, misal: ruang kelas, nama laboratorium, ruang perpustakaan/ruang baca, dsb." · "Perangkat yang dimiliki diisi perangkat keras, perangkat lunak, bandwidth, device, tool dan bahan pustaka, dll."

---

### Criterion 6 — Diferensiasi Misi

### 8.34 Tabel 6. Kesesuaian Visi, Misi — type S, period-scoped, owner Prodi, evidence: optional internal

| Field | Type | Req |
|---|---|---|
| Visi PT | textarea | ✓ |
| Visi UPPS | textarea | ✓ |
| Visi Keilmuan PS | textarea | ✓ |
| Misi PT | textarea | ✓ |
| Misi UPPS | textarea | ✓ |

Official layout (a 3-column grid, as the instrument):
- Row 1 (header): Visi PT · Visi UPPS · Visi Keilmuan PS
- Row 2: the three texts
- Row 3 (header): Misi PT · Misi UPPS · (empty)
- Row 4: the two texts · (empty)
Line breaks in the text are preserved.

### 8.35 Table catalogue (summary)

| Code | Title | Type | Owner | Evidence | Time anchor |
|---|---|---|---|---|---|
| 1.A.1 | Pimpinan dan Tupoksi UPPS dan PS | E | Prodi | optional | period |
| 1.A.2 | Sumber Pendanaan UPPS/PS | E | Prodi | required | TS-2..TS values |
| 1.A.3 | Penggunaan Dana UPPS/PS | E | Prodi | required | TS-2..TS values |
| 1.A.4 | Rata-rata Beban DTPR per semester (EWMP) pada TS | E | DTPR | optional | TS |
| 1.A.5 | Kualifikasi Tenaga Kependidikan | E | Prodi | optional | TS |
| 1.B | Unit SPMI dan SDM | E | Prodi | required (3 slots) | period |
| 2.A.1 | Data Mahasiswa | Y | Prodi | optional | TS-3..TS |
| 2.A.2 | Keragaman Asal Mahasiswa | E | Prodi | required | TS-2..TS values |
| 2.A.3 | Kondisi Jumlah Mahasiswa | Y | Prodi | optional | period, cohorts TS-2..TS |
| 2.B.1 | Isi Pembelajaran | M | Dosen/Prodi | — | period |
| 2.B.2 | Pemetaan CPL dan PL | M | Prodi | — | period |
| 2.B.3 | Peta Pemenuhan CPL | M | Dosen/Prodi | — | period |
| 2.B.4 | Rata-rata Masa Tunggu Lulusan | Y (Data Lulusan) | Prodi | optional | TS-2..TS |
| 2.B.5 | Kesesuaian Bidang Kerja Lulusan | Y (Data Lulusan) | Prodi | optional | TS-2..TS |
| 2.B.6 | Kepuasan Pengguna Lulusan | S | Prodi | optional | TS |
| 2.C | Fleksibilitas Dalam Proses Pembelajaran | E | Prodi | required | TS-2..TS values |
| 2.D | Rekognisi dan Apresiasi Kompetensi Lulusan | E | Prodi | required | TS-2..TS values |
| 3.A.1 | Sarana dan Prasarana Penelitian | D | Prodi | required | current |
| 3.A.2 | Penelitian DTPR, Hibah dan Pembiayaan Penelitian | E | DTPR | required | TS-2..TS values |
| 3.A.3 | Pengembangan DTPR di Bidang Penelitian | E | DTPR | required | one year |
| 3.C.1 | Kerjasama Penelitian | E | DTPR/Prodi | required | TS-2..TS values |
| 3.C.2 | Publikasi Penelitian | E | DTPR | required | one year |
| 3.C.3 | Perolehan HKI (Granted) | E | DTPR | required | one year |
| 4.A.1 | Sarana dan Prasarana PkM | D | Prodi | required | current |
| 4.A.2 | PkM DTPR, Hibah dan Pembiayaan PkM | E | DTPR | required | TS-2..TS values |
| 4.C.1 | Kerjasama PkM | E | DTPR/Prodi | required | TS-2..TS values |
| 4.C.2 | Diseminasi Hasil PkM | E | DTPR | required | one year |
| 4.C.3 | Perolehan HKI PkM | E | DTPR | required | one year |
| 5.1 | Sistem Tata Kelola | E | Prodi | required | period |
| 5.2 | Sarana dan Prasarana Pendidikan | D | Prodi | required | current |
| 6 | Kesesuaian Visi, Misi | S | Prodi | optional | period |

Total: 31 tables (6 + 11 + 6 + 5 + 2 + 1).

---

## 9. Data Reuse Map (core of G1)

| Source (entered once) | Reused by |
|---|---|
| Dosen master | 1.A.1, 1.A.4, 3.A.2, 3.A.3, 3.C.1–3.C.3, 4.A.2, 4.C.1–4.C.3, Tim Penyusun, Mata Kuliah pengampu |
| Dosen per-year DTPR flag | 1.A.4 picker, "Jumlah Dosen DTPR" row in 3.A.3, dashboard indicators |
| Mahasiswa master | "Jumlah Mahasiswa yang Terlibat" in 3.A.2 and 4.A.2 (count of linked students) |
| Mitra master | 3.C.1, 4.C.1 |
| Prasarana entry | 3.A.1, 4.A.1, 5.2 (by usage flags) |
| Mata Kuliah, PL, CPL, CPMK | 2.B.1, 2.B.2, 2.B.3 |
| 2.A.1 Data Mahasiswa | "Mahasiswa Baru" row of 2.A.3; "Jumlah Mahasiswa Aktif" row of 2.C; footer of 2.B.6; "Jumlah Mahasiswa saat TS" in Daftar PS; V-12 |
| Data Lulusan | 2.B.4, 2.B.5, footer of 2.B.6, footer of 2.D |
| Penelitian (3.A.2) | Optional link from 3.C.2 and 3.C.3 |
| PkM (4.A.2) | Required link from 4.C.2; optional link from 4.C.3 |
| Evidence file | Any number of entries |

---

## 10. Validation Rules

Severity: **E** = error (blocks Ajukan); **W** = warning (needs a note).

| ID | Applies to | Rule | Sev. | Message template |
|---|---|---|---|---|
| V-01 | All | Required fields filled; numbers ≥ 0; formats valid | E | "<Field> wajib diisi." / "<Field> harus berupa angka ≥ 0." |
| V-02 | Tables with evidence required | At least one file in every required evidence slot | E | "Link Bukti wajib diunggah sebelum diajukan." |
| V-03 | Year-bound entries | The year is within the active period (TS-2..TS; TS-3..TS for 2.A.1; TS for 1.A.4, 1.A.5, 2.B.6) | E | "Tahun akademik di luar rentang periode aktif." |
| V-04 | Masters | NIDN, NIM, Kode MK, Kode PL, Kode CPL, Nama Mitra unique | E | "<Field> <nilai> sudah digunakan." |
| V-05 | 1.A.4 | Total SKS > 0 | E | "Total SKS harus lebih dari 0." |
| V-06 | 1.A.4 | Total SKS outside the configured range (default 12–16) `[CONFIRM A-02]` | W | "Total SKS <n> di luar rentang <min>–<max>." |
| V-07 | 1.A.4 | SKS Manajemen PT Sendiri differs from the default of the Dosen's Jabatan Struktural | W | "SKS manajemen <n> berbeda dari ketentuan jabatan <jabatan> (<default> SKS)." |
| V-08 | 1.B | Certified + Non Certified = Jumlah Auditor Mutu Internal | E | "Jumlah certified + non-certified (<a>) harus sama dengan jumlah auditor (<b>)." |
| V-09 | 2.A.1 | Pendaftar Afirmasi ≤ Pendaftar; Pendaftar Kebutuhan Khusus ≤ Pendaftar | E | "Pendaftar afirmasi/kebutuhan khusus tidak boleh melebihi jumlah pendaftar." |
| V-10 | 2.A.1 | Total Mahasiswa Baru ≤ Pendaftar | E | "Total mahasiswa baru (<a>) melebihi jumlah pendaftar (<b>)." |
| V-11 | 2.A.1 | Mahasiswa Baru Reguler (sum of its three values) > Daya Tampung | W | "Mahasiswa baru reguler (<a>) melebihi daya tampung (<b>)." |
| V-12 | 2.A.2 | Sum of all entries for a year ≠ Total Mahasiswa Baru of that year in 2.A.1 (verified) | W | "Jumlah asal mahasiswa <tahun> (<a>) berbeda dari total mahasiswa baru di Tabel 2.A.1 (<b>)." |
| V-13 | 2.A.3 | Aktif + Lulus + DO > Mahasiswa Baru of the cohort | E | "Jumlah aktif + lulus + DO (<a>) melebihi mahasiswa baru angkatan (<b>)." |
| V-14 | Data Lulusan | Terlacak ≤ Jumlah Lulusan; Infokom + NON Infokom ≤ Terlacak; Multinasional + Nasional + Wirausaha ≤ Terlacak | E | "<Komponen> (<a>) melebihi <pembanding> (<b>)." |
| V-15 | 2.B.6 | For each row, Sangat Baik + Baik + Cukup + Kurang = 100 (tolerance ±0.5) | E | "Persentase <kemampuan> berjumlah <n>%, seharusnya 100%." |
| V-16 | 2.C | Jumlah mahasiswa of a bentuk in a year > Total Mahasiswa Aktif of that year (2.A.1, verified) | E | "Jumlah mahasiswa <bentuk> <tahun> (<a>) melebihi mahasiswa aktif (<b>)." |
| V-17a | 3.A.2, 4.A.2 | Exactly one Ketua; Durasi ≥ 1; funding entered for at least one year in TS-2..TS | E | "Isi pendanaan untuk minimal satu tahun dalam periode." |
| V-17b | 3.A.2, 4.A.2 | Ketua is not flagged DTPR in any funded year | W | "<Nama> tidak berstatus DTPR pada tahun pendanaan." |
| V-18 | 3.C.2, 3.C.3, 4.C.2, 4.C.3, 3.A.3 | Exactly one year, within TS-2..TS; type from the allowed list | E | "Pilih satu tahun dalam periode." |
| V-19 | 3.A.2, 4.A.2, 3.C.2, 3.C.3, 4.C.3 | Another non-deleted entry in the same table has the same title (case- and space-insensitive) and the same DTPR | W | "Judul yang sama sudah tercatat atas nama <nama>." |
| V-20 | 3.A.3 | The same DTPR already has the same Jenis Pengembangan in another year | W | "<Nama> sudah tercatat untuk <jenis> pada <tahun>. Data tidak boleh berulang." |
| V-21 | Evidence | File type is PDF, JPG or PNG (by content); size ≤ 5 MB | E | "Jenis file tidak didukung." / "Ukuran file melebihi 5 MB." |
| V-22 | 1.A.2, 1.A.3, 2.C, 1.A.4, 1.A.5, Prasarana, 2.A.2 | Uniqueness within the table: one entry per Sumber/Penggunaan/Bentuk; one EWMP per DTPR per year; one Tendik row per jenis per year; unique Nama Prasarana; unique Rincian per Asal category | E | "<Nilai> sudah ada di tabel ini." |
| V-23 | Pemetaan Kurikulum | A Mata Kuliah without any PL; a CPL without any PL; a CPMK without any Mata Kuliah | W | "<n> mata kuliah belum dipetakan ke Profil Lulusan." |
| V-24 | 8.2 | Tgl. Kadaluarsa after Tgl. SK; at most one "Program studi ini" | E | "Tanggal kedaluwarsa harus setelah tanggal SK." |

Cross-table rules (V-12, V-13, V-16) compare against **verified** source data. If the source is missing, the rule is skipped and the form shows the hint "Tabel 2.A.1 <tahun> belum terverifikasi; pemeriksaan silang dilewati."

---

## 11. Dashboard Indicators (raw values only)

All use verified data of the active period. Show "—" when a divisor is 0 or a source is missing. No colours, thresholds or targets.

| Indicator | Formula |
|---|---|
| Jumlah DTPR (TS) | Dosen flagged DTPR at TS |
| Mahasiswa aktif (TS) | Total Mahasiswa Aktif at TS (2.A.1) |
| Rasio pendaftar : mahasiswa baru (TS) | Pendaftar ÷ Total Mahasiswa Baru at TS, shown as "n : 1" (1 decimal) |
| Rasio mahasiswa aktif : DTPR (TS) | Mahasiswa aktif ÷ Jumlah DTPR, "n : 1" |
| Rata-rata EWMP (TS) | Average Total SKS over 1.A.4 rows (2 decimals) |
| Penelitian per DTPR (TS-2..TS) | Rows of 3.A.2 ÷ Jumlah DTPR (2 decimals) |
| Publikasi per DTPR (TS-2..TS) | Rows of 3.C.2 ÷ Jumlah DTPR |
| PkM per DTPR (TS-2..TS) | Rows of 4.A.2 ÷ Jumlah DTPR |
| Rata-rata masa tunggu lulusan (bulan) | Weighted average from Data Lulusan (as the footer of 2.B.4) |
| Lulusan bekerja di bidang Infokom | Σ Infokom ÷ Σ Terlacak × 100 (1 decimal %) |

---

## 12. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Language | UI in Bahasa Indonesia; code, docs and commits in English |
| Devices | Desktop-first (≥ 1280 px); usable on tablets (≥ 768 px); latest Chrome, Edge, Firefox |
| Performance | At reference volume (50 Dosen, 1,000 Mahasiswa, 500 Penelitian/PkM, 500 publications/HKI, 1,000 files): list pages < 1 s server time; criterion preview < 2 s; full export < 10 s |
| Security | Hashed passwords; server-side authorisation on every request; private file storage; content-based file-type check; rate-limited login; HTTPS when hosted |
| Accessibility | WCAG 2.1 AA contrast; labelled inputs; keyboard-operable; status never by colour alone |
| Data integrity | Money as integer rupiah; soft delete for entries; foreign keys enforced; optimistic concurrency on entries |
| Auditability | Append-only audit log covering all business writes |
| Backup | Daily database dump and file archive, 14-day retention (local/UAT) |
| Deployment | Docker Compose for local and UAT. Production hosting open (OI-01); no code change may be required to move to a hosted setup with S3-compatible storage |
| Time | All timestamps stored in UTC and displayed in WIB (UTC+7) |
| Multi-prodi readiness | Every business record carries `prodi_id`; the UI is fixed to Prodi SI |

---

## 13. Seed Data

### 13.1 Organisation and users
- Fakultas: "Fakultas Biosains, Teknologi, dan Inovasi" (kode `FBTI`). Prodi: "Sistem Informasi" (kode `SI`, jenjang S1).
- Academic years 2018/2019 to 2035/2036.
- Demo users (see `CLAUDE.md` §6), one per role, password `Lkps#2026demo`, must-change flag off for demo accounts.
- Demo data uses placeholders only: `[Nama Dosen 1]`…`[Nama Dosen 5]` (all DTPR at TS), 20 `[Mahasiswa n]`, 3 `[Mitra n]`, 5 `[Judul Penelitian n]`, and Data Mahasiswa for TS-2..TS. One open period with TS = 2025/2026.

### 13.2 Reference lists `[CONFIRM A-05]`

| List (`type`) | Seed values (in order) |
|---|---|
| `peringkat_akreditasi` | Unggul · Baik Sekali · Baik · A · B · C · Terakreditasi Sementara · Belum Terakreditasi |
| `jabatan_struktural` (with default SKS manajemen) | Rektor/Direktur Politeknik (12) · Wakil Rektor/Dekan/Ketua Sekolah Tinggi/Direktur Akademi (10) · Ketua Lembaga/Kepala UPT (8) · Wakil Dekan/Ketua Jurusan/Kepala Pusat/Ketua Senat (6) · Sekretaris Jurusan/Kepala Lab/Ketua PS (4) · Sekretaris PS (3) |
| `sumber_dana` | Mahasiswa (SPP) · Yayasan · Hibah Pemerintah · Kerja Sama · Lainnya |
| `penggunaan_dana` | Pendidikan · Penelitian · PkM · Investasi Sarana dan Prasarana · Pengembangan SDM · Operasional Lainnya |
| `jenis_tendik` | Pustakawan · Laboran/Teknisi · Administrasi · Lainnya |
| `bentuk_pembelajaran` | Micro-credensial · RPL tipe A-2 · Pembelajaran di PS lain · Pembelajaran di PT lain · CBL/ PBL |
| `sumber_rekognisi` | Masyarakat · Dunia Usaha · Dunia Industri · Dunia Kerja |
| `jenis_hibah` | Hibah Internal PT · Hibah Kemdiktisaintek · Hibah Pemerintah Lainnya · Hibah Industri/Mitra · Hibah Luar Negeri · Mandiri |
| `jenis_hki` | Hak Cipta · Paten · Paten Sederhana · Merek · Desain Industri · Rahasia Dagang · DTLST |
| `jenis_pengembangan_dtpr` | Tugas Belajar · Sertifikasi Kompetensi · Pelatihan/Workshop · Magang Industri · Postdoctoral · Lainnya |
| `jenis_tata_kelola` | Pendidikan · Keuangan · SDM · Sarana Prasarana · Sistem Penjaminan Mutu |
| `jenis_mitra` | Perguruan Tinggi · Industri · Pemerintah · Komunitas · Lainnya |

---

## 14. Assumptions `[CONFIRM]`

Each is built as stated and isolated so it can change in one place (the TRD names the function or setting).

| ID | Assumption | If it turns out wrong |
|---|---|---|
| A-01 | In Table 2.A.1 the Afirmasi and Kebutuhan Khusus columns are counted **separately** from Diterima, so a group's total is the sum of its three columns. The "Jumlah" of 2.A.2 sums all rows including Afirmasi and Berkebutuhan Khusus. | Change the two total functions (`computeTotalMahasiswaBaru`, `computeTotalMahasiswaAktif`) and the 2.A.2 footer |
| A-02 | A reasonable EWMP total is 12–16 SKS per semester. | Kaprodi changes the range in validation settings |
| A-03 | Tables 2.B.4 and 2.B.5 use the same Jumlah Lulusan and Jumlah Terlacak per graduation year. | Split Data Lulusan into two forms |
| A-04 | One publication or HKI is recorded under one DTPR. A co-authored item is entered once. | Add co-author links to `publikasi` / `hki` |
| A-05 | The reference-list seed values in §13.2. | Edit the lists in the application |
| A-06 | The app UI is in Bahasa Indonesia. | — |
| A-07 | There is no official LAM INFOKOM Excel template; the export mirrors the instrument's printed tables. | Add a template-based writer |
| A-08 | Table 2.A.1 covers TS-3 to TS as printed in the table (the narrative's "5 tahun terakhir" is not followed). | Extend the year range in one constant |
| A-09 | The 2.B.4 "Jumlah" of the waiting-time column is the weighted average by Terlacak. | Change one compiler helper |

---

## 15. Open Items

| ID | Item | Priority | Owner | Recommendation |
|---|---|---|---|---|
| OI-01 | Production hosting. While the app is local, Link Bukti URLs in the plain export are unreachable for assessors. | High | Satriya / Kaprodi | Use the ZIP export until hosting is decided; decide before UAT |
| OI-02 | Thesis timeline: six two-week sprints end near the planned sidang. | High | Novriani / dospem | Managed in Jira; phases have no dates (D-15) |
| OI-03 | Confirm assumptions A-01 to A-05 and A-09 with Kaprodi. | Medium | Novriani | Bring the list to the next Sprint Review |
| OI-04 | Novriani's Jira backlog and the 2026-09-11 MVP PRD are not mapped to this PRD. | Medium | Novriani | Map stories to FR IDs |
| OI-05 | Official MyAtma colours, logo and font. | Low | Satriya | Placeholders until provided (D-14) |
| OI-06 | Permission to use the Unika Atma Jaya logo in the app. | Low | Kaprodi | Confirm before UAT |

---

## 16. Traceability: Requirement → Phase

| Requirement | Phase(s) |
|---|---|
| Project scaffold, conventions, CI | 00 |
| FR-16 (capture: audit trigger), data model, seed | 01 |
| FR-01, FR-02 | 02 |
| FR-03 (create period), FR-06, FR-16 (viewer) | 03 |
| FR-04, FR-05 | 04 |
| FR-10 | 05 |
| FR-09, FR-11 (engine), FR-08 AC10 (Nihil), §7 workflow rules | 06 |
| FR-12 (framework), FR-07 | 07 |
| FR-08 for Gambar 1.A, 1.A.1–1.B | 08 |
| FR-08 for 2.A.1–2.A.3 | 09 |
| FR-08 for 2.B.1–2.B.3 | 10 |
| FR-08 for 2.B.4–2.D | 11 |
| FR-08 for 3.A.1–3.C.3 | 12 |
| FR-08 for 4.A.1–4.C.3 | 13 |
| FR-08 for 5.1, 5.2, 6 | 14 |
| FR-14, FR-17 | 15 |
| FR-13 | 16 |
| FR-15, FR-12 AC6 | 17 |
| §12 NFRs, UAT readiness | 18 |
