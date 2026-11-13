# Phase 17 — Period Submission & Lock

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S6 | 16 | FR-15, FR-12 AC6, FR-03, FR-08 AC11 | §7.3 (submit, reopen, snapshot files), §12, §10.3 (`period_snapshot`), §6 (snapshot route) | §7.9 (Periode), §6.4 (dialogs), §10 (locked state) |

## Goal
Kaprodi can submit and lock the period, producing an immutable snapshot of the compiled tables and the export file. Admin Sistem can reopen with a reason. Locked periods are read-only everywhere and render from the snapshot.

## Read first
PRD FR-15, FR-12 AC6, FR-08 AC11 · TRD §12, §7.3 · DESIGN §7.9, §10.

## Out of scope
Multiple simultaneous open periods. Editing a snapshot. Submission to LAM INFOKOM systems.

## Deliverables
- **Actions:** `submit-period.action.ts`, `reopen-period.action.ts`.
- **Queries:** `get-period-submission-check.query.ts`.
- **Lib:** `build-period-snapshot.ts`.
- **Handler:** `download-period-snapshot.handler.ts`; route `app/api/periode/[periodId]/snapshot/[seq]/route.ts`.
- **Frontend:** `submit-period-dialog.component.tsx`, `reopen-period-dialog.component.tsx`; `PeriodManagementScreen` gains the submit/reopen controls and the snapshot list.
- **Schema:** `reopen-period.schema.ts`.
- **Snapshot-aware reads:** `getCriterionPreviewQuery`, `getExportOverviewQuery` and `loadModelsForExport` use the latest snapshot when the active period is locked.

## Steps
1. **`getPeriodSubmissionCheckQuery`** (capability `period.submit`): from `computeAllTableStatuses` → tables not complete (code, title, status, counts), Identitas status, number of submitted entries still waiting, number of entries with unresolved warnings, number of entries missing evidence.
2. **`SubmitPeriodDialog`** ("Ajukan & Kunci LKPS"): shows the check result grouped by criterion; when gaps exist, the checkbox "Saya memahami masih ada data yang belum lengkap" must be ticked; a final confirmation names the consequence ("Setelah dikunci, data tidak dapat diubah.").
3. **`submitPeriodAction({ periodId, acknowledgeGaps })`** in one `withActor` transaction:
   1. `assertPeriodOpen`; capability `period.submit`;
   2. recompute the check on the server; reject when gaps exist and `acknowledgeGaps` is false;
   3. `buildPeriodSnapshot`: `compileIdentitas` + `compileAllTables` in `export` mode → `tables_json`; build the full workbook (URL evidence mode) → store through the storage adapter under `{prodiId}/snapshots/{periodId}/{seq}.xlsx`; insert `period_snapshot` (seq = previous + 1, counts summary, created_by);
   4. set the period `locked`, `locked_at`, `locked_by`;
   5. `logAppEvent('period_lock', { seq })`; revalidate all LKPS paths.
4. **Lock enforcement:** already in `assertPeriodOpen` (Phase 03/06). Add an integration test that walks **every** exported server action and asserts that each LKPS-writing action fails with `PERIOD_LOCKED` when the period is locked (use the action registry test helper: enumerate `src/backend/features/**/actions/*.action.ts`, with an explicit allow-list for master, admin, settings, auth and import actions).
5. **Locked UI:** `LockedPeriodBanner` in the shell; work screens render forms read-only and hide add/edit/delete/Nihil/submit controls (driven by one `isReadOnly` value from the layout's period context); the verification queue shows an empty state "Periode terkunci."
6. **Snapshot-aware reads:** when the active period is locked, previews and exports deserialize `tables_json` of the latest snapshot instead of compiling. Evidence links still resolve to live files. Table and criterion exports are rebuilt from the snapshot models; the full export streams the stored workbook; the ZIP export builds from the snapshot models plus current files.
7. **`reopenPeriodAction({ periodId, reason })`** (capability `period.reopen`, reason ≥ 10 characters): sets `open`, stores the reason and actor in the app event `period_reopen`; snapshots are kept.
8. **`PeriodManagementScreen`:** period card (TS label, status, locked by/at), buttons by capability, and the snapshot list (seq, created at, created by, tables complete, download link via `downloadPeriodSnapshotHandler`, which requires `period.view`).
9. A second submission after a reopen creates snapshot seq + 1 (FR-15 AC6).

## Rules to honour
- The snapshot is immutable: no update or delete path exists for `period_snapshot`.
- Master data stays editable while locked and must not change what a locked preview or export shows (FR-15 AC4): this is why locked reads come from the snapshot.
- Creating a new period is possible only when no period is open (Phase 03 rule); a locked period remains viewable as the active period until a new one is created.

## Tests
- Unit: `buildPeriodSnapshot` produces 31 table models plus Identitas and a readable workbook.
- Integration: submit with gaps without acknowledgement → rejected; with acknowledgement → locked + snapshot 1; every LKPS write action → `PERIOD_LOCKED`; master edit after lock does not change the locked preview; reopen requires `period.reopen` and a reason; resubmit → snapshot 2; snapshot download authorisation.
- E2E (`period-lock.spec.ts`): Kaprodi submits and locks; Admin Prodi sees the banner and read-only forms; export still works; Admin Sistem reopens with a reason; Admin Prodi can edit again.

## Acceptance checklist
- [ ] FR-15 AC1–AC6 pass.
- [ ] FR-12 AC6 and FR-08 AC11 pass.
- [ ] The "every action is lock-aware" test passes and its allow-list is justified in the phase log.
- [ ] `pnpm verify` and the E2E spec pass.

## Verify
```bash
pnpm db:reset && pnpm verify && pnpm test:e2e -- period-lock
```
