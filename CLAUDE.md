# CLAUDE.md — Sistem Informasi LKPS

This file is the operating manual for any AI coding agent working in this repository. Read it fully before touching code. It is short on purpose; the detail lives in `docs/`.

## 1. What this project is

**Sistem Informasi LKPS** is a web application that lets Program Studi Sistem Informasi (Fakultas Biosains, Teknologi, dan Inovasi, Universitas Katolik Indonesia Atma Jaya) collect, verify and export the data for its **Laporan Kinerja Program Studi (LKPS)**, following the LAM INFOKOM "Instrumen APS 2.1 Program Sarjana" (31 official tables in 6 criteria).

Core idea: users never type into the official tables. They enter each fact once (a lecturer, a research project, a lab). The system verifies it, compiles the 31 official tables automatically, and exports them to Excel.

The project is a thesis build ("Rancang Bangun Sistem Informasi Laporan Kinerja Program Studi Menggunakan Pendekatan Scrum"). Scope is fixed by the thesis proposal: **no accreditation scoring, no LED, one prodi**.

## 2. Source-of-truth documents

Read in this order. When two documents disagree, the one higher in this list wins, and you must report the conflict in your final message.

| # | File | What it decides |
|---|---|---|
| 1 | `docs/PRD.md` | What the product does: roles, rules, every table's fields, validation, acceptance criteria |
| 2 | `docs/TRD.md` | How it is built: stack, folders, file names, data model, engine design |
| 3 | `docs/DESIGN.md` | How it looks and reads: tokens, components, screen patterns, UI copy |
| 4 | `docs/phase/README.md` | Phase order, dependencies, status tracker |
| 5 | `docs/phase/phase-NN-*.md` | The work order for one phase: files, steps, acceptance checklist |

## 3. How to work

1. Open `docs/phase/README.md`. Find the first phase whose status is not `done`. Work on **that phase only**.
2. Read the phase file, then the PRD/TRD/DESIGN sections it references.
3. Build exactly the files the phase lists. If you need a file that is not listed, add it following the naming rules (section 5) and mention it in your final message.
4. Run `pnpm verify` until it passes. Run the phase's extra checks.
5. Tick the phase's acceptance checklist in the phase file, set its status in `docs/phase/README.md`, and write a short entry under "Phase log" there (what was built, deviations, open questions).
6. Commit with the message format in section 8. Do not start the next phase in the same session unless the user asks.

**Never** skip ahead, build features from a later phase "while you are there", or change scope. If a phase seems to need something out of scope, stop and ask.

## 4. Architecture in one page

One Next.js app (App Router, TypeScript), split into two code trees plus a small shared tree:

```
app/                 routing only: page.tsx / route.ts re-export one screen or handler. No logic.
src/frontend/        everything that renders: screens, components, hooks
src/backend/         everything that reads or writes data: actions, queries, handlers, db, lkps engine
src/shared/          code both sides need: Zod schemas, types, permission matrix, formatters
```

Import rules (enforced by `pnpm check:conventions`):

| From | May import | Must never import |
|---|---|---|
| `app/` | `src/frontend/**/screens/*`, `src/frontend/shared/components/layout/*`, `src/backend/**/handlers/*` | anything else |
| `src/frontend/` | `src/shared/**`; `src/backend/**/actions/*.action`; `src/backend/**/queries/*.query` (queries only inside `*.screen.tsx`) | `src/backend/db`, `src/backend/lkps`, `src/backend/**/lib`, any table file |
| `src/backend/` | `src/shared/**` | `src/frontend/**` |
| `src/shared/` | external packages only | `src/frontend/**`, `src/backend/**` |

Data flow:

- **Read:** `page.tsx` → `*.screen.tsx` (Server Component) → `*.query.ts` → database.
- **Write:** client component → `*.action.ts` (Server Action) → validate → authorise → database (inside `withActor` transaction) → revalidate.
- **Files / import / export:** `route.ts` → `*.handler.ts`.
- **Official tables:** `*.compiler.ts` returns a `TableModel`; the same model feeds the on-screen preview and the Excel export.

## 5. Naming rules (strict)

1. **One exported function or component per file.** The export name is the camelCase/PascalCase of the file name plus its role suffix.
2. **File stems are unique across the repo.** No two files share a name.
3. **English verbs and roles, Indonesian domain nouns** taken from the instrument: `create-penelitian.action.ts`, `list-dosen.query.ts`.
4. **Table codes appear in names** of anything tied to an official table: `3.A.2` → `3a2`, e.g. `table-3a2-penelitian.screen.tsx`, `table-3a2-penelitian.compiler.ts`.
5. **Feature folders have the same name on both sides:** `src/frontend/features/kriteria-3/` and `src/backend/features/kriteria-3/`.

| Role | File | Export |
|---|---|---|
| Screen | `<name>.screen.tsx` | `<Name>Screen` |
| Component | `<name>.component.tsx` | `<Name>` |
| Hook | `use-<name>.ts` | `use<Name>` |
| Server Action | `<verb>-<noun>.action.ts` | `<verb><Noun>Action` |
| Query | `<verb>-<noun>.query.ts` | `<verb><Noun>Query` |
| Route Handler | `<verb>-<noun>.handler.ts` | `<verb><Noun>Handler` |
| Zod schema | `<noun>.schema.ts` | `<noun>Schema` |
| Drizzle table | `<name>.table.ts` | `<name>Table` |
| Compiler | `table-<code>-<name>.compiler.ts` | `compileTable<CODE><Name>` |
| Validation rule | `v<nn>-<name>.rule.ts` | `ruleV<nn><Name>` |
| Helper | `<verb>-<noun>.ts` | `<verb><Noun>` |
| Types | `<noun>.type.ts` | types only (several allowed) |
| Test | `<source-file-stem>.test.ts` next to the source | — |

Exempt from rule 1: Next.js routing files in `app/`, `src/frontend/shared/components/ui/*` (shadcn), generated Better Auth schema, `drizzle/` migrations, test files, config files.

## 6. Commands

```bash
pnpm install                 # install dependencies
docker compose up -d db      # start PostgreSQL
pnpm db:migrate              # apply migrations
pnpm db:seed                 # seed reference data, users, demo data
pnpm dev                     # run the app at http://localhost:3000

pnpm lint                    # ESLint
pnpm typecheck               # tsc --noEmit
pnpm check:conventions       # single-export, unique-stem, import-boundary checks
pnpm test                    # Vitest (unit + integration)
pnpm test:e2e                # Playwright
pnpm verify                  # lint + typecheck + check:conventions + test  ← must pass before every commit

pnpm db:generate             # generate a migration after changing a *.table.ts
pnpm db:reset                # drop, migrate, seed (local only)
```

Demo accounts after seeding (password for all: `Lkps#2026demo`):

| Email | Role |
|---|---|
| `admin.sistem@lkps.local` | Admin Sistem |
| `kaprodi@lkps.local` | Kaprodi (+ DTPR) |
| `admin.prodi@lkps.local` | Admin Prodi |
| `dtpr1@lkps.local` | DTPR (+ Dosen) |
| `dosen1@lkps.local` | Dosen |

## 7. Rules that are easy to get wrong

1. **Language:** UI text is Bahasa Indonesia. Code, comments, commits and docs are English. Instrument terms stay as written: DTPR, PkM, HKI, EWMP, TS-2/TS-1/TS, Link Bukti, UPPS, PS.
2. **Instrument-faithful:** table titles, column names and column order in previews and exports must match `docs/PRD.md` §8 exactly. Do not add "helpful" columns or totals the instrument does not have.
3. **No scoring:** never compute or display accreditation scores, predicted ratings, thresholds, targets or "Unggul" readiness. Indicator values are raw numbers only.
4. **Authorise on the server:** every action, query and handler calls `requireSessionUser()` and `canPerform()`. Hiding a button is not security.
5. **Every write goes through `withActor()`** so the audit trigger records who did it, and calls `assertPeriodOpen()` so locked periods stay read-only.
6. **Money** is stored as integer rupiah (`bigint`) and shown in Rp juta with 2 decimals.
7. **Years** are stored as `academic_year_id`. Never store "TS-1" in the database; TS labels are computed from the active period.
8. **Exports contain verified rows only.** Previews may show unverified rows, clearly marked.
9. **Assumptions marked `[CONFIRM]`** in the PRD are isolated in one function or one settings key each. Keep them isolated so they can change in one place.
10. **Do not invent data.** Seed and demo data use placeholders such as `[Nama Dosen 1]`.
11. **Library APIs change.** Before using Next.js, Better Auth, Drizzle, Tailwind or shadcn APIs, check the docs for the version installed in `package.json`. Do not rely on memory.
12. **Secrets** live in `.env` (never committed). Keep `.env.example` current.

## 8. Git

- Branch per phase: `phase/NN-short-name`.
- Commit message: `phase NN: <imperative summary>` (for example `phase 08: add EWMP work screen and compiler`).
- Small commits are fine; every commit must pass `pnpm verify`.
- Never commit `.env`, uploads, database dumps or `node_modules`.

## 9. Definition of done (every phase)

- [ ] All files listed in the phase exist, named per section 5.
- [ ] `pnpm verify` passes.
- [ ] The phase's acceptance checklist is fully ticked, or each unticked item has a written reason.
- [ ] New behaviour has tests as listed in the phase.
- [ ] UI matches `docs/DESIGN.md` (tokens, components, copy) and is keyboard-usable.
- [ ] `docs/phase/README.md` status and phase log are updated.
- [ ] No TODOs left without an entry in the phase log.

## 10. When to stop and ask the user

- A requirement in the PRD is ambiguous or contradicts the instrument.
- A `[CONFIRM]` assumption blocks a decision that cannot be isolated.
- You need a new dependency not listed in `docs/TRD.md` §2.
- A migration would drop or rewrite existing data.
- A phase cannot meet its acceptance checklist without changing an earlier phase's behaviour.

## 11. Glossary

| Term | Meaning |
|---|---|
| LKPS | Laporan Kinerja Program Studi, the quantitative accreditation report |
| LAM INFOKOM | The accreditation body whose instrument defines the 31 tables |
| TS | Tahun Sekarang, the academic year of the active period; TS-1, TS-2, TS-3 are the years before it |
| UPPS | Unit Pengelola Program Studi (here: the faculty, FBTI) |
| PS / Prodi | Program Studi |
| DTPR | Dosen Tetap Penghitung Rasio, permanent lecturers counted in ratios |
| PkM | Pengabdian kepada Masyarakat (community service) |
| HKI | Hak Kekayaan Intelektual (intellectual property) |
| EWMP | Ekuivalen Waktu Mengajar Penuh, lecturer workload in SKS |
| PL / CPL / CPMK | Profil Lulusan / Capaian Pembelajaran Lulusan / Capaian Pembelajaran Mata Kuliah |
| Link Bukti | Evidence link column in the official tables |
| Period | One LKPS cycle for one prodi, anchored on a TS academic year |
| Entry | One row a user creates (a research project, a publication) with a workflow status |
| Official table | A read-only table compiled by the system in the instrument's layout |
