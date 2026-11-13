# Sistem Informasi LKPS

A web application for Program Studi Sistem Informasi (Fakultas Biosains, Teknologi, dan Inovasi, Universitas Katolik Indonesia Atma Jaya) to collect, verify and export the data for its Laporan Kinerja Program Studi (LKPS), following the LAM INFOKOM "Instrumen APS 2.1 Program Sarjana" (31 official tables in 6 criteria).

See `CLAUDE.md` for the full operating manual and `docs/` for the product requirements (`PRD.md`), technical requirements (`TRD.md`), design system (`DESIGN.md`) and phase-by-phase work order (`docs/phase/`).

## Prerequisites

- Node.js 22 or newer
- pnpm
- PostgreSQL 17 (via `docker compose up -d db`, or a native install — see `.env.example`)

## Commands

```bash
pnpm install                 # install dependencies
docker compose up -d db      # start PostgreSQL (or point DATABASE_URL at a native install)
pnpm db:migrate              # apply migrations
pnpm db:seed                 # seed reference data, users, demo data
pnpm dev                     # run the app at http://localhost:3000

pnpm lint                    # ESLint
pnpm typecheck               # tsc --noEmit
pnpm check:conventions       # single-export, unique-stem, import-boundary, routing-file checks
pnpm test                    # Vitest (unit + integration)
pnpm test:e2e                # Playwright
pnpm verify                  # lint + typecheck + check:conventions + test  ← must pass before every commit

pnpm db:generate             # generate a migration after changing a *.table.ts
pnpm db:reset                # drop, migrate, seed (local only)
```

Copy `.env.example` to `.env` and fill in `BETTER_AUTH_SECRET` before running the app.
