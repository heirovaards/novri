# Phase 11 — Kriteria 2 (c): Lulusan, Fleksibilitas, Rekognisi

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S3 | 09 | FR-08, §8.17–§8.20, V-14–V-16, V-22, D-17, A-03, A-09 | §7.6 (2.B.4–2.D files), §14.3, §15.4–§15.5 | §7.4, §8 |

## Goal
Data Lulusan (feeding 2.B.4 and 2.B.5), 2.B.6, 2.C and 2.D work end to end. Criterion 2 is complete.

## Read first
PRD §8.17–§8.20, §9 · TRD §7.6 · DESIGN §7.4.

## Out of scope
Tracer-study surveys or per-alumni records (aggregates only).

## Deliverables
- **Screens:** `table-2b4-2b5-data-lulusan`, `table-2b6-kepuasan-pengguna`, `table-2c-fleksibilitas-pembelajaran`, `table-2d-rekognisi-lulusan`.
- **Components:** `data-lulusan-form`, `kepuasan-pengguna-form`, `fleksibilitas-pembelajaran-form`, `rekognisi-lulusan-form`.
- **Actions:** `save-data-lulusan`, `save-kepuasan-pengguna`, `create-/update-fleksibilitas-pembelajaran`, `create-/update-rekognisi-lulusan`.
- **Queries:** `list-data-lulusan`, `get-kepuasan-pengguna`, `list-/get-fleksibilitas-pembelajaran`, `list-/get-rekognisi-lulusan`.
- **Lib:** `load-verified-lulusan`.
- **Schemas:** `data-lulusan`, `kepuasan-pengguna`, `fleksibilitas-pembelajaran`, `rekognisi-lulusan`.
- **Rules:** `v14-lulusan-consistency`, `v15-kepuasan-sums-100`, `v16-fleksibilitas-vs-aktif`.
- **Compilers:** `table-2b4-masa-tunggu-lulusan`, `table-2b5-bidang-kerja-lulusan`, `table-2b6-kepuasan-pengguna`, `table-2c-fleksibilitas-pembelajaran`, `table-2d-rekognisi-lulusan`; helper `weighted-average` `[A-09]`.
- **Routing:** `/kriteria-2/data-lulusan`, `/kepuasan-pengguna`, `/fleksibilitas-pembelajaran`, `/rekognisi-lulusan`; nav + tabs registered. The tab for Data Lulusan is labelled "2.B.4–2.B.5 Data Lulusan".
- **Seed:** Data Lulusan TS-2 and TS-1 (verified), 2 Fleksibilitas entries, 1 Rekognisi entry.

## Steps
1. **Data Lulusan** (`lulusan`, Y, TS-2..TS, D-17): three year cards (key numbers Jumlah Lulusan, Terlacak, Waktu Tunggu); the form has two labelled sections, "Masa Tunggu (Tabel 2.B.4)" and "Bidang Kerja (Tabel 2.B.5)". V-14 (three comparisons, one message each). The entity feeds both table codes, so both share one status `[A-03]`.
2. **`loadVerifiedLulusan(tx, prodiId, yearIds)`** → per year `{ jumlahLulusan, terlacak, ... }` or `null`.
3. **2.B.6** (`kepuasan_survey`, S, year TS): a 7-row grid (rows from `kemampuanLulusanOptions`, fixed order) with four percentage inputs and a Rencana Tindak Lanjut textarea per row, plus "Jumlah pengguna lulusan sebagai responden". Each row shows a live row sum; V-15 (tolerance ±0.5). Children saved to the survey's row table in one transaction.
4. **2.C** (`fleksibilitas`, E, year values): `RefSelect` (+ "Lainnya"), `YearAmountGrid` (int), evidence required. V-22 (one entry per Bentuk). V-16 per year against `totalAktif` from verified 2.A.1 (skip with hint when missing).
5. **2.D** (`rekognisi`, E, year values): Sumber `RefSelect` (+ "Lainnya"), Jenis Pengakuan text, `YearAmountGrid` (int), evidence required.
6. **Compilers:**
   - 2.B.4: rows TS-2..TS; footer "Jumlah" = sum, sum, `weightedAverage(waktuTunggu, terlacak)` (2 decimals) `[A-09]`.
   - 2.B.5: nested header "Lingkup Tempat Kerja"; footer sums.
   - 2.B.6: seven rows, footer "Jumlah" plus the three labelled footer rows (lulusan 3 tahun from `loadVerifiedLulusan`; responden; mahasiswa aktif TS from `loadVerifiedMhsData`).
   - 2.C: header row, derived row "Jumlah Mahasiswa Aktif", sub-header row, entry rows, footers "Jumlah" and "Persentase" (1 decimal; "—" when the divisor is 0 or missing).
   - 2.D: nested "Tahun Akademik" header; footers "Jumlah Rekognisi", "Jumlah Lulusan", "Persentase".
7. Table status: Data Lulusan complete when TS-2, TS-1 and TS are verified (applies to 2.B.4 and 2.B.5); 2.B.6 when its record is verified; 2.C and 2.D per type E (≥ 1 verified or Nihil).

## Rules to honour
- Derived rows and footers use verified sources only and print "—" when a source is missing; they never block the table from rendering.
- The weighted average lives only in `weightedAverage` (also used by the dashboard in Phase 15).

## Tests
- Unit: V-14 (each comparison), V-15 (99.4 fails, 99.5 passes, 100.5 passes, 100.6 fails), V-16 (skip when source missing); `weightedAverage` (zero weights → null).
- Golden: five compilers (2.C with missing 2.A.1; 2.D with a zero divisor).
- Integration: one Data Lulusan entry makes rows in both 2.B.4 and 2.B.5; 2.B.6 save replaces the seven child rows atomically.
- E2E (`kriteria-2-lulusan.spec.ts`): Admin Prodi enters Data Lulusan TS, submits; Kaprodi verifies; both previews show the TS row and the footers.

## Acceptance checklist
- [ ] Official tables match PRD §8.17–§8.20, including all footer labels.
- [ ] All 11 Criterion 2 tables render in `/kriteria-2/pratinjau`.
- [ ] A-03 and A-09 are isolated as stated in TRD §23.
- [ ] `pnpm verify` and the E2E spec pass.

## Verify
```bash
pnpm db:reset && pnpm verify && pnpm test:e2e -- kriteria-2-lulusan
```
