# Phase 15 — Dashboard & Notifications

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S5 | 11, 13, 14 | FR-14, FR-17, §11, D-01 (no scoring) | §7.2, §7.17 (`notifications`), §13.5 | §7.2 (Dashboard), §6.1 (KpiSmallBox) |

## Goal
The placeholder dashboard is replaced by the real one: completeness, work queues and raw indicator values for Kaprodi and Admin Prodi, and "Tugas Saya" for DTPR and Dosen. The top-bar bell shows live counts.

## Read first
PRD FR-14, FR-17, §11, §1.3 (non-goals) · TRD §7.2 · DESIGN §7.2.

## Out of scope
Any score, grade, target, threshold colour or prediction of accreditation results. Email or push notifications.

## Deliverables
- **Dashboard feature:** every file in TRD §7.2 (replace the placeholder `DashboardScreen`).
- **Notifications:** `get-notification-counts.query.ts`; wire `NotificationBell` (shell component from Phase 02) to it.
- **Sidebar:** the Verifikasi nav item shows the count badge from the same query.

## Steps
1. **`getDashboardKpisQuery`** (capability `dashboard.full`): one call to `computeAllTableStatuses` plus grouped counts:
   - Tabel Lengkap `x / 31`;
   - Menunggu Verifikasi (submitted entries);
   - Dikembalikan (returned entries);
   - Bukti Belum Ada (non-deleted entries of evidence-required entities with an empty required slot);
   - Peringatan Validasi (submitted or verified entries whose `warning_notes` is non-empty are *resolved*; count draft/returned entries that currently fail a warning rule).
   Each `KpiSmallBox` links to a filtered list: `/verifikasi`, or the export centre's table list with a status filter, or the first affected table.
2. **`getCriterionCompletenessQuery`:** Identitas (from `getIdentitasStatusQuery`) plus six criteria: tables complete / total, percentage for the progress bar, link to the criterion's Pratinjau.
3. **`computeIndicatorValues(tx, prodiId, period)`** implements the ten rows of PRD §11 exactly, from verified data, returning `{ label, value: string | null, basis: string }`; `null` renders "—". Reuse `loadVerifiedMhsData`, `loadVerifiedLulusan`, `weightedAverage`, `computeEwmpTotal`. `IndicatorValuesCard` shows the caption "Angka mentah dari data terverifikasi · tanpa penilaian".
4. **`getMyTasksQuery`** (capability `dashboard.my_tasks`, requires `user.dosenId`): own returned entries (with the return note excerpt), own drafts, own entries missing required evidence; plus, for pengampu, a line when the curriculum mapping is `returned` or has unmapped own courses. Each row links with `routeFor(row) + ?entri=<id>`.
5. **`DashboardScreen`** composition by capability:
   - `dashboard.full`: KPI row, completeness card, indicator card, and `MyTasksCard` when the user is linked to a Dosen;
   - only `dashboard.my_tasks`: `MyTasksCard` full width with the period header;
   - Admin Sistem has no dashboard (landing redirect goes to `/admin/pengguna`).
   The header shows the period (TS label, status) and "Peringkat akreditasi terakhir: <nilai>" from Identitas Pengusul as plain text (FR-14 AC3). No period → `NoPeriodState`.
6. **`getNotificationCountsQuery`:** Kaprodi → count of submitted entries; others → count of own returned entries. Bell click → `/verifikasi` or `/dashboard#tugas-saya`. Counts refresh on navigation (server-rendered in the shell layout; no polling).

## Rules to honour
- No colour coding of indicator values and no comparison to any standard. Only table-status badges use semantic colours.
- All numbers come from verified data of the active period; a locked period shows the same numbers computed from live verified rows (they cannot change while locked).
- Queries must stay within the NFR: dashboard server time under 1 s at reference volume; do not call `runEntryRules` per entry in a loop on page load (use stored `warning_notes` and grouped SQL; error counts come from `computeAllTableStatuses`).

## Tests
- Unit: `computeIndicatorValues` for each indicator (normal, zero divisor, missing source).
- Integration: KPI counts against a fixture with known numbers; `getMyTasksQuery` returns only own rows; notification counts per role.
- E2E (`dashboard.spec.ts`): Kaprodi sees `x / 31` and opens the verification queue from the KPI; DTPR sees a returned entry in "Tugas Saya" and opens it; the bell count drops after resubmission.

## Acceptance checklist
- [ ] FR-14 AC1–AC4 pass.
- [ ] FR-17 AC1–AC3 pass.
- [ ] No text or visual on the dashboard implies a target or score (search the UI copy for "target", "skor", "nilai akreditasi", "prediksi").
- [ ] `pnpm verify` and the E2E spec pass.

## Verify
```bash
pnpm db:reset && pnpm verify && pnpm test:e2e -- dashboard
```
