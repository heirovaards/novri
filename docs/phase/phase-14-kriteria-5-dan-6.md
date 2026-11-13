# Phase 14 — Kriteria 5 & 6: Akuntabilitas, Diferensiasi Misi

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S5 | 12 | FR-08, §8.32–§8.34 | §7.11, §7.7, §15.5 | §7.3, §7.4 (single form), §8 |

## Goal
Tables 5.1, 5.2 and 6 work end to end. With this phase all 31 tables can be entered, verified and previewed.

## Read first
PRD §8.32–§8.34 · TRD §7.11.

## Out of scope
Export and dashboard (next phases).

## Deliverables
- **Kriteria-5 feature:** every file in TRD §7.11 for `kriteria-5` (3 screens, 1 form, 2 actions, 2 queries, 1 schema).
- **Kriteria-6 feature:** every file in TRD §7.11 for `kriteria-6` (2 screens, 1 form, 1 action, 1 query, 1 schema).
- **Compilers:** `table-51-tata-kelola`, `table-52-sarana-pendidikan`, `table-6-visi-misi`.
- **Routing:** `/kriteria-5/tata-kelola`, `/kriteria-5/sarana-pendidikan`, `/kriteria-5/pratinjau`, `/kriteria-6/visi-misi`, `/kriteria-6/pratinjau`; nav + tabs registered.
- **Seed:** 2 Tata Kelola entries, Visi Misi (draft) with `[placeholder]` text.

## Steps
1. **5.1 Tata Kelola** (`tata_kelola`, E, period): Jenis `RefSelect` (+ "Lainnya"), Nama Sistem Informasi, Akses (Lokal/Internet), Unit Kerja/SDM Pengelola, evidence required. Several systems per Jenis are allowed (no V-22). Compiler: order by reference-list order then Nama; table title is exactly "Tabel 5.1. Sistem Tata Kelola".
2. **5.2 Sarana Pendidikan:** `PrasaranaWorkPanel({ usage: 'pendidikan' })`; compiler through `compilePrasaranaTable` with the 5.2 labels and notes.
3. **6 Visi Misi** (`visi_misi`, S, period): five textareas with character counters; optional internal attachment. Compiler builds the 3-column grid of PRD §8.34 using `subheader` rows; line breaks preserved (renderers must honour `\n`: `OfficialTable` with `white-space: pre-line`, Excel with wrap text).
4. **Pratinjau** screens for Criterion 5 and 6.
5. **Completeness check for the whole instrument:** add `tests/integration/compiler-coverage.test.ts` asserting that `compilerRegistry` has a compiler for all 31 codes in `lkpsTableRegistry` and that `compileAllTables` returns 31 models in instrument order.

## Rules to honour
- The 5.2 header reads "Tidak berlisensi (T)" (lower-case b) while 3.A.1 reads "Tidak Berlisensi (T)"; keep each verbatim.
- Table 6 has no column-number row and no footer.

## Tests
- Unit: two schemas.
- Golden: three compilers (Table 6 with multi-line text).
- Integration: compiler coverage test (31 / 31); `computeAllTableStatuses` returns 31 statuses.
- E2E (`kriteria-5-6.spec.ts`): Admin Prodi submits Visi Misi and one Tata Kelola entry; Kaprodi verifies; both previews render.

## Acceptance checklist
- [ ] Official tables match PRD §8.32–§8.34.
- [ ] All 31 tables have a work screen, a compiler and a preview.
- [ ] FR-08 AC1–AC12 hold across the instrument (spot-check one table of each input type E, Y, S, M, D).
- [ ] `pnpm verify` and the E2E spec pass.

## Verify
```bash
pnpm db:reset && pnpm verify && pnpm test:e2e -- kriteria-5-6
```
