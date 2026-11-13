# Phase 10 — Kriteria 2 (b): Kurikulum

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S3 | 09 | FR-08 AC6 (type M), §8.14–§8.16, §7.2 rule 6, V-23 | §7.6 (2.B.1–2.B.3 files), §13.3, §15.5 | §6.3 (MatrixGrid), §7.4 (matrix screens) |

## Goal
The three curriculum mapping tables (2.B.1, 2.B.2, 2.B.3) can be edited cell by cell, submitted as one "Pemetaan Kurikulum" record, verified and previewed.

## Read first
PRD §8.14–§8.16 and the rules paragraph under §8.16, §7.2 rule 6 · TRD §7.6, §13.3 · DESIGN §6.3, §7.4.

## Out of scope
Editing Mata Kuliah / PL / CPL / CPMK themselves (master data, Phase 04).

## Deliverables
- **Screens:** `table-2b1-isi-pembelajaran`, `table-2b2-pemetaan-cpl-pl`, `table-2b3-peta-pemenuhan-cpl`.
- **Components:** `isi-pembelajaran-matrix`, `cpl-profil-lulusan-matrix`, `peta-pemenuhan-cpl-editor`, `kurikulum-pemetaan-bar`; shared `matrix-grid`.
- **Actions:** `toggle-mk-profil-lulusan`, `toggle-cpl-profil-lulusan`, `set-cpmk-mata-kuliah`, `submit-kurikulum-pemetaan`.
- **Queries:** `get-isi-pembelajaran-matrix`, `get-cpl-profil-lulusan-matrix`, `get-peta-pemenuhan-cpl`, `get-kurikulum-pemetaan`.
- **Lib:** `touch-kurikulum-pemetaan`, `assert-mata-kuliah-pengampu`.
- **Schemas:** `mk-profil-lulusan-toggle`, `cpl-profil-lulusan-toggle`, `cpmk-mata-kuliah`.
- **Rule:** `v23-kurikulum-coverage`.
- **Compilers:** `table-2b1-isi-pembelajaran`, `table-2b2-pemetaan-cpl-pl`, `table-2b3-peta-pemenuhan-cpl`.
- **Routing:** `/kriteria-2/isi-pembelajaran`, `/pemetaan-cpl-pl`, `/peta-pemenuhan-cpl`; nav + tabs registered (Dosen sees only 2.B.1 and 2.B.3).
- **Seed:** mappings for the demo courses, leaving one Mata Kuliah unmapped (to show V-23).

## Steps
1. **Workflow record:** `touchKurikulumPemetaan(tx, user)` gets or creates the period's `kurikulum_pemetaan` row and applies PRD §7.2 rule 6 (returned → draft; draft stays; submitted/verified → submitted, or stays verified for Kaprodi). Every cell action calls `assertPeriodOpen`, then the permission check, then the change, then `touchKurikulumPemetaan`, all in one `withActor` transaction.
2. **Permissions:** users with `entries.manage_all` may change any cell. Users with only `curriculum.edit_own` may change cells in rows of courses where they are pengampu (`assertMataKuliahPengampu`); 2.B.2 is read-only for them and its tab is hidden.
3. **`MatrixGrid`** (DESIGN §6.3): sticky first column and header, checkbox cells with accessible names ("<Mata Kuliah> – <PL>"), arrow-key navigation, optimistic toggle with rollback and a toast on failure, disabled cells for rows the user may not edit, read-only when the period is locked.
4. **2.B.1:** rows = active Mata Kuliah ordered by Semester then Kode; columns = active PL ordered by Kode.
5. **2.B.2:** rows = active CPL; columns = active PL.
6. **2.B.3:** accordion per CPL; per CPMK a multi-pick of Mata Kuliah (`setCpmkMataKuliahAction` replaces the set for one CPMK; a Dosen may add or remove only own courses, other courses in the set are preserved).
7. **`KurikulumPemetaanBar`** on all three screens: status badge, last change, V-23 warning counts, return note if any, and "Ajukan Pemetaan" (`entries.manage_all` only). `submitKurikulumPemetaanAction` runs V-23 (three warning kinds, each needs a note), then `transitionEntryStatus` (Kaprodi → verified).
8. **Verification queue:** the record appears with summary "Pemetaan Kurikulum · n MK · n CPL · n CPMK"; the detail panel shows the three counts and the unmapped items.
9. **Compilers:** per PRD §8.14–§8.16. 2.B.1 and 2.B.2 have dynamic PL columns; 2.B.3 has Semester 1..n columns (n = max(8, highest semester)), the CPL cell merged over its CPMK rows, course Kode comma-separated. All three share the status of the one record. Preview shows mappings only when the record is submitted or verified; export only when verified.

## Rules to honour
- A mapping change on a verified set by a non-Kaprodi user sends the set back to "Diajukan" and removes the three tables from export until re-verified. Show this once per session as a confirmation before the first change.
- Archived master rows are excluded from matrices and compilers; their mapping rows remain in the database.
- No per-cell audit noise beyond the trigger rows; the submit, verify and return events are logged as app events.

## Tests
- Unit: V-23 (each of the three kinds; none).
- Golden: three compilers (dynamic columns; merged CPL cells; empty mapping).
- Integration: Dosen toggles own course → allowed; other course → `FORBIDDEN`; toggling on a verified set as Admin Prodi → `submitted`; as Kaprodi → stays `verified`; locked period → `PERIOD_LOCKED`.
- E2E (`kriteria-2-kurikulum.spec.ts`): Dosen maps own course in 2.B.1; Admin Prodi completes 2.B.2 and submits with a V-23 note; Kaprodi verifies; preview shows "√" cells.

## Acceptance checklist
- [ ] FR-08 AC6 passes.
- [ ] PRD §7.2 rule 6 is implemented in exactly one function.
- [ ] Official tables match PRD §8.14–§8.16.
- [ ] Matrices are fully usable by keyboard.
- [ ] `pnpm verify` and the E2E spec pass.

## Verify
```bash
pnpm db:reset && pnpm verify && pnpm test:e2e -- kriteria-2-kurikulum
```
