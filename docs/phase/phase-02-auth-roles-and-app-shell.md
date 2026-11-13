# Phase 02 — Auth, Roles & App Shell

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S1 | 01 | FR-01, FR-02, §3 | §3.3–§3.5, §7.1, §7.17 (admin users), §7.18, §8, §13.2, §20 | §5, §6.1, §7.1, §7.9 (Pengguna, 403), §9 |

## Goal
People can log in, are forced to change an initial password, see a shell with role-filtered navigation, and Admin Sistem can manage accounts. The base UI components used by every later screen exist.

## Read first
PRD FR-01, FR-02, §3 · TRD §13.2 (capabilities), §20 (auth), §8 (navigation), §3.4–§3.5 (action and form patterns) · DESIGN §5, §6, §7.1.

## Out of scope
Periods, master data, any LKPS table. The period chip in the top bar shows "Belum ada periode" until Phase 03.

## Deliverables

**Auth** — all files in TRD §7.1 (frontend `auth`, backend `auth` feature, `backend/auth/`, shared `permissions/`, `session-user.type.ts`, auth schemas). `assert-entry-access.ts` may wait for Phase 06.

**Backend shared** — `run-action.ts`, `to-action-result.ts`, `parse-list-filters.ts`, `json-error-response.ts`.

**Audit** — `src/backend/features/audit/lib/log-app-event.ts` → `logAppEvent`.

**Admin · users** — from TRD §7.17: `admin-users.screen.tsx`, `user-form.component.tsx`, `reset-password-dialog.component.tsx`; actions `create-user`, `update-user`, `reset-user-password`, `set-user-active`; queries `list-users`, `get-user`; schemas `user.schema.ts`, `reset-user-password.schema.ts`. The "Dosen tertaut" picker depends on master data: in this phase the user form shows that field disabled with the helper "Tersedia setelah Master Data Dosen dibuat." Phase 04 enables it and enforces the link for DTPR and Dosen roles.

**Seed** — `src/backend/db/seed/seed-users.ts` → `seedUsers` (the five demo accounts in `CLAUDE.md` §6; `kaprodi` and `dtpr1` are linked to Dosen rows in Phase 04's seed).

**Frontend shared** (TRD §7.18)
- layout: `app-shell`, `app-sidebar`, `app-topbar`, `period-switcher` (static for now), `notification-bell` (renders nothing until Phase 15), `user-menu`, `page-header`.
- lkps: `status-badge`.
- form: `form-field`.
- data: `data-table`, `filter-bar`, `empty-state`.
- overlay: `entity-sheet`, `confirm-dialog`.
- hooks: `use-action-form`, `use-list-filters`.
- navigation: `nav-items.ts`, `filter-nav-items.ts`.

**Shared constants** — `app-routes.ts`, `role-labels.ts`, `entry-status-labels.ts`, `table-status-labels.ts`.

**Schemas common** — `zod-error-map-id.ts` (Bahasa Indonesia messages).

**Routing** — `app/(auth)/login/page.tsx`, `app/(app)/layout.tsx`, `app/(app)/loading.tsx`, `app/(app)/ganti-kata-sandi/page.tsx`, `app/(app)/forbidden/page.tsx`, `app/(app)/dashboard/page.tsx` (placeholder screen), `app/(app)/admin/pengguna/page.tsx`, `app/page.tsx` (landing redirect), `app/api/auth/[...all]/route.ts`.

## Steps
1. `permissionMatrix` + `canPerform` exactly per TRD §13.2. Unit-test every capability × role cell.
2. Session helpers: `getSessionUser` (React `cache`), `loadUserRoles`, `requireSessionUser` (redirect rules in TRD §20.2), `requireCapability`, `getLandingPath` (a user whose only role is Admin Sistem → `/admin/pengguna`; everyone else → `/dashboard`). Create a placeholder `DashboardScreen` (`src/frontend/features/dashboard/screens/dashboard.screen.tsx`) that shows the page header "Dashboard" and an empty state "Dashboard tersedia setelah data mulai diisi." so the route exists; Phase 15 replaces its body.
3. Actions: `signInAction` (generic failure message, lockout message, logs `login` / `login_failed`), `signOutAction`, `changePasswordAction` (rules PRD FR-01 AC6; clears the must-change flag).
4. Verify the Better Auth server APIs for: sign-in from a Server Action with cookies, creating a user while public sign-up is disabled, setting a user's password, ban/unban, revoking sessions. Record the calls in the phase log (TRD-OI-02).
5. Admin users: create (roles ≥ 1; initial password ≥ 10; the Dosen-link requirement for dtpr/dosen roles is switched on in Phase 04), update, reset password (sets must-change), activate/deactivate (ends sessions; cannot target self; cannot remove own `admin_sistem` role). Each logs an app event.
6. Shell: `AppShell` in `app/(app)/layout.tsx` after `requireSessionUser()`. Sidebar from `navItems` filtered by `filterNavItems`; at this phase `navItems` contains Dashboard and Pengguna only. Collapse state in a cookie.
7. Base components per DESIGN §6.1. `DataTable` supports server-side pagination and sorting via URL params. `EntitySheet` includes the Esc/unsaved guard hook-up (the guard hook itself arrives in Phase 06; leave the prop).
8. Login and change-password screens per DESIGN §7.1; 403 screen per §7.9.
9. `pnpm db:seed` now also seeds users.

## Rules to honour
- Every action starts with `requireSessionUser()` (except `signInAction`) and a capability check.
- Never reveal whether an email exists.
- No client-side auth library calls; the frontend calls actions only.
- UI copy from DESIGN §9.3.

## Tests
- Unit: `canPerform` matrix; password rule schema; `filterNavItems` per role.
- Integration: create user → sign in → forced change-password flag; deactivate ends session and blocks sign-in; self-deactivation rejected; non-admin calling `createUserAction` gets `FORBIDDEN`.
- E2E (`tests/e2e/auth.spec.ts`): wrong password message; Admin Sistem logs in and creates an Admin Prodi; that user logs in, is forced to change password, lands on the dashboard placeholder; opening `/admin/pengguna` as Admin Prodi shows the 403 page.

## Acceptance checklist
- [ ] FR-01 AC1–AC10 pass (AC3 lockout verified with a test that makes 6 attempts; the Dosen-link part of AC4 is completed in Phase 04).
- [ ] FR-02 AC1–AC3 pass for the pages that exist.
- [ ] Session idle timeout follows `SESSION_IDLE_MINUTES` (test with a short value).
- [ ] The shell matches DESIGN §5 (sidebar colours, active state, top bar contents, footer).
- [ ] All shared components listed above exist and are used by the Pengguna screen.
- [ ] Login, change-password, 403 and Pengguna screens are keyboard-operable with visible focus.
- [ ] `pnpm verify` and the E2E spec pass.

## Verify
```bash
pnpm db:reset && pnpm verify && pnpm test:e2e -- auth
```

## Handoff
Phase log: Better Auth API calls used (TRD-OI-02), and anything about the installed Next.js version that affected the patterns in TRD §3.
