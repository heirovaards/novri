# Phase 12 — Kriteria 3: Relevansi Penelitian

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S4 | 08 | FR-08, FR-09 AC6, §8.21–§8.26, §7.2 rule 4, V-17a, V-17b, V-18, V-19, V-20, V-22, A-04 | §7.7, §7.8, §7.9, §14.3, §15.3–§15.5 | §7.3, §7.5, §8 |

## Goal
Prasarana (shared), Tables 3.A.1, 3.A.2, 3.A.3, 3.C.1, 3.C.2 and 3.C.3 work end to end, including DTPR self-service entry and the links between research and its outputs. The shared Tridharma building blocks are ready for Criterion 4.

## Read first
PRD §8.21–§8.26, §3.3 (table ownership), §7.2 rule 4 · TRD §7.7–§7.9, §15.3 · DESIGN §7.5, §8.

## Out of scope
PkM screens (Phase 13). Sarana Pendidikan screen (Phase 14).

## Deliverables
- **Prasarana feature:** every file in TRD §7.7.
- **Tridharma feature:** every file in TRD §7.8 (`searchPkmOptionsQuery` is written now and used in Phase 13).
- **Kriteria-3 feature:** every file in TRD §7.9 (7 screens, 5 forms, 10 actions, 10 queries, 5 schemas).
- **Rules:** `v17a-tridharma-structure`, `v17b-ketua-is-dtpr`, `v18-single-year-in-range`, `v19-duplicate-title`, `v20-pengembangan-no-repeat`.
- **Compilers:** `table-3a1-sarana-penelitian`, `table-3a2-penelitian`, `table-3a3-pengembangan-dtpr`, `table-3c1-kerjasama-penelitian`, `table-3c2-publikasi`, `table-3c3-hki-penelitian`; helpers `compile-prasarana-table`, `compile-tridharma-table`, `compile-kerjasama-table`, `compile-hki-table`.
- **Generic delete:** `deleteEntryAction` now calls `assertNoLinkedOutputs` for `tridharma` (PRD §7.2 rule 4).
- **Routing:** `/kriteria-3/sarana-penelitian`, `/penelitian`, `/pengembangan-dtpr`, `/kerjasama-penelitian`, `/publikasi`, `/hki-penelitian`, `/pratinjau`; nav + tabs registered (DTPR sees pages 26–30 only).
- **Seed:** 2 Prasarana (one used for Penelitian + Pendidikan), 5 Penelitian `[Judul Penelitian 1..5]` across Dosen 1–3 with mixed statuses, 2 Publikasi (one linked), 1 HKI, 1 Kerjasama, 1 Pengembangan DTPR.

## Steps
1. **Prasarana** (`prasarana`, anchor none): `PrasaranaWorkPanel({ usage })` renders the list + sheet; `PrasaranaForm` has the three usage checkboxes with the current page's usage pre-ticked. Editing from any of the three pages edits the same record. V-22 unique Nama. Un-ticking a usage removes the row from that table only. `compilePrasaranaTable(usage, titles, notes)` is the shared compiler body. 3.A.1 status: ≥ 1 verified Prasarana with "Penelitian", or Nihil.
2. **3.A.2 Penelitian** (`tridharma`, kind `penelitian`, owner = Ketua):
   - `TridharmaFormFields` (shared): Judul, Ketua (`PersonPicker`; fixed for DTPR users), Anggota Dosen (multi, excludes Ketua), Mahasiswa (multi), Jenis Hibah (`RefSelect`), Sumber (L/N/I), Durasi, `YearAmountGrid` (money, blank allowed per year), evidence.
   - `saveTridharmaChildren` replaces ketua/anggota/mahasiswa/dana rows in the transaction. A blank year is stored as no row; 0 is stored as 0.
   - `createPenelitianAction` / `updatePenelitianAction` follow the pattern in TRD §3.4. Changing the Ketua changes the owner (allowed only with `entries.manage_all`).
   - Page header has the Roadmap Penelitian `PeriodAttachmentUploader` (`roadmap_penelitian`, Kaprodi/Admin Prodi).
   - Sheet shows `LinkedOutputsPanel` (read-only "Publikasi terkait", "HKI terkait") via `listLinkedOutputsQuery`.
   - V-17a (errors), V-17b (warning), V-19 (warning).
3. **3.A.3 Pengembangan DTPR** (`pengembangan_dtpr`, one year): V-18, V-20.
4. **3.C.1 Kerjasama Penelitian** (`kerjasama`, kind `penelitian`, owner `dosen_or_prodi`): Mitra `OptionPicker` with "Tambah mitra baru" (inline dialog, `master.manage` only); Penanggung Jawab required and fixed for DTPR users, optional for Prodi; `saveKerjasamaDana`. V-17a's funding part applies (at least one year entered).
5. **3.C.2 Publikasi** (`publikasi`, one year): Jenis from `jenisPublikasiOptions` shown with full labels; optional "Penelitian terkait" (`OptionPicker` over `searchPenelitianOptionsQuery`; DTPR users see research where they are Ketua or Anggota); URL/DOI internal. V-18, V-19 `[A-04]`.
6. **3.C.3 HKI Penelitian** (`hki`, kind `penelitian`): as 3.C.2 with Jenis HKI `RefSelect`. V-18, V-19.
7. **Compilers** per PRD §8.21–§8.26:
   - 3.A.2 via `compileTridharmaTable('penelitian', labels)`: preamble "Roadmap", the query in TRD §15.3, footers "Jumlah Dana", "Jumlah Jenis Hibah", "Jumlah Penelitian", note L/N/I.
   - 3.A.3: derived row "Jumlah Dosen DTPR" per year from `dosen_year`, sub-header, one row per (Jenis, DTPR) with counts per year, the note verbatim.
   - 3.C.1 via `compileKerjasamaTable`; 3.C.2 with "√" year cells and footer "Jumlah Publikasi"; 3.C.3 via `compileHkiTable`.
8. **Ownership in lists:** DTPR users see only rows they own (`buildOwnershipFilter`); the add button creates rows owned by them; filters include "Pemilik" only for `entries.manage_all`.

## Rules to honour
- A Penelitian linked by a Publikasi or HKI cannot be deleted: "Entri ini masih ditautkan oleh n entri lain."
- A research item appears in Table 3.A.2 only when it has funding entered for at least one of TS-2..TS (inner join in the compiler).
- Jumlah Mahasiswa yang Terlibat is always the count of linked students.
- Shared field groups live in `tridharma`; `kriteria-3` must not be imported by `kriteria-4`.

## Tests
- Unit: five schemas; rules V-17a/b, V-18, V-19 (case and spacing insensitive), V-20.
- Golden: six compilers (3.A.2 with a blank year cell and a research item outside the period that must not appear; 3.A.3 with two years for one DTPR).
- Integration: DTPR creates Penelitian as Ketua → owner set; DTPR cannot open another DTPR's row; Admin Prodi creates on behalf of a DTPR (audit actor = Admin Prodi, owner = DTPR); delete blocked while linked; Prasarana ticked for two usages appears in both compiled tables.
- E2E (`kriteria-3.spec.ts`): DTPR adds a Penelitian with evidence and submits; adds a linked Publikasi; Kaprodi bulk-verifies both; previews of 3.A.2 and 3.C.2 show them; DTPR cannot open `/kriteria-3/pratinjau` (redirect to the forbidden page).

## Acceptance checklist
- [ ] FR-08 holds for the six tables; FR-09 AC6 passes.
- [ ] Official tables match PRD §8.21–§8.26.
- [ ] PRD §7.2 rule 4 is enforced in `deleteEntryAction`.
- [ ] DTPR navigation shows only their pages; D-18 holds (no preview or export for DTPR).
- [ ] `pnpm verify` and the E2E spec pass.

## Verify
```bash
pnpm db:reset && pnpm verify && pnpm test:e2e -- kriteria-3
```
