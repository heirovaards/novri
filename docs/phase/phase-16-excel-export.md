# Phase 16 — Excel Export

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S6 | 11, 13, 14 | FR-13, FR-12 AC7, A-07, OI-01 | §7.16, §7.19 (`lkps/render`), §18, §6 (export routes) | §7.7 (Pratinjau & Ekspor) |

## Goal
Kaprodi and Admin Prodi can export one table, one criterion, the full LKPS workbook, or the full workbook with evidence as a ZIP. The Excel output is produced from the same `TableModel` as the preview.

## Read first
PRD FR-13 · TRD §18 (every row of the specification table), §15.1 · DESIGN §7.7.

## Out of scope
Snapshot storage and locked-period behaviour (Phase 17; leave a clearly marked seam). PDF or Word export. Any LAM INFOKOM upload integration.

## Deliverables
- **Render:** every file under `lkps/render/` in TRD §7.19 (10 files).
- **Export feature:** `export-table.handler`, `export-criterion.handler`, `export-full.handler`, `export-full-zip.handler`, `get-export-overview.query`, `lib/load-models-for-export.ts`; frontend `export-center.screen`, `export-progress-card.component`, `export-criterion-list.component`.
- **Routing:** `/ekspor`; `app/api/export/tabel/[code]/route.ts`, `app/api/export/kriteria/[criterion]/route.ts`, `app/api/export/lengkap/route.ts`, `app/api/export/lengkap-zip/route.ts`; nav registered.
- **Buttons:** "Ekspor Tabel" on each accordion item and "Ekspor Kriteria" in the header of every Pratinjau screen; "Ekspor" in the Identitas preview dialog is not needed (Identitas is exported only in the full workbook).

## Steps
1. **`writeTableSheet(ws, model, opts)`** per TRD §18: title row; red banner row when `model.status !== 'complete'` with the exact text of FR-13 AC5; preamble rows; header rows with merges computed from `colSpan`/`rowSpan`; column-number row (skipped for Table 6 and the Identitas sheets); body rows by variant (`group` bold, `derived` italic, `subheader` header fill); footers; blank row; notes. Number formats by `Cell.kind`. Sheet name = `model.code` (Excel forbids `/ \ ? * [ ]`; codes are safe).
2. **`resolveEvidenceCell(cell, mode, ctx)`:** URL mode → hyperlink to `${PUBLIC_BASE_URL}/api/files/{id}`; ZIP mode → relative path `bukti/<code>/<row>-<safe-name>`. Several files → one per line in the cell (the first carries the hyperlink; all are listed as text).
3. **Extra sheets:** `writeCoverSheet` (`Sampul`: title "Laporan Kinerja Program Studi (LKPS)", prodi, fakultas, perguruan tinggi from Identitas, TS label, export timestamp in WIB, exporting user, Gambar 1.A line), `writeIdentitasSheet`, `writeDaftarPsSheet`, `writeTimPenyusunSheet`, `writeSummarySheet` (`Ringkasan`: code, title, status label, verified rows, excluded rows, entries without evidence).
4. **`buildLkpsWorkbook({ models, identitas?, scope, evidenceMode, meta })`** assembles sheets in the order of TRD §18 and returns a Buffer. Workbook properties: creator "LKPS", created date.
5. **`buildExportFilename`** per FR-13 AC8, with path-unsafe characters replaced.
6. **Handlers** (capability `export.run`): parse and validate the scope (`parseTableCode`; criterion 1–6), load the active period, compile in `export` mode, build, respond with `Content-Disposition: attachment`, log `logAppEvent('export', { scope, code })`. Seam for Phase 17: a single function `loadModelsForExport(period, scope)` that today always compiles live.
7. **`buildEvidenceZip`:** stream with `archiver`; workbook at the root; each evidence file under `bukti/<code>/<row>-<safe-name>`; period attachments under `bukti/lampiran/`; missing files on disk are skipped and listed in `bukti/_tidak-ditemukan.txt`. Stream the response; do not buffer the whole ZIP in memory.
8. **Export centre** (`/ekspor`) per DESIGN §7.7: `ExportProgressCard` (x / 31 complete, counts of unverified entries and entries without evidence), buttons "Ekspor LKPS Lengkap (.xlsx)" and "Ekspor LKPS + Bukti (.zip)", and `ExportCriterionList` (Identitas and each criterion with per-table status, "Pratinjau" and "Ekspor" links). When the app runs on localhost, show the notice for OI-01: "Tautan bukti pada ekspor .xlsx hanya dapat dibuka dari jaringan ini. Gunakan ekspor .zip untuk dikirim ke asesor."
9. Downloads are plain links (`<a href download>`); show a toast "Menyiapkan ekspor…" and keep the page usable.

## Rules to honour
- Only verified rows are exported; an incomplete table is still exported, with the banner.
- No formulas in the workbook: footers are computed values (so preview and export cannot differ).
- Numeric cells are numbers; money cells hold the Rp-juta value with number format `#,##0.00`.
- Renderers contain no table-specific branches other than the documented column-number-row exception.

## Tests
- Unit: `writeTableSheet` on a synthetic model (merges, number types, banner, notes); `resolveEvidenceCell` both modes; `buildExportFilename`.
- Integration: export each of the 31 tables from the seeded fixture and re-read with ExcelJS asserting title, header text, row count and one footer value against the compiled model; full export has the sheet order of TRD §18; ZIP contains the workbook and the expected `bukti/` paths; DTPR request → 403; audit event written.
- Performance: full export at reference volume (seed script flag `--volume=reference`) under 10 s.
- E2E (`export.spec.ts`): Kaprodi downloads the full workbook from `/ekspor`; the file name matches the pattern.

## Acceptance checklist
- [ ] FR-13 AC1–AC9 pass.
- [ ] FR-12 AC7 demonstrated by a test comparing preview model and exported cells for three tables (1.A.4, 2.C, 3.A.2).
- [ ] The workbook opens without repair prompts in Excel and LibreOffice (manual check; note the versions in the phase log).
- [ ] `pnpm verify` and the E2E spec pass.

## Verify
```bash
pnpm db:reset && pnpm verify && pnpm test:e2e -- export
```
