# Phase 08 — Kriteria 1: Budaya Mutu

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S2 | 07 | FR-08, §8.4–§8.10, V-05–V-08, V-22, A-02 | §7.5, §14.3, §15.4–§15.5, §11 | §7.3, §7.4, §7.5, §8 (columns 1.A.1–1.B) |

## Goal
Gambar 1.A and Tables 1.A.1, 1.A.2, 1.A.3, 1.A.4, 1.A.5 and 1.B can be entered, validated, verified and previewed as official tables. This is the first full criterion and sets the pattern for Phases 09–14.

## Read first
PRD §8.4–§8.10 (fields, official columns, footers, notes) · TRD §7.5 · `docs/phase/README.md` → "Standard recipe for a table" · DESIGN §7.3–§7.5, §8.

## Out of scope
Excel export of these tables (Phase 16). Dashboard figures (Phase 15).

## Deliverables
- **Feature:** every file in TRD §7.5 (8 screens, 6 forms, 12 actions, 13 queries, `save-dana-tahun.ts`, 6 schemas).
- **Rules:** `v05-ewmp-total-positive`, `v06-ewmp-sks-range`, `v07-ewmp-manajemen-default`, `v08-spmi-auditor-count`; registered in `ruleRegistry`.
- **Compilers:** `table-1a1-pimpinan-unit`, `table-1a2-sumber-dana`, `table-1a3-penggunaan-dana`, `table-1a4-ewmp`, `table-1a5-kualifikasi-tendik`, `table-1b-unit-spmi`; helpers `compile-dana-table`, `compute-ewmp-total`; registered in `compilerRegistry`.
- **Routing:** `/kriteria-1/struktur-organisasi`, `/pimpinan-unit`, `/sumber-dana`, `/penggunaan-dana`, `/ewmp`, `/kualifikasi-tendik`, `/unit-spmi`, `/pratinjau` (all under `/kriteria-1`); nav + `CriterionTabs` lists registered.
- **Seed:** demo rows: 2 Pimpinan Unit (verified), 3 Sumber Dana (1 verified, 1 submitted, 1 draft), EWMP for Dosen 1–3 (verified) and Dosen 4 (returned, with a note), 1 Unit SPMI (draft).

## Steps
Follow the standard recipe for each table. Table-specific points:

1. **Gambar 1.A** (`Gambar1AStrukturOrganisasiScreen`): `PeriodAttachmentUploader` with kind `org_chart`; image shown inline through `/api/files/:id`, PDF as a link; replace and remove. No workflow status; not one of the 31 tables.
2. **1.A.1** (`pimpinan_unit`, E, period): optional Dosen pick pre-fills Nama Ketua, Pendidikan Terakhir, Jabatan Fungsional (still editable). Order: creation.
3. **1.A.2 / 1.A.3** (`dana`, kind `sumber` / `penggunaan`): one schema shape, two forms and two action pairs. `RefSelect` with "Lainnya" + text. `YearAmountGrid` (money) for TS-2..TS; `saveDanaTahun` upserts the three `dana_tahun` rows. V-22 per kind. One shared compiler body `compileDanaTable(kind)`; cells `money_juta`.
4. **1.A.4** (`ewmp`, E, year TS, owner DTPR):
   - Picker lists Dosen flagged DTPR at TS without an existing entry. DTPR users: field fixed to their own Dosen; they see only their own row.
   - On Dosen selection call `getSuggestedSksManajemenQuery(dosenId)` and pre-fill SKS Manajemen PT Sendiri (0 when no Jabatan Struktural).
   - Total SKS is a `DerivedField` using `computeEwmpTotal` (shared with the compiler and V-05/V-06).
   - V-06 reads the range from validation settings `[A-02]`; V-07 compares with the jabatan default.
   - Compiler: 3 header rows (group headers "SKS Pengajaran Pada", "SKS Manajemen"), footers "Jumlah" and "Rata-rata" (2 decimals), all four notes verbatim.
5. **1.A.5** (`tendik_kualifikasi`, E, year TS): eight integer inputs in one row; V-22 one row per jenis per year. Compiler prints "Pustakawan *)" for that row and the "Total" footer.
6. **1.B** (`spmi_unit`, E, period): three `EvidenceUploader`s (slots `dokumen_spmi`, `bukti_certified`, `laporan_audit`); `bukti_certified` required only when Certified > 0; V-08. Compiler shows the three evidence cells in their columns.
7. **Pratinjau** (`Kriteria1PratinjauScreen`): `getCriterionPreviewQuery(1)` → `CriterionPreviewAccordion`. Shows the Gambar 1.A status line above the tables ("Gambar 1.A: <nama file>" / "Belum diunggah").
8. Work-list columns per DESIGN §8. Year-anchored lists show the `TsChip`.

## Rules to honour
- Every write goes through `saveEntry`; no status logic in feature code.
- Money is stored as integer rupiah and shown in Rp juta only in official tables.
- Admin Prodi or Kaprodi entering EWMP must pick the Dosen; the audit trail still records the real actor (FR-09 AC6).
- Footers are computed from verified rows only (TRD §15.2).

## Tests
- Unit: six schemas (draft vs submit requirements); `computeEwmpTotal`; rules V-05–V-08 (pass, fail, boundary; V-06 with changed settings).
- Golden: six compilers in preview and export mode (include an unverified row, a Nihil case for 1.A.2, and the EWMP footers).
- Integration: DTPR creates own EWMP and cannot read or create another DTPR's; duplicate EWMP for the same Dosen and year → V-22; 1.B without `laporan_audit` → V-02; `bukti_certified` optional when Certified = 0.
- E2E (`kriteria-1.spec.ts`): DTPR submits EWMP with Total 18 → warning → writes a note → submitted; Kaprodi returns it with a note; DTPR sees the note, fixes, resubmits; Kaprodi verifies; the 1.A.4 preview shows the row and the footers.

## Acceptance checklist
- [ ] FR-08 AC1–AC12 hold for the six tables.
- [ ] Each official table matches PRD §8.5–§8.10 exactly (headers, column numbers, footers, notes).
- [ ] FR-12 AC1 passes for Criterion 1.
- [ ] Table status badges follow PRD §4.6 for types E (≥ 1 verified entry or Nihil) on all six tables.
- [ ] `pnpm verify` and the E2E spec pass.

## Verify
```bash
pnpm db:reset && pnpm verify && pnpm test:e2e -- kriteria-1
```
