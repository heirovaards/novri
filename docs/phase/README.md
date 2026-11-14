# Phases — Sistem Informasi LKPS

Nineteen phases (00 to 18). Each phase is one work order sized for one agent session. Work on them **in order**; a phase may start only when every phase it depends on is `done`.

## How to run a phase

1. Read `CLAUDE.md`, then the phase file, then the PRD / TRD / DESIGN sections it lists under "Read first".
2. Create the files under "Deliverables". File names and exports are fixed by `TRD.md` §5–§7 and `CLAUDE.md` §5.
3. Follow "Steps" in order. Honour "Rules to honour".
4. Write the tests under "Tests".
5. Run the commands under "Verify" until they pass.
6. Tick the "Acceptance checklist" in the phase file.
7. Update the status table and add a phase-log entry below. Commit as `phase NN: …`.

If something in a phase conflicts with the PRD or TRD, the PRD wins, then the TRD. Report the conflict in the phase log and in your final message.

## Status

Statuses: `todo` · `in progress` · `done` · `blocked`.

| # | Phase | Sprint | Depends on | Status |
|---|---|---|---|---|
| 00 | [Project setup](./phase-00-project-setup.md) | S1 | — | done |
| 01 | [Database schema & seed](./phase-01-database-schema-and-seed.md) | S1 | 00 | done |
| 02 | [Auth, roles & app shell](./phase-02-auth-roles-and-app-shell.md) | S1 | 01 | done |
| 03 | [Period, references, settings & audit viewer](./phase-03-period-references-settings-audit.md) | S1 | 02 | todo |
| 04 | [Master data & import](./phase-04-master-data-and-import.md) | S1 | 03 | todo |
| 05 | [Evidence repository](./phase-05-evidence-repository.md) | S1 | 03 | todo |
| 06 | [Workflow & validation core](./phase-06-workflow-and-validation-core.md) | S1 | 04, 05 | todo |
| 07 | [Compiler core & Identitas](./phase-07-compiler-core-and-identitas.md) | S1 | 06 | todo |
| 08 | [Kriteria 1 — Budaya Mutu](./phase-08-kriteria-1-budaya-mutu.md) | S2 | 07 | todo |
| 09 | [Kriteria 2 — Mahasiswa (2.A)](./phase-09-kriteria-2-mahasiswa.md) | S3 | 07 | todo |
| 10 | [Kriteria 2 — Kurikulum (2.B.1–2.B.3)](./phase-10-kriteria-2-kurikulum.md) | S3 | 09 | todo |
| 11 | [Kriteria 2 — Lulusan & Rekognisi (2.B.4–2.D)](./phase-11-kriteria-2-lulusan-dan-rekognisi.md) | S3 | 09 | todo |
| 12 | [Kriteria 3 — Relevansi Penelitian](./phase-12-kriteria-3-penelitian.md) | S4 | 08 | todo |
| 13 | [Kriteria 4 — Relevansi PkM](./phase-13-kriteria-4-pkm.md) | S4 | 12 | todo |
| 14 | [Kriteria 5 & 6](./phase-14-kriteria-5-dan-6.md) | S5 | 12 | todo |
| 15 | [Dashboard & notifications](./phase-15-dashboard-and-notifications.md) | S5 | 11, 13, 14 | todo |
| 16 | [Excel export](./phase-16-excel-export.md) | S6 | 11, 13, 14 | todo |
| 17 | [Period submission & lock](./phase-17-period-submission-and-lock.md) | S6 | 16 | todo |
| 18 | [Hardening & UAT readiness](./phase-18-hardening-and-uat.md) | S6 | 15, 17 | todo |

## Dependency sketch

```
00 → 01 → 02 → 03 ─┬→ 04 ─┐
                   └→ 05 ─┴→ 06 → 07 ─┬→ 08 → 12 ─┬→ 13 ─┐
                                      │           └→ 14 ─┤
                                      └→ 09 ─┬→ 10       ├→ 15 ─┐
                                             └→ 11 ──────┼→ 16 → 17 ─┴→ 18
```

## Sprint mapping (thesis Scrum plan)

| Sprint | Theme | Phases | Sprint Review demo |
|---|---|---|---|
| S1 | Foundation & Identitas | 00–07 | Log in per role; create a period; import Dosen; enter and verify Identitas; preview the Identitas tables |
| S2 | Kriteria 1 | 08 | Enter EWMP as DTPR, verify as Kaprodi, preview Tabel 1.A.4 with Jumlah and Rata-rata |
| S3 | Kriteria 2 | 09–11 | Data Mahasiswa by year, curriculum matrices, Data Lulusan feeding 2.B.4 / 2.B.5 / 2.B.6 |
| S4 | Kriteria 3 & 4 | 12–13 | One research item with lecturers, students, funding, a linked publication and HKI; the same for PkM |
| S5 | Kriteria 5 & 6, dashboard | 14–15 | All 31 tables reachable; dashboard completeness and raw indicators |
| S6 | Export, lock, UAT | 16–18 | Full export with evidence ZIP; submit and lock; UAT script run |

## What each phase adds to shared registries

Several files are created once and extended by later phases. When a phase says "register", it means adding entries to these files, not creating new ones:

| File | Created in | Extended by |
|---|---|---|
| `src/frontend/shared/navigation/nav-items.ts` | 02 | every phase that adds pages |
| `src/shared/constants/app-routes.ts` | 02 | every phase that adds pages |
| `src/backend/lkps/validation/rule-registry.ts` | 06 | 07–14 (their rules) |
| `src/backend/lkps/compilers/compiler-registry.ts` | 07 | 08–14 (their compilers) |
| `src/backend/db/seed/seed-demo-data.ts` | 01 | 04, 07–14 (demo rows for their tables) |
| `tests/e2e/*.spec.ts` | 02 | most phases add one journey |

`entity-registry.ts` and `lkps-table-registry.ts` are written complete in Phase 06 (all 25 entities, all 31 tables), because the database tables already exist from Phase 01.

## Standard recipe for a table (Phases 07–14)

Every LKPS table is built the same way. A table phase lists only what is specific to its tables; everything else follows this recipe.

| # | Step | Where | Notes |
|---|---|---|---|
| 1 | Zod schema | `src/shared/schemas/<feature>/<entity>.schema.ts` | Extends `entryIntentSchema`. Identity fields always required; the rest required on submit through `requireOnSubmit`. Field rules from the PRD §8 field table. |
| 2 | List + get queries | `src/backend/features/<feature>/queries/` | `requireSessionUser` → capability → `buildOwnershipFilter` → rows for the active period (TRD §11) with status, evidence count, `rowVersion`. Lists accept `ListFilters` (TRD §9.2). |
| 3 | Create + update actions (or one save action for types Y and S) | `src/backend/features/<feature>/actions/` | `runAction` → `requireSessionUser` → `schema.parse` → `saveEntry` (TRD §3.4). No status logic, no direct inserts into workflow tables. |
| 4 | Rules | `src/backend/lkps/validation/rules/` | One file per rule ID; register in `ruleRegistry`; message text from PRD §10. |
| 5 | Form component | `src/frontend/features/<feature>/components/<entity>-form.component.tsx` | React Hook Form + the shared schema through `useActionForm`; `ReturnNoteAlert`, `ValidationSummary`, fields, `EvidenceUploader`, `EntryFormFooter`. Computed values as `DerivedField`. |
| 6 | Work screen | `src/frontend/features/<feature>/screens/table-<code>-<name>.screen.tsx` | Server component: `PageHeader` → `CriterionTabs` → `TableWorkHeader` → list (type E/D: `FilterBar` + `DataTable` + `EntryCountFooter`; type Y: `YearCardList`; type S: the form; type M: `MatrixGrid`) → `EntitySheet` opened by `?entri=<id>` or `?entri=baru`. Columns from DESIGN §8. |
| 7 | Routing | `app/(app)/<criterion>/<slug>/page.tsx` | Metadata + re-export only. Add the route to `appRoutes` and the page to `navItems`. |
| 8 | Compiler | `src/backend/lkps/compilers/table-<code>-<name>.compiler.ts` | Returns a `TableModel` per TRD §15.2; header, footer and notes verbatim from PRD §8; register in `compilerRegistry`. |
| 9 | Preview | the criterion's `kriteria-N-pratinjau.screen.tsx` | Nothing table-specific: the accordion renders whatever `compileCriterion` returns. |
| 10 | Seed | `seed-demo-data.ts` | A few placeholder rows in mixed statuses. |
| 11 | Tests | `tests/` | Schema unit tests, rule unit tests, one golden test per compiler (preview + export mode), integration tests for ownership and status, one E2E spec per phase. |

Checks that apply to every table, whether or not the phase file repeats them:
- Locked or missing period → inputs disabled, actions hidden, server rejects writes.
- DTPR and Dosen never see other owners' rows, previews or exports.
- "Simpan Draf" needs only identity fields; "Ajukan" runs all rules; warnings need notes.
- Editing a verified entry as a non-Kaprodi user shows the confirmation from PRD §7.1 and returns it to "Diajukan".
- Kaprodi's own submissions are verified immediately and flagged `self_verified`.
- Money: typed in rupiah, stored as integer rupiah, printed in Rp juta with 2 decimals.
- UI text in Bahasa Indonesia from DESIGN §9; instrument labels verbatim from PRD §8.

## Phase log

Add one entry per completed phase, newest last.

```
### Phase NN — <title> — <YYYY-MM-DD>
- Built: …
- Deviations from the phase file (and why): …
- Extra files added: …
- Open questions for the user: …
```

### Phase 00 — Project setup — 2026-11-14
- Built: Next.js 16.4.6 App Router + TypeScript strict project at the repo root (`app/` + `src/{frontend,backend,shared}`); `tsconfig.json` with `@frontend/@backend/@shared` aliases; `eslint.config.mjs` (Next.js 16's native flat-config pattern — `eslint-config-next/core-web-vitals` + `/typescript` — plus `eslint-plugin-unicorn` `filename-case: kebabCase` and best-effort `no-restricted-imports` boundary rules); Prettier, Vitest, Playwright, Drizzle configs; `docker-compose.yml` + `docker/Dockerfile` + `docker/backup.sh`; `.env.example`, `.gitignore`, `.dockerignore`; `.gitlab-ci.yml` running `pnpm verify`; root `README.md`. DESIGN §4 theme copied into `app/globals.css`; shadcn/ui initialised (`components.json`) with all 27 requested primitives installed into `src/frontend/shared/components/ui/`. Shared pure code: 5 formatters with tests, 5 shared type files, `upload-limits.ts`. Four convention scripts (`check-single-export`, `check-unique-stems`, `check-import-boundaries`, `check-routing-files`) implemented with the TypeScript Compiler API, aggregated by `run-convention-checks.ts`, each with a passing+failing fixture test. Placeholder `app/page.tsx` (routing-only, re-exports `PlaceholderHome`), `layout.tsx`, `not-found.tsx`, `error.tsx`. `pnpm verify` and `pnpm build` both pass.
- Deviations from the phase file (and why):
  - **CI is GitLab CI, not GitHub Actions.** The phase file names `.github/workflows/verify.yml`, but the repo's remote is GitLab (`gitlab.com/satriyawardhana-group/lkps_v3`), not GitHub. Added `.gitlab-ci.yml` instead, per the user's explicit choice.
  - **`typescript` pinned to 5.9.3, not the npm "latest" tag (7.0.2).** TypeScript 7 is a from-scratch native (non-JS) rewrite; its package no longer exposes the classic synchronous Compiler API (`ts.createSourceFile`, `ts.SyntaxKind`, etc.) used throughout the convention scripts — that surface is now an "unstable" RPC-client to a native binary with a completely different, undocumented shape. 5.9.3 is the latest release on the mature, well-documented API the convention scripts depend on. TRD §2 does not mandate a specific TypeScript major, only strict mode.
  - **`eslint-plugin-unicorn` is scoped to only `filename-case`, not `unicorn.configs.recommended`.** The full recommended preset brought in ~15 unrelated opinionated rules (e.g. renaming all `props` to `properties`, banning `process.exit` in our own CLI scripts) that directly conflict with TRD-mandated exact export names (e.g. `ScreenProps`) and normal CLI-script patterns. The phase file only asked for `filename-case`.
  - **Local dev database is PostgreSQL 18, not the TRD-pinned 17.** Docker Desktop could not be made to work on the development machine: GlobalProtect VPN's network filter driver conflicts with Hyper-V/WSL2 virtual switch creation (confirmed via `wsl --list --verbose` showing no WSL/Hyper-V virtual adapter ever created, and `ERROR_NETNAME_DELETED`/`E_ABORT` from `vpnkit-bridge`). PostgreSQL was installed natively instead via Chocolatey; the `postgresql17` package pointed at a retired EnterpriseDB download URL (404) and silently fell back to `postgresql18`. `docker-compose.yml` (pinned to `postgres:17`) is written to spec and believed correct, but is **untested** on this machine. User decided to keep 18 locally rather than keep chasing a working PostgreSQL 17 install. `DATABASE_URL=postgres://lkps:lkps@localhost:5432/lkps` verified working end-to-end with the `pg` driver.
  - **shadcn's `cn` and `radix-ui` packages used as published npm dependencies, not hand-written.** The current shadcn CLI (v4.23) generates components that import `cn` from the literal `"cn"` package and `Slot` from `"radix-ui"`, ignoring the `components.json` `utils` alias entirely (a behavior change from older shadcn versions). Removed the hand-written `src/frontend/shared/lib/cn.ts` as dead code once this was confirmed. `cmdk`, `cn`, `radix-ui` added as dependencies, pinned exact.
  - **Removed `next-themes`.** shadcn's `sonner.tsx` pulled it in solely to read a `theme` value for the Toaster, but DESIGN §4 is explicit that there is no dark mode and the project has no `ThemeProvider`. Hardcoded `theme="light"` instead. Kept Tailwind's `@custom-variant dark (&:is(.dark *))` in `globals.css` (rather than deleting it) so the many `dark:` utility classes already inside shadcn's generated components never activate via the OS `prefers-color-scheme` media query, since nothing ever applies a `.dark` class.
- Extra files added (not listed in the phase deliverables):
  - `src/frontend/shared/components/layout/placeholder-home.component.tsx` — `app/page.tsx` must be routing-only per the routing-files convention, so the placeholder's actual content (and the one-time Button/Badge token-proof render, since reverted) lives here instead.
  - `scripts/lib/walk-source-files.ts` — small helper shared by three of the four convention scripts (recursive file listing with ignore-dirs), not called out individually in the phase file but a direct, minimal dependency of required deliverables.
  - `components.json` — required by shadcn/ui, not explicitly listed as a phase-00 file but implied by "shadcn initialised".
- Open questions for the user:
  - PostgreSQL 17 vs 18 for local dev remains unresolved long-term — Docker was never fixed, only worked around. If Docker is fixed later (GlobalProtect stopped/uninstalled, or a different machine), consider re-verifying `docker compose up -d db` against the spec'd `postgres:17` image.
  - `docker/backup.sh`'s daily-at-01:00-WIB loop logic is written but has not been run inside an actual container (Docker unavailable); worth a smoke test once Docker works.

### Phase 01 — Database schema & seed — 2026-11-14
- Built: `authInstance` (`src/backend/auth/auth-instance.ts`) per TRD §20.1 — Drizzle adapter (pg, schema from the generated `auth-schema.ts`), email/password with sign-up disabled and a 10-char minimum, `mustChangePassword` additional field, session idle timeout from `SESSION_IDLE_MINUTES`, a 5-per-15-minutes rate limit on `/sign-in/email`, `admin()` + `nextCookies()` plugins (in that order). Generated `db/auth-schema.ts` with the Better Auth CLI: `pnpm dlx @better-auth/cli@latest generate --config src/backend/auth/.cli-shim.ts --output src/backend/db/auth-schema.ts -y` (the shim file re-exported `authInstance` as a default-ish `auth` export the CLI requires, then was deleted — the real file keeps the TRD-mandated `authInstance` export name). No column differences from TRD §10: `user`/`session`/`account`/`verification` plus `mustChangePassword` and the admin plugin's `role`/`banned`/`banReason`/`banExpires` came out exactly as specified.
  `db/client.ts` (node-postgres pool + Drizzle, loads `.env` itself since standalone scripts run via `tsx` don't get Next.js's auto env-loading). All 16 enums (`db/enums/*.enum.ts`) and all 61 tables (`db/tables/*.table.ts`) per TRD §10.3–§10.10, using Drizzle's current array-based `extraConfig` index API (0.45.x) rather than the older object-keyed form. `columns/workflow-columns.ts` and `columns/timestamps-columns.ts` as column-set factory functions. `sql/audit-trigger.sql` (verbatim from TRD §19.1) and `sql/apply-audit-triggers.ts` (idempotent via `drop trigger if exists` + `create trigger`; one constant list of all 60 audited tables with `{fkColumn, parentTable}` for the 9 workflow-child tables). Seeds: `seed-organisation.ts`, `seed-academic-years.ts` (2018–2035, 18 rows), `seed-reference-lists.ts` (12 lists, 67 rows, `meta.defaultSks` on `jabatan_struktural`), `seed-demo-data.ts` (empty shell), orchestrated by `run-seed.ts`. `scripts/db-reset.ts` (drops `public` *and* `drizzle` schemas, refuses under `NODE_ENV=production`). Backend shared: `with-actor.ts`, `domain-error.ts`, `get-current-prodi-id.ts` (cached with React `cache`, reads `DEFAULT_PRODI_CODE`). Shared types: `entity-type.type.ts`, `period.type.ts` (`TsLabel`, `ResolvedYear`, `ResolvedPeriod`). Test helpers: `get-test-db.ts`, `reset-test-database.ts`, `create-test-user-row.ts`, a Vitest `globalSetup` that creates `lkps_test` if missing and resets/migrates/triggers it, and a `setupFiles` entry that redirects `DATABASE_URL` to `TEST_DATABASE_URL` for the test process (needed because `withActor` — per TRD's literal spec — always uses the single `db` from `client.ts`, with no way to inject a different connection). All 6 integration-test scenarios from the phase file's Tests section, plus one more exercising the acceptance checklist's "query `pg_trigger` in a test" literally. Full round-trip verified against a real PostgreSQL 18 instance: migrate → 65 tables, 60 triggers; seed → exact PRD §13.2 counts and idempotent on a second run; `db:reset` works and refuses in production.
- Deviations from the phase file (and why):
  - **FK-column indexes skip the four generic workflow actor columns** (`created_by`, `updated_by`, `submitted_by`, `verified_by`) and `lkps_period`'s `created_by`/`locked_by`/`reopened_by`. TRD §10.1 says "indexes on every foreign key," but none of the TRD's own query examples ever filter on these audit-trail pointers, and indexing all ~160 of them across every workflow table would cost every future write (index maintenance) for no read benefit anyone has asked for. Indexed instead: `prodi_id` (where not already the leading column of a unique/composite index), `owner_dosen_id`, `academic_year_id`, `period_id`, and every genuine business-relationship FK (`dosen_id`, `mitra_id`, `tridharma_id`, `*_id → ref_option`, etc.). Flagging this explicitly as a judgment call, not a silent gap — revisit if a later phase's query patterns actually need actor-column filtering.
  - **`typescript` devDependency stays pinned at 5.9.3** (set in phase 00), not bumped — this phase's schema/migration/seed code uses nothing from TypeScript 6/7, so there was no reason to revisit that phase-00 decision.
  - **Vitest runs test files sequentially** (`fileParallelism: false`, added to `vitest.config.ts`). All integration tests share one `lkps_test` Postgres instance; running files in parallel (Vitest's default) let sibling test files' `beforeAll`/`afterAll` hooks race against `run-seed.test.ts`'s two sequential row-count snapshots, producing a false idempotency failure. Sequential execution is slightly slower but removes an entire class of shared-database races as the integration-test suite grows in later phases.
  - **CI (`.gitlab-ci.yml`) now runs a `postgres:17` service** and `pnpm db:migrate && pnpm db:seed` before `pnpm verify`, with `DATABASE_URL`/`TEST_DATABASE_URL`/etc. set as job variables. Phase 00 had no database in CI at all; phase 01's integration tests need one to pass anywhere but a developer's own machine.
- Extra files added (not listed in the phase deliverables):
  - `tests/helpers/setup-env.ts` and the `setupFiles` wiring in `vitest.config.ts` — see the Vitest-sequential deviation above; needed so `withActor` (hardcoded to `db/client.ts`'s connection) operates against `lkps_test` during tests instead of the real dev database.
  - A `check-single-export.ts` exemption for `db/client.ts` (TRD mandates the export name `db`, which the naming-convention deriver has no rule for) and for `db/auth-schema.ts` already covered the Better Auth file.
- Open questions for the user:
  - None blocking. The actor-column-indexing judgment call above is worth a second look once later phases' real query/report patterns are known, in case something does end up filtering by `submitted_by`/`verified_by`.

### Phase 02 — Auth, roles & app shell — 2026-11-14
- Built: `permissionMatrix`/`canPerform` verbatim from TRD §13.2 with an independently-transcribed unit test over every capability×role cell. Session helpers `getSessionUser` (React `cache`), `loadUserRoles`, `requireSessionUser`/`requireCapability` (screen use, redirect on failure) plus new `requireActor`/`requireActorCapability` (Server Action use, throw a coded `DomainError` instead — see Deviations), `getLandingPath`. `DashboardScreen` placeholder. Actions: `signInAction` (generic failure message, per-email lockout, `login`/`login_failed` audit events), `signOutAction`, `changePasswordAction`. Admin · users: `admin-users.screen.tsx`, `UserForm`, `ResetPasswordDialog`, `AdminUsersTable` (extra client wrapper — see Phase 00/01's convention), actions `create-user`/`update-user`/`reset-user-password`/`set-user-active`, queries `list-users`/`get-user`, schemas `user.schema.ts`/`reset-user-password.schema.ts`; the Dosen-link picker is disabled per the phase's own note, enabled in Phase 04. `seedUsers` → the 5 demo accounts in `CLAUDE.md` §6. All TRD §7.18 frontend shared components (`app-shell`, `app-sidebar`, `app-topbar`, `period-switcher`, `notification-bell`, `user-menu`, `page-header`, `status-badge`, `form-field`, `data-table`, `filter-bar`, `empty-state`, `entity-sheet`, `confirm-dialog`, `use-action-form`, `use-list-filters`, `nav-items`/`filter-nav-items`). Shared constants (`app-routes`, `role-labels`, `entry-status-labels`, `table-status-labels`), `zod-error-map-id.ts`. All routing files per the phase's Routing list. Better Auth server APIs exercised directly (TRD-OI-02): `signInEmail`, `createUser`, `adminUpdateUser`, `setUserPassword`, `banUser`, `unbanUser`, `revokeUserSessions`, `getSession`, `changePassword` — all called as `authInstance.api.*` from Server Actions, never through the client SDK, per the phase's "no client-side auth library calls" rule. Full manual browser verification of every golden path (wrong password, successful login per role landing path, forced change-password, admin create/edit/deactivate/reactivate/reset-password, 403, sidebar collapse, logout) plus a Playwright `tests/e2e/auth.spec.ts` with 6 specs: wrong password; Admin Sistem creates an Admin Prodi who is forced to change password, lands on the dashboard, and gets 403 on Pengguna; deactivation ends an existing session and blocks sign-in; Admin Sistem can't deactivate themselves; Admin Sistem can't remove their own Admin Sistem role; 5 failed attempts then a 6th (correct-password) attempt is locked out. `pnpm verify` and `pnpm test:e2e -- auth` both pass repeatably (re-run 5+ times after each fix to rule out flakes). New unit tests: `require-actor.test.ts`, `require-actor-capability.test.ts`, `run-action.test.ts`, `change-password.schema.test.ts` (149→155 total project tests across the phase).
- Deviations from the phase file (and why):
  - **The previous session's blocking bug, root-caused and fixed first:** `next.config.ts`'s CSP (`default-src 'self'` with no `script-src` entry) silently blocked Next.js App Router's own inline hydration bootstrap script, so the client never hydrated on any page (visible as a repeating `InvariantError: Expected a request ID to be defined for the document via self.__next_r` and every form submitting as a native GET). Fixed per Next's own "Without Nonces" CSP guide: `script-src 'self' 'unsafe-inline'`, plus `'unsafe-eval'` in development only (React's own documented requirement for reconstructing server error stacks in the browser). Chose this over nonce-based CSP because nonces force every page into dynamic rendering app-wide, which this project doesn't need.
  - **`sonner`'s `<Toaster />` was never mounted anywhere.** Every `toast.success`/`toast.error` call in `useActionForm` was silently swallowed. Added `src/frontend/shared/components/layout/toast-provider.component.tsx` (a thin wrapper so `app/layout.tsx` — which may only import `shared/components/layout/*` per the import-boundary rules — can mount it) and rendered it in the root layout.
  - **DESIGN's "Error (action): Toast + inline message" rule (§7.1, and the general rule table) wasn't implemented anywhere** — `useActionForm` only toasted and never exposed the failure message to the calling component, so no form showed the DESIGN-mandated inline danger-soft alert. Added `errorMessage` to `useActionForm`'s return value and a `danger` variant to the shared `Alert` component (`bg-danger-soft`/`text-danger-soft-fg`, matching the token names DESIGN itself references), then wired the inline alert into `LoginForm`, `ChangePasswordForm`, `UserForm`, and `ResetPasswordDialog` — every action-backed form in this phase.
  - **`requireSessionUser`/`requireCapability` are unsafe for Server Actions and five actions were using them anyway.** Both call `redirect()` on failure, which is correct for a Server Component screen but, inside a Server Action wrapped by `runAction`'s `try/catch`, gets caught as a plain error and converted into a generic `{code:'UNEXPECTED', message:'Terjadi kesalahan...'}` — never a real redirect, never the coded `FORBIDDEN`/`UNAUTHENTICATED` the phase's own Integration tests expect ("non-admin calling `createUserAction` gets `FORBIDDEN`"). Added `requireActor`/`requireActorCapability` (`src/backend/auth/`) that throw `DomainError('UNAUTHENTICATED'|'FORBIDDEN', ...)` instead of redirecting, and switched `create-user`, `update-user`, `reset-user-password`, `set-user-active`, and `change-password` actions to use them. Verified both the thrown-error→`ActionResult` conversion (`run-action.test.ts`) and the guards themselves (`require-actor(-capability).test.ts`) at the unit level, since `next/headers`-dependent code can't be driven through a real Next.js request from Vitest.
  - **Better Auth's own rate limiter never runs for our actual sign-in path, so PRD FR-01 AC3 was not enforced.** Traced into the installed package: `onRequestRateLimit` fires from the HTTP router's `onRequest` hook (`better-auth/dist/api/index.mjs`), which only executes for requests that flow through `app/api/auth/[...all]/route.ts`. `sign-in.action.ts` calls `authInstance.api.signInEmail(...)` directly from a Server Action — exactly as the phase mandates ("No client-side auth library calls; the frontend calls actions only") — which never touches that router at all, so the configured `customRules['/sign-in/email']` was silent dead weight. Implemented the lockout directly in `sign-in.action.ts` instead: before calling `signInEmail`, count `login_failed` audit rows for that email (now logged with `entityType:'login_attempt', entityId:<email>`) in the last 15 minutes and reject with the same "Terlalu banyak percobaan..." message at 5. This also incidentally matches PRD's literal wording ("5 failed attempts for the **same email**") better than Better Auth's default IP-keyed limiter would have. Left the inert `rateLimit.customRules` config in `auth-instance.ts` as harmless defense-in-depth for the direct HTTP endpoint, which nothing in this app calls today but a future integration might.
  - **A real, pre-existing bug in `UserForm`, found by the E2E suite, not by hand-testing:** the edit-mode password field defaulted to `''`, which — unlike `undefined` — still has to satisfy the schema's `min(10)` on submit even though `.optional()` lets the key be omitted. Since the password `FormField` isn't rendered in edit mode, this failed client-side validation **silently** on every single "Ubah Pengguna" save (no error visible anywhere, the sheet just didn't close) — the edit flow was completely broken for any field, not just roles. Fixed by defaulting to `undefined` when not creating.
  - **`FormField`'s prop-cloning landed `id`/`aria-describedby`/`aria-invalid` on the wrong element for the login password field**, because `LoginForm` wrapped `Input` + a show/hide button in a `<div>` as FormField's single child, and `cloneElement` only ever touches that immediate child. Produced a duplicate `id="password"` in the DOM (`<label for="password">` then ended up pointing at the wrapper div, not the input) and meant the error/aria wiring never reached the real control. Added an `endAdornment` prop to `FormField` so the actual `<Input>` stays the direct, clonable child while the toggle button renders as a sibling inside the same positioning wrapper; fixed `LoginForm` to use it. Found via the E2E suite's `getByLabel` failing in a way manual clicking never would have surfaced.
  - **`getSessionUser` now also checks `result.user.banned` directly**, returning `null` (logged out) rather than trusting session-row deletion alone. Defense in depth found while chasing an E2E flake in the deactivation test that turned out to be unrelated (see next point) but is worth keeping regardless.
  - **`next.config.ts`'s `output: 'standalone'` is now conditional on a `DOCKER_BUILD=true` env var**, set only in `docker/Dockerfile` before `pnpm build`. `next start` — used by `pnpm start`, which is what Playwright's local `webServer` runs for E2E — explicitly does not support `output: 'standalone'` (Next prints its own warning saying so). Production is unaffected: the Dockerfile already runs `node server.js` (the standalone entrypoint), never `next start`.
  - **`useListFilters` (URL-search-param based list filters) was deliberately not wired into the Pengguna screen.** It fits a paginated, server-filtered list (the shape every later LKPS-table phase actually needs); the admin accounts list is small, unpaginated, and has no status/year axis to filter by. Wired in `FilterBar` (client-side name/email search) and `EmptyState` (shown when a search matches nothing) instead, which satisfies the checklist's "all shared components ... used by the Pengguna screen" without forcing a pagination model onto a screen that doesn't need one.
  - **TanStack React Table v9's API is a ground-up rewrite from v8** (`tableFeatures({})`, `createColumnHelper<typeof features, T>()`, `useTable({features, columns, data})`, `table.FlexRender`) — confirmed from the installed package's own `getting-started` skill and `node_modules` inspection per CLAUDE.md §11, not from training-data memory of v8.
  - **Zod 4's top-level `z.email()`** (not a chained `.email()`) and `zod/locales`' `id()` import for `z.config({ localeError })` — also version-specific, confirmed from the installed package.
  - A React "adjust state during render" pattern (comparing against a `lastSearchProp` state value, setting state directly in the render body) replaces a `useEffect`+`setState` anti-pattern in `filter-bar.component.tsx` that the `react-hooks/set-state-in-effect` lint rule flagged.
- Extra files added (not listed in the phase deliverables):
  - `proxy.ts` (repo root) — `requireSessionUser()` needs to know "am I already on `/ganti-kata-sandi`" to avoid a redirect loop when `mustChangePassword` is set; Next.js has no other sanctioned way to read the current request's pathname from a shared layout, so middleware forwards it as an `x-pathname` header.
  - `src/frontend/features/admin/components/admin-users-table.component.tsx` — a Server Component (`admin-users.screen.tsx`) cannot pass its row-click/mutation handlers as props to a Client Component, so the interactive table needed its own `'use client'` wrapper.
  - `src/backend/auth/require-actor.ts`, `require-actor-capability.ts` — see the redirect-swallowing deviation above.
  - `src/frontend/shared/components/layout/toast-provider.component.tsx` — see the unmounted-`Toaster` deviation above.
  - Test files not individually named in the phase's Tests section but exercising required behaviour: `require-actor.test.ts`, `require-actor-capability.test.ts`, `run-action.test.ts`, `change-password.schema.test.ts` (the phase explicitly lists "password rule schema" under Unit tests but no file existed for it).
- Open questions for the user:
  - **Session idle timeout (FR-01 AC7) is wired correctly by code review** (`authInstance`'s `session.expiresIn` reads `SESSION_IDLE_MINUTES`) **but was not exercised with an actual short value and a real wait** — doing so needs a second server instance running with a different env value, which didn't fit this session's time budget. Worth a dedicated short test in a later hardening pass (Phase 18 is the natural place) if it isn't done sooner.
  - The now-inert `rateLimit.customRules['/sign-in/email']` in `auth-instance.ts` protects a direct-HTTP-endpoint path nothing in this app currently calls (see the AC3 deviation above). Fine to leave as-is, but flagging in case a future phase ever adds a direct `/api/auth/*` caller (e.g. a mobile client) and assumes that config already covers it the way it covers the real sign-in path.

### Infrastructure note — remote moved to GitHub — 2026-11-14
Phase 00's log entry above explains why CI was built as GitLab CI (`.gitlab-ci.yml`): at the time, the project's only remote was GitLab (`gitlab.com/satriyawardhana-group/lkps_v3`). GitLab CI pipelines never actually ran, though — the GitLab account needs an identity verification step (phone/card, GitLab's standard anti-abuse gate for free CI minutes) that was never completed, so every pipeline from phase 00 through phase 02 failed before executing a single job. The user moved the project to a GitHub remote (`github.com/heirovaards/lkps_v3`) instead of completing that verification.
- `origin` now points to GitHub; the old GitLab remote is kept as `gitlab` (not deleted, not pushed to going forward) in case it's needed later.
- `.gitlab-ci.yml` removed; replaced with `.github/workflows/verify.yml`, matching what the phase 00 file originally specified before the GitLab deviation — same steps (`pnpm install --frozen-lockfile` → `pnpm db:migrate` → `pnpm db:seed` → `pnpm verify`), same `postgres:17` service container and env vars, translated to GitHub Actions syntax (`pnpm/action-setup`, `actions/setup-node` with pnpm caching, a `services.db` container with a healthcheck instead of GitLab's `services:` list).
- Not yet confirmed working — this workflow hasn't had a real run yet. Worth checking the Actions tab after the next push.
