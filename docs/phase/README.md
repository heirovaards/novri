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
| 00 | [Project setup](./phase-00-project-setup.md) | S1 | — | todo |
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
