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
| 01 | [Database schema & seed](./phase-01-database-schema-and-seed.md) | S1 | 00 | todo |
| 02 | [Auth, roles & app shell](./phase-02-auth-roles-and-app-shell.md) | S1 | 01 | todo |
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
