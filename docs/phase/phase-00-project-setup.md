# Phase 00 — Project Setup

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S1 | — | §12 | §2, §3.2, §4, §7.20, §7.21, §21 | §3, §4 |

## Goal
An empty but fully wired repository: Next.js app, tooling, theme, folder skeleton, Docker database, and the convention checks that every later phase must pass.

## Read first
`CLAUDE.md` (all) · TRD §2 (stack), §3.2 (import boundaries), §4 (folders), §21 (environment) · DESIGN §3–§4 (tokens, theme).

## Out of scope
Database tables, authentication, any business feature, any real page beyond a placeholder.

## Deliverables

**Project and config**
- Next.js app (App Router, TypeScript strict, Tailwind v4, ESLint) with `app/` at the repository root and all other code under `src/`. Package manager: pnpm.
- `tsconfig.json` with aliases `@frontend/*`, `@backend/*`, `@shared/*`.
- `eslint.config.mjs` including `eslint-plugin-unicorn` `filename-case` (kebab-case) and `no-restricted-imports` patterns matching TRD §3.2.
- `prettier` config, `vitest.config.ts`, `playwright.config.ts`, `drizzle.config.ts` (schema glob `src/backend/db/tables/*.table.ts` + `src/backend/db/enums/*.enum.ts` + `src/backend/db/auth-schema.ts`, out `drizzle/`).
- `docker-compose.yml`, `docker/Dockerfile`, `docker/backup.sh`, `.env.example`, `.gitignore`, `.dockerignore` per TRD §21.
- `package.json` scripts per TRD §21.3 (`db:*` scripts may point at files that arrive in Phase 01).
- Root `README.md`: what the project is, prerequisites, the commands from `CLAUDE.md` §6.

**Dependencies** (latest stable, pinned exact): everything in TRD §2. Install now even if first used later: `drizzle-orm`, `drizzle-kit`, `pg`, `better-auth`, `zod`, `react-hook-form`, `@hookform/resolvers`, `@tanstack/react-table`, `exceljs`, `archiver`, `file-type`, `lucide-react`, `sonner`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, dev: `vitest`, `@playwright/test`, `tsx`, `eslint-plugin-unicorn`, types.

**Theme and shadcn**
- `app/globals.css` with the theme from DESIGN §4; fonts in `app/layout.tsx`.
- shadcn initialised into `src/frontend/shared/components/ui/`. Add primitives: button, input, textarea, label, select, checkbox, switch, badge, card, table, tabs, accordion, dialog, alert-dialog, sheet, popover, command, dropdown-menu, tooltip, alert, skeleton, separator, sidebar, sonner, progress, breadcrumb.

**Folder skeleton** (TRD §4): create the directories with `.gitkeep` where empty.

**Shared pure code**
- `src/shared/format/`: `format-number-id.ts`, `format-rupiah-juta.ts`, `format-date-id.ts`, `format-academic-year.ts`, `format-file-size.ts` (rules in DESIGN §9.4), each with a `.test.ts`.
- `src/shared/types/action-result.type.ts`, `screen-props.type.ts`, `list-filters.type.ts`, `entry-status.type.ts`, `table-status.type.ts` (TRD §3.4, §9).
- `src/shared/constants/upload-limits.ts`.

**Convention scripts** (TRD §7.21): `check-single-export.ts`, `check-unique-stems.ts`, `check-import-boundaries.ts`, `check-routing-files.ts`, `run-convention-checks.ts`.

**Placeholder app**
- `app/layout.tsx`, `app/page.tsx` (temporary: renders "LKPS" and the app version), `app/not-found.tsx`, `app/error.tsx`.

## Steps
1. Scaffold with `create-next-app@latest`; move to the structure above; confirm the installed Next.js major and read its upgrade notes (async `params`, routing-file conventions).
2. Install and pin dependencies. Record the versions in the phase log.
3. Add theme, fonts and shadcn primitives. Render one Button and one Badge on the placeholder page to prove tokens work, then remove them.
4. Write the formatters with tests.
5. Write the convention scripts:
   - **single export:** for each file under `src/` and `scripts/` (minus exemptions in `CLAUDE.md` §5), parse with the TypeScript compiler API; fail if runtime exports ≠ 1, or if the export name ≠ expected name derived from the file stem and suffix (`.screen` → `PascalCase + Screen`, `.component` → PascalCase, `.action` → camelCase + `Action`, `.query` → `Query`, `.handler` → `Handler`, `.schema` → `Schema`, `.table` → `Table`, `.enum` → `Enum`, `.compiler` → `compile` + PascalCase, `.rule` → `rule` + PascalCase, `use-*` → camelCase, plain → camelCase or PascalCase for classes/components). `.type.ts` files may export several types and no runtime values.
   - **unique stems:** fail on duplicate file names (ignoring `.test`).
   - **import boundaries:** apply the table in TRD §3.2 using resolved import paths.
   - **routing files:** every `app/**/page.tsx` and `route.ts` may contain only imports/re-exports and a `metadata` (or `generateMetadata` re-export); `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` are free-form.
6. Wire `pnpm verify`. Add a CI workflow file (`.github/workflows/verify.yml`) running `pnpm verify` on push.
7. `docker compose up -d db` and confirm a connection with `psql` or a one-off script.

## Rules to honour
- No business logic yet. Do not create tables or auth.
- Pin exact versions (no `^`).
- Convention scripts must exit non-zero on violations and print file paths.

## Tests
- One `.test.ts` per formatter (id-ID separators, Rp juta rounding, date format `08 Nov 2026`, academic year label, file size).
- A fixtures-based test for each convention script: one passing and one failing sample.

## Acceptance checklist
- [x] `pnpm dev` serves the placeholder page with Source Sans 3 and the grey background `#F4F6F9`. Verified by fetching the compiled CSS: `--background: #f4f6f9`, `--brand-500: #f07316`, `--primary: #b4500a`, and the Source Sans 3 font variable class applied to `<html>`.
- [x] `pnpm verify` passes on a clean checkout.
- [x] Each convention script fails on its failing fixture and passes on the repository.
- [ ] `docker compose up -d db` starts PostgreSQL 17; the app can connect using `DATABASE_URL`. **Not verified** — Docker Desktop could not be made to work on the development machine (GlobalProtect VPN's network filter driver conflicts with Hyper-V/WSL2 virtual switch creation; confirmed root cause, workaround not found). `docker-compose.yml` is written to spec and untested. Verified instead against PostgreSQL 18 installed natively (see phase log).
- [x] `.env.example` lists every key in TRD §21.1; `.env` is git-ignored.
- [x] Folder skeleton matches TRD §4.
- [x] Dependency versions are pinned and listed in the phase log.

## Verify
```bash
pnpm install && pnpm verify && pnpm build
docker compose up -d db
```

## Handoff
Update `docs/phase/README.md` (status, phase log with installed versions and any API differences found in step 1).
