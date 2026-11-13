# Phase 04 — Master Data & Import

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S1 | 03 | FR-04, FR-05, V-04, §13.1 | §7.12, §7.15, §17, §10.5 | §6.1 (pickers), §7.9 (Master, Import wizard) |

## Goal
All master data can be managed, Dosen and Mahasiswa can be imported from Excel, and the pickers every later form needs exist.

## Read first
PRD FR-04 (field table), FR-05 · TRD §7.12, §7.15, §17 · DESIGN §7.9.

## Out of scope
Curriculum mapping matrices (Phase 10). Prasarana (Phase 12). Anything with a workflow status.

## Deliverables
- **Master:** every file in TRD §7.12 (6 screens, 8 form components, actions, queries, `assert-master-not-referenced.ts`, 8 schemas).
- **Import:** every file in TRD §7.15 (wizard components, 5 handlers, 2 actions, 8 lib files, 3 schemas, `import-preview.type.ts`).
- **Rule:** `src/backend/lkps/validation/rules/v04-master-unique.rule.ts` → `ruleV04MasterUnique` (called by master actions; the rule registry arrives in Phase 06 and will not include it in `runEntryRules`).
- **Frontend shared form components:** `person-picker`, `option-picker`, `ref-select`, `number-input`.
- **Admin users:** enable "Dosen tertaut" (`PersonPicker` over `searchDosenOptionsQuery`), required when roles include DTPR or Dosen; one Dosen links to at most one user.
- **Routing:** `/master/dosen`, `/master/mahasiswa`, `/master/mitra`, `/master/mata-kuliah`, `/master/profil-lulusan`, `/master/cpl-cpmk`; the import API routes in TRD §6; nav + routes registered.
- **Seed:** `seedDemoData` adds 5 Dosen (`[Nama Dosen 1..5]`, all DTPR for TS-2..TS; Dosen 1 has Jabatan Struktural "Sekretaris Jurusan/Kepala Lab/Ketua PS"), 20 Mahasiswa, 3 Mitra, 8 Mata Kuliah with pengampu, 3 PL, 4 CPL with 2 CPMK each; links `kaprodi` → Dosen 1, `dtpr1` → Dosen 2, `dosen1` → Dosen 3.

## Steps
1. Schemas with the field rules in PRD FR-04 (NIDN digits 8–16; NIM 6–20; SKS 1–8; Semester 1–14; unique codes).
2. CRUD actions (capability `master.manage`, inside `withActor`; master actions do **not** call `assertPeriodOpen`). Uniqueness errors return `fieldErrors` on the right field with the V-04 message.
3. Dosen form: main fields + `DosenYearStatusFields` listing the active period's four years (DTPR switch, Jabatan Struktural `RefSelect`). Without a period, show the helper "Status per tahun dapat diisi setelah periode dibuat."
4. Mata Kuliah form includes Pengampu (multi `PersonPicker`), saved to `mk_dosen`.
5. CPL & CPMK screen as an accordion (DESIGN §7.9).
6. Archive / restore via `archiveMasterRecordAction({ master, id, archived })`. Deleting is not offered. `assertMasterNotReferenced` is used only if a hard delete is ever added; archive is always allowed. Archived rows are excluded from `search-*-options` queries and hidden from lists unless "Tampilkan arsip" is on.
7. Search-option queries: return up to 20 matches by name/code; `searchDosenOptionsQuery` accepts `dtprAtYearId`.
8. Import (TRD §17): templates with dropdown validation; preview handler validates rows and stores an `import_job`; wizard shows counts and problem rows; error report download; commit action upserts valid rows (Dosen import also writes the TS-year `dosen_year` row), deletes the job, logs an `import` event.
9. Enable the Dosen link in the user form; add the uniqueness check.

## Rules to honour
- Enumerated import columns accept the Indonesian labels shown in the template, case-insensitive, trimmed.
- An import never deletes or archives existing rows.
- Maximum 2,000 data rows and 2 MB per import file.
- Messages per row are Bahasa Indonesia and name the column.

## Tests
- Unit: each master schema; import row validators (valid, each error type, duplicate in file, existing in database).
- Integration: unique NIDN/NIM/kode; archive hides from pickers but existing references remain; import preview → commit with and without "Perbarui data yang sudah ada"; expired or foreign `jobId` rejected; audit event has counts.
- E2E (`master-import.spec.ts`): Admin Prodi downloads the Dosen template, uploads a file with 3 valid rows, 1 invalid NIDN and 1 duplicate; sees the counts; commits; sees 3 new Dosen; downloads the error report.

## Acceptance checklist
- [ ] FR-04 AC1–AC4 pass for all eight masters.
- [ ] FR-05 AC1–AC7 pass for Dosen and Mahasiswa.
- [ ] Pickers (`PersonPicker`, `OptionPicker`, `RefSelect`) work with keyboard only.
- [ ] User form enforces the Dosen link for DTPR/Dosen roles (FR-01 AC4 complete).
- [ ] `pnpm db:reset` yields the demo master data listed above.
- [ ] `pnpm verify` and the E2E spec pass.

## Verify
```bash
pnpm db:reset && pnpm verify && pnpm test:e2e -- master-import
```
