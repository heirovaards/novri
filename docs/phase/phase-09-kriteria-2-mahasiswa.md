# Phase 09 — Kriteria 2 (a): Mahasiswa

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S3 | 07 | FR-08 (type Y), §8.11–§8.13, V-09–V-13, V-22, A-01, A-08 | §7.6 (2.A.* files), §14.3, §15.5 | §7.4 (year cards), §8 |

## Goal
Tables 2.A.1, 2.A.2 and 2.A.3 work end to end, and the per-year student totals other tables depend on are available.

## Read first
PRD §8.11–§8.13, §9 (reuse map), §14 (A-01, A-08) · TRD §7.6 · DESIGN §7.4.

## Out of scope
Curriculum (Phase 10). Lulusan, 2.B.6, 2.C, 2.D (Phase 11).

## Deliverables
- **Screens:** `table-2a1-data-mahasiswa`, `table-2a2-asal-mahasiswa`, `table-2a3-kondisi-mahasiswa`, `kriteria-2-pratinjau`.
- **Components:** `data-mahasiswa-form`, `asal-mahasiswa-form`, `kondisi-mahasiswa-form`.
- **Actions:** `save-data-mahasiswa`, `create-asal-mahasiswa`, `update-asal-mahasiswa`, `save-kondisi-mahasiswa`.
- **Queries:** `list-data-mahasiswa`, `list-asal-mahasiswa`, `get-asal-mahasiswa`, `list-kondisi-mahasiswa`.
- **Lib:** `compute-total-mahasiswa-baru` `[A-01]`, `compute-total-mahasiswa-aktif` `[A-01]`, `load-verified-mhs-data`, `save-year-values`.
- **Schemas:** `data-mahasiswa`, `asal-mahasiswa`, `kondisi-mahasiswa`.
- **Rules:** `v09-pendaftar-subsets`, `v10-mahasiswa-baru-vs-pendaftar`, `v11-reguler-vs-daya-tampung`, `v12-asal-vs-mahasiswa-baru`, `v13-kondisi-vs-cohort`.
- **Compilers:** `table-2a1-data-mahasiswa`, `table-2a2-asal-mahasiswa`, `table-2a3-kondisi-mahasiswa`.
- **Routing:** `/kriteria-2/data-mahasiswa`, `/asal-mahasiswa`, `/kondisi-mahasiswa`, `/pratinjau`; nav + tabs registered.
- **Follow-up from Phase 07:** the "Program studi ini" row in Daftar PS now shows Total Mahasiswa Aktif at TS through `loadVerifiedMhsData`.
- **Seed:** Data Mahasiswa for TS-2, TS-1, TS (verified); TS-3 left empty on purpose; 2 Asal Mahasiswa entries.

## Steps
1. **Totals `[A-01]`:** `computeTotalMahasiswaBaru(row)` and `computeTotalMahasiswaAktif(row)` are pure functions summing the six values of their group. They are the only place this sum exists; forms, rules, compilers and other tables import them.
2. **`loadVerifiedMhsData(tx, prodiId, yearIds)`** returns, per year, `{ pendaftar, totalBaru, totalAktif }` from verified rows only, or `null` for a missing year.
3. **2.A.1** (`mhs_data`, Y, TS-3..TS): `YearCardList` with four cards (key numbers Pendaftar, Total Mahasiswa Baru, Total Mahasiswa Aktif); selecting a card shows that year's form in a grouped layout mirroring the official header (Calon / Baru Reguler / Baru RPL / Aktif Reguler / Aktif RPL). `saveDataMahasiswaAction` upserts by `(prodi, academic_year)`. V-09, V-10, V-11. Table status: complete when all four years are verified.
4. **2.A.2** (`mhs_asal`, E, year values): Asal select from `asalMahasiswaOptions`, optional Rincian, `YearAmountGrid` (int) saved with `saveYearValues`, evidence required. V-22 (unique Rincian per category; one row without Rincian per category). V-12 compares the per-year sum of **all non-deleted submitted/verified entries including the one being saved** with `totalBaru` from verified 2.A.1; skipped with the hint from PRD §10 when 2.A.1 is missing.
5. **2.A.3** (`mhs_kondisi`, Y by cohort TS-2..TS): three cards; "Mahasiswa Baru" is a `DerivedField` from `loadVerifiedMhsData`; V-13 (skipped with the hint when the cohort's 2.A.1 is missing).
6. **Compilers:**
   - 2.A.1: three header rows with the nested groups; rows TS-3..TS labelled by TS label; a year without a verified entry prints "—" in every cell; footer "Jumlah"; both notes verbatim.
   - 2.A.2: categories in fixed order; group rows and indented Rincian rows per PRD §8.12; footer "Jumlah" `[A-01]`.
   - 2.A.3: measures as rows, cohorts as columns plus "Jumlah".
7. **Pratinjau** for Criterion 2 (tables without a compiler yet are skipped automatically).

## Rules to honour
- Cross-table comparisons read **verified** source data only.
- TS labels come only from `resolvePeriodYears`.
- No total is ever typed by a user.

## Tests
- Unit: the two total functions; rules V-09–V-13 including "source missing → skipped".
- Golden: three compilers (2.A.1 with one missing year; 2.A.2 with a grouped category and a single-row category).
- Integration: upsert by year (second save updates, with `rowVersion`); V-12 warning appears and requires a note; status of 2.A.1 is `incomplete` with three verified years.
- E2E (`kriteria-2-mahasiswa.spec.ts`): Admin Prodi fills TS-3, submits; Kaprodi verifies; 2.A.1 becomes "Lengkap"; 2.A.3 shows Mahasiswa Baru for each cohort.

## Acceptance checklist
- [ ] FR-08 AC4 (type Y) works for 2.A.1 and 2.A.3.
- [ ] Official tables match PRD §8.11–§8.13.
- [ ] A-01 is isolated in the two functions and the 2.A.2 footer (TRD §23).
- [ ] Daftar PS shows Jumlah Mahasiswa for "Program studi ini".
- [ ] `pnpm verify` and the E2E spec pass.

## Verify
```bash
pnpm db:reset && pnpm verify && pnpm test:e2e -- kriteria-2-mahasiswa
```
