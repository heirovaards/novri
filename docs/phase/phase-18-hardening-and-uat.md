# Phase 18 — Hardening & UAT Readiness

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S6 | 15, 17 | §12 (NFRs), §1.4 (success metrics), §15 (open items), FR-16 AC5 | §20 (security), §21 (deployment), §22 (testing) | §11 (accessibility), §12 (responsive), §10 (states) |

## Goal
The application is ready for User Acceptance Testing with the Kaprodi and the prodi team: complete end-to-end journeys, measured performance, accessibility and security checks, a backup routine, a UAT environment that starts with one command, and a UAT script.

## Read first
PRD §12, §1.4, §15 · TRD §20–§22 · DESIGN §10–§12 · all phase logs (collect every `[CONFIRM]` and deviation).

## Out of scope
New features. Production hosting decisions (OI-01); the deployment must only stay portable.

## Deliverables
- **E2E journeys** (`tests/e2e/journeys/`), each independent and starting from `pnpm db:reset`:
  1. `journey-01-setup.spec.ts`: Admin Sistem creates users; Kaprodi creates the period; Admin Prodi imports Dosen and Mahasiswa.
  2. `journey-02-identitas.spec.ts`: Identitas, Daftar PS, Tim Penyusun to verified.
  3. `journey-03-dtpr-cycle.spec.ts`: DTPR enters EWMP, Penelitian, Publikasi; return, fix, verify.
  4. `journey-04-prodi-tables.spec.ts`: Admin Prodi completes one table of each input type (E 1.A.2, Y 2.A.1, S 6, M 2.B.1, D 5.2).
  5. `journey-05-preview-export.spec.ts`: previews of all six criteria render; full export downloads.
  6. `journey-06-lock-reopen.spec.ts`: submit and lock, read-only, reopen.
  7. `journey-07-access-control.spec.ts`: each role attempts pages and API routes outside its permissions (expects redirect or 403).
- **Reference-volume seed:** `seedDemoData` accepts `--volume=reference` (50 Dosen, 1,000 Mahasiswa, 500 Penelitian/PkM, 500 Publikasi/HKI, 1,000 file rows pointing at one small stored file).
- **Performance report:** `docs/reports/performance.md` (measurements and method).
- **Accessibility report:** `docs/reports/accessibility.md`.
- **Security checklist:** `docs/reports/security-checklist.md` (each control in TRD §20.3 with evidence).
- **Ops:** `scripts/backup.sh`, `scripts/restore.sh`, `docker-compose.uat.yml` (app built in production mode + database + volume for files), `docs/RUNBOOK.md` (start, stop, seed, backup, restore, create first admin, rotate `BETTER_AUTH_SECRET`).
- **UAT kit:** `docs/UAT.md` (scenarios per role with expected results, mapped to FR IDs; sign-off table), `docs/CONFIRM-LIST.md` (A-01…A-09 and every `[CONFIRM]` from phase logs, each with the question to ask the Kaprodi and where it changes in code).
- **Error pages:** `app/not-found.tsx`, `app/error.tsx`, `app/(app)/error.tsx` rendering Bahasa Indonesia messages (re-exporting screens from `src/frontend/features/auth/screens/`: `not-found.screen.tsx`, `app-error.screen.tsx`).

## Steps
1. **Performance** at reference volume, production build: list pages < 1 s server time, criterion preview < 2 s, full export < 10 s, dashboard < 1 s. Use `EXPLAIN ANALYZE` on the slowest queries; add indexes through a new migration; record before/after in the report. No caching layer unless a target cannot be met otherwise (record the reason).
2. **Accessibility:** run `@axe-core/playwright` on every page in the page map (56) for the role that can open it; fix all serious and critical findings; manual keyboard pass on: login, an entry sheet with the evidence uploader, the matrix editor, the verification queue, the submit dialog. Confirm focus return on sheet/dialog close and visible focus rings. Status is never conveyed by colour alone.
3. **Security:** security headers in `next.config.ts` (CSP with nonce or strict static policy that still allows inline file preview from `/api/files`, `X-Frame-Options: DENY`, `Referrer-Policy`, `X-Content-Type-Options`); cookies `HttpOnly`, `SameSite=Lax`, `Secure` when `PUBLIC_BASE_URL` is https; login rate limit verified by test; upload limits enforced at the handler; every server action begins with `requireSessionUser` and a capability or ownership check (add `scripts/check-action-guards.ts` → `checkActionGuards` to `pnpm check:conventions`); audit tables have no update/delete grants for the app role (FR-16 AC5); `pnpm audit` has no high or critical findings.
4. **Robustness:** every list has loading (skeleton), empty and error states per DESIGN §10; server errors show the generic message with a reference id that is also written to the server log; unsaved-changes guard works on sheet close and route change.
5. **Responsive:** check 1280, 1024 and 768 px on the shell, a work screen, a preview and the dashboard (DESIGN §12).
6. **Backup:** `backup.sh` writes `pg_dump` (custom format) and a tar of `STORAGE_LOCAL_PATH` to `./backups/YYYY-MM-DD/`, prunes folders older than 14 days; `restore.sh <date>` restores both. Test the round trip.
7. **UAT environment:** `docker compose -f docker-compose.uat.yml up -d` runs migrations, applies audit triggers and seeds organisation, years, reference lists and one Admin Sistem from env variables (no demo data unless `SEED_DEMO=true`).
8. **Documentation pass:** update `CLAUDE.md` and the three main documents where implementation deviated (each deviation already recorded in a phase log); bump document versions and Version History; make sure PRD §16 traceability and `docs/phase/README.md` statuses are final.

## Rules to honour
- No scope creep: defects found here are fixed; ideas go to `docs/BACKLOG.md`.
- Demo data stays placeholder-only; never commit real names, NIDN or student data.
- Do not weaken a rule or a test to make a journey pass.

## Tests
All suites green: `pnpm verify`, the full Playwright suite (phase specs + journeys), the axe run, and the lock-awareness and compiler-coverage tests.

## Acceptance checklist
- [ ] PRD §12 NFRs each have evidence in a report.
- [ ] PRD §1.4 success metrics can be demonstrated with the UAT script.
- [ ] Seven journeys pass from a clean database.
- [ ] Backup and restore round trip verified.
- [ ] `docs/UAT.md` and `docs/CONFIRM-LIST.md` are ready to hand to Novriani and the Kaprodi.
- [ ] `docs/phase/README.md` shows all 19 phases Done.

## Verify
```bash
pnpm db:reset && pnpm verify && pnpm build && pnpm test:e2e
docker compose -f docker-compose.uat.yml up -d --build
```

## Handoff
Final phase log: open defects (if any) with severity, the list of `[CONFIRM]` items still unanswered, and the state of OI-01 to OI-06.
