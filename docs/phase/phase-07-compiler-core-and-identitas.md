# Phase 07 — Compiler Core & Identitas

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S1 | 06 | FR-07, FR-12, §8.1–§8.3, V-24 | §3.6, §7.4, §7.16 (`get-criterion-preview`), §15 | §7.5, §7.6, §7.9 (Identitas, Tim Penyusun) |

## Goal
The first complete vertical slice: Identitas is entered, verified and shown as official tables. The compiler framework and the `OfficialTable` renderer that all 31 tables will use are in place.

## Read first
PRD §8.1–§8.3, FR-07, FR-12 · TRD §15 (TableModel and compiler rules) · DESIGN §7.6.

## Out of scope
Criterion tables (from Phase 08). Excel rendering (Phase 16).

## Deliverables
- **Shared type:** `table-model.type.ts` (TRD §15.1).
- **Compiler core:** `compiler-registry.ts`, `compile-table.ts`, `compile-criterion.ts`, `compile-all-tables.ts`, `compile-identitas.ts`; helpers `build-ts-header`, `build-nihil-row`, `build-evidence-cell`, `load-entry-evidence-map`, `sum-cells`, `average-cells`, `percent-of`, `collect-table-issues`.
- **Identitas compilers:** `identitas-pengusul.compiler.ts`, `identitas-daftar-ps.compiler.ts`, `identitas-tim-penyusun.compiler.ts`.
- **Identitas feature:** every file in TRD §7.4.
- **Rule:** `v24-upps-program-dates.rule.ts`; registered.
- **Preview:** `src/backend/features/export/queries/get-criterion-preview.query.ts`; frontend shared `official-table.component.tsx`, `criterion-preview-accordion.component.tsx`.
- **Routing:** `/identitas/pengusul`, `/identitas/tim-penyusun`; nav + routes registered.
- **Seed:** demo Identitas Pengusul (seed values from PRD §8.1, other fields as `[placeholders]`, status draft), one "Program studi ini" row, two Tim Penyusun members.

## Steps
1. Compiler core: `compileTable(code, ctx)` looks up the compiler by `(period.instrumentVersion, code)`, applies Nihil (`buildNihilRow`), attaches `status` and `stats` from `computeTableStatus`, and `issues` from `collectTableIssues`. `compileCriterion(n, ctx)` returns the criterion's tables in instrument order, skipping codes without a registered compiler (so previews work while phases are in progress). `compileIdentitas(ctx)` returns the three Identitas models.
2. `OfficialTable` renders any `TableModel` per DESIGN §7.6: header spans, column-number row, body variants, footers, notes, unverified styling, evidence links, horizontal scroll, sticky first column, visually hidden `<caption>`.
3. `CriterionPreviewAccordion`: item header (code + title, row count, status badge), issue line, table.
4. Identitas Pengusul (type S): form in four sections with the three SK uploaders (`PeriodAttachmentUploader`); `saveIdentitasPengusulAction` via `saveEntry` (entity `identitas_pengusul`, one per period, upsert). The three attachments are required for submit: add them to V-02 handling through an `extraEvidenceCheck` on the entity config (period attachments `sk_pendirian`, `sk_pembukaan`, `sk_akreditasi`).
5. Daftar PS (type E) inside the same page (`ProgramStudiUppsPanel`): list + sheet; "Program studi ini" row shows Jumlah Mahasiswa as a `DerivedField` reading Total Mahasiswa Aktif at TS (helper arrives in Phase 09; until then show "—" with the hint "Diisi otomatis dari Tabel 2.A.1"). V-24.
6. Tim Penyusun (type E): entry list pattern; picking a Dosen pre-fills Nama and NIDN.
7. Compilers per PRD §8.1–§8.3 (two-column Keterangan/Isian model; Daftar PS with JUMLAH footer; Tim Penyusun as blocks).
8. `getIdentitasStatusQuery` combines the three parts using the table-status rules (S needs the record; Daftar PS and Tim need ≥ 1 entry).
9. A temporary preview for Identitas: a "Pratinjau" button on `/identitas/pengusul` opening a dialog with the three `OfficialTable`s (the export centre in Phase 16 will also show them).

## Rules to honour
- Compilers read verified (+ submitted in preview mode) rows only and never check permissions.
- Titles, labels and footnotes verbatim from PRD §8.
- The official Tim Penyusun block leaves "Tanda Tangan" empty.

## Tests
- Golden tests for the three Identitas compilers (preview and export mode).
- Unit: helpers (`sumCells`, `averageCells`, `percentOf`, `buildTsHeader`).
- Component: `OfficialTable` with a model containing spans, a group row, a footer, an unverified row, an evidence cell and Nihil.
- Integration: Identitas submit blocked without the three SK files; with them → submitted; Kaprodi → verified; second "Program studi ini" rejected (V-24).
- E2E (`identitas.spec.ts`): Admin Prodi fills Identitas, uploads three PDFs, submits; Kaprodi verifies from `/verifikasi`; the preview shows the verified values.

## Acceptance checklist
- [ ] FR-07 AC1–AC4 pass.
- [ ] FR-12 AC2, AC3, AC4, AC5, AC7 pass at framework level (AC1 and AC6 complete in Phases 08 and 17).
- [ ] The verification queue shows Identitas entries with correct summaries and links.
- [ ] `OfficialTable` matches DESIGN §7.6, including keyboard-scrollable overflow.
- [ ] `pnpm verify` and the E2E spec pass.

## Verify
```bash
pnpm db:reset && pnpm verify && pnpm test:e2e -- identitas
```
