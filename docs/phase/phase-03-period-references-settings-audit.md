# Phase 03 — Period, Reference Lists, Settings & Audit Viewer

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S1 | 02 | FR-03, FR-06, FR-16 AC3–AC5, §4.1–§4.2 | §7.3 (subset), §7.17, §12, §19.3 | §5 (banners), §6.1 (HistoryDrawer), §7.9 (Periode, Validasi, Referensi, Audit) |

## Goal
Kaprodi can create the LKPS period; the whole app knows the active period and its TS years; reference lists and validation settings are editable; the audit log is viewable.

## Read first
PRD FR-03, FR-06, FR-16 · TRD §12 (period helpers), §19.3 (history) · DESIGN §7.9.

## Out of scope
Submitting, locking, reopening and snapshots (Phase 17). Period attachments and Nihil (Phases 05, 06). Table status.

## Deliverables

**Period** (subset of TRD §7.3)
- Backend: `create-period.action.ts`, `get-active-period.query.ts`, `list-periods.query.ts`, `lib/get-ts-years.ts`, `lib/resolve-period-years.ts`, `lib/find-open-period.ts`, `lib/assert-period-open.ts`.
- Frontend: `period-management.screen.tsx`, `create-period-dialog.component.tsx`.
- Shared: `create-period.schema.ts`.
- Frontend shared layout: finish `period-switcher`, add `locked-period-banner`, `no-period-state`.
- Frontend shared lkps: `ts-chip`.

**Reference lists** (TRD §7.17 admin)
- Backend: `create-ref-option`, `update-ref-option`, `reorder-ref-options`, `set-ref-option-active` actions; `list-ref-options.query.ts`; `src/backend/features/master/queries/list-ref-options-for-form.query.ts`.
- Frontend: `admin-reference-lists.screen.tsx`, `ref-option-form.component.tsx`, `ref-option-list.component.tsx`.
- Shared: `ref-option.schema.ts`.

**Settings** — all `settings` files in TRD §7.17.

**Audit viewer**
- Backend: `list-audit-logs.query.ts`, `get-entry-history.query.ts`.
- Frontend: `admin-audit-log.screen.tsx`, `audit-diff-list.component.tsx`, shared `history-drawer.component.tsx`.

**Routing** — `/periode`, `/pengaturan/validasi`, `/admin/referensi`, `/admin/audit` pages; register them in `navItems` and `appRoutes`.

## Steps
1. `getTsYears` and `resolvePeriodYears` (TRD §12). `ResolvedPeriod` carries `{ id, status, ts3, ts2, ts1, ts }` with year ids and labels.
2. `createPeriodAction`: Kaprodi only; rejects when a period is open (FR-03 AC2) or the TS year is already used (AC3); logs `period_create`.
3. `getActivePeriodQuery`: open period, else most recent locked, else null.
4. `assertPeriodOpen(tx, prodiId)`: returns the open `ResolvedPeriod` or throws `NO_ACTIVE_PERIOD` / `PERIOD_LOCKED`.
5. Periode screen: active-period card with the four derived years, table of periods, "+ Buat Periode" dialog showing the derived years before saving. Admin Prodi sees it read-only. Leave visible but disabled placeholders out: the lock and reopen buttons are added in Phase 17.
6. `PeriodSwitcher` in the top bar shows "TS 2025/2026" + status; `NoPeriodState` component ready for data screens.
7. Reference lists: types and labels from PRD §13.2; reorder (up/down or drag); an option in use is deactivated, never deleted; `listRefOptionsForFormQuery(type)` returns active options in order plus any inactive option already used by the record being edited (pass `includeIds`).
8. Validation settings: EWMP min/max (min < max, both > 0); stored in `prodi_setting`.
9. Audit screen with filters; `HistoryDrawer` + `AuditDiffList` (hide technical keys; show "lama → baru"); action labels in Bahasa Indonesia.

## Rules to honour
- TS labels are produced only by `resolvePeriodYears`.
- All writes inside `withActor`.
- Reference options are referenced by id; renaming an option must not break existing data.

## Tests
- Unit: `getTsYears` (TS 2025 → 2022…2025); settings schema.
- Integration: create period happy path; second open period rejected; duplicate TS rejected; non-Kaprodi rejected; `assertPeriodOpen` both errors; ref option reorder persists; deactivate hides from `listRefOptionsForFormQuery` unless in `includeIds`.
- E2E (`period.spec.ts`): Kaprodi creates TS 2025/2026; the top bar shows the chip; Admin Sistem renames a reference option and sees the audit record with the diff.

## Acceptance checklist
- [ ] FR-03 AC1–AC6 pass (AC7 is structural, covered by the data model).
- [ ] FR-06 AC1–AC3 pass.
- [ ] FR-16 AC3 (drawer), AC4 (list + filters), AC5 (no edit/delete path) pass.
- [ ] Pages appear in the sidebar only for permitted roles (TRD §8).
- [ ] `pnpm verify` and the E2E spec pass.

## Verify
```bash
pnpm db:reset && pnpm verify && pnpm test:e2e -- period
```

## Handoff
Update the seed so `pnpm db:seed` also creates the demo period (TS 2025/2026, open). Phase log as usual.
