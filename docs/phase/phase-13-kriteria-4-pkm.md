# Phase 13 — Kriteria 4: Relevansi PkM

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S4 | 12 | FR-08, §8.27–§8.31, V-17a, V-17b, V-18, V-19 | §7.10, §7.7, §7.8, §15.4–§15.5 | §7.3, §7.5, §8 |

## Goal
Tables 4.A.1, 4.A.2, 4.C.1, 4.C.2 and 4.C.3 work end to end, reusing the Prasarana and Tridharma building blocks from Phase 12.

## Read first
PRD §8.27–§8.31 · TRD §7.10 · Phase 12 phase log (decisions about shared components).

## Out of scope
Any change to the shared Tridharma field group that alters Criterion 3 behaviour.

## Deliverables
- **Kriteria-4 feature:** every file in TRD §7.10 (6 screens, 4 forms, 8 actions, 8 queries, 4 schemas).
- **Compilers:** `table-4a1-sarana-pkm`, `table-4a2-pkm`, `table-4c1-kerjasama-pkm`, `table-4c2-diseminasi-pkm`, `table-4c3-hki-pkm`.
- **Rules:** no new files; confirm V-17a/b, V-18 and V-19 already cover `tridharma` kind `pkm`, `diseminasi` and `hki` kind `pkm` (extend their entity lists if needed).
- **Routing:** `/kriteria-4/sarana-pkm`, `/pkm`, `/kerjasama-pkm`, `/diseminasi-pkm`, `/hki-pkm`, `/pratinjau`; nav + tabs registered (DTPR sees pages 33–36).
- **Seed:** 2 PkM (one verified), 1 Diseminasi linked to the verified PkM, 1 Kerjasama PkM.

## Steps
1. **4.A.1** (`Table4A1SaranaPkmScreen`): `PrasaranaWorkPanel({ usage: 'pkm' })`; compiler through `compilePrasaranaTable` with the 4.A.1 header labels and notes (they differ slightly from 3.A.1; copy from PRD §8.27).
2. **4.A.2 PkM** (`tridharma`, kind `pkm`): `PkmForm` composes `TridharmaFormFields` with the labels "Judul PkM", "Jenis Hibah PkM", "Sumber Dana". Roadmap PkM uploader (`roadmap_pkm`). `LinkedOutputsPanel` shows "Diseminasi terkait" and "HKI terkait". Compiler through `compileTridharmaTable('pkm', labels)`; footer order per PRD §8.28: "Jumlah Dana", "Jumlah PkM", "Jumlah Jenis Hibah PKM".
3. **4.C.1 Kerjasama PkM** (`kerjasama`, kind `pkm`): same form fields as 3.C.1; compiler through `compileKerjasamaTable` with footers "Jumlah Dana" and "Jumlah Kerjasama" (number of rows; note the difference from 3.C.1's distinct-Mitra count).
4. **4.C.2 Diseminasi** (`diseminasi`, one year): PkM `OptionPicker` (required; DTPR users see only PkM they lead); owner = Ketua of the linked PkM, resolved on the server; Nama DTPR and Judul shown as `DerivedField`s; scope L/N/I; Tahun; Bentuk Diseminasi (internal). V-18. Compiler: "√" year cells and the five footer rows of PRD §8.30.
5. **4.C.3 HKI PkM** (`hki`, kind `pkm`): as 3.C.3 with optional "PkM terkait". Compiler through `compileHkiTable`.
6. `assertNoLinkedOutputs` covers PkM linked by Diseminasi or HKI.
7. **Pratinjau** for Criterion 4.

## Rules to honour
- A Diseminasi cannot exist without a PkM; if the PkM's Ketua changes, the owner of its Diseminasi rows follows (update inside `updatePkmAction`).
- Labels differ between Criterion 3 and 4 tables; pass them as parameters to the shared compiler bodies and copy them verbatim from PRD §8.
- Feature `kriteria-4` imports from `tridharma` and `prasarana`, never from `kriteria-3`.

## Tests
- Unit: four schemas.
- Golden: five compilers (4.C.2 with two disseminations of one PkM; 4.C.1 footer count).
- Integration: DTPR creates a Diseminasi only for own PkM; delete of a PkM with a Diseminasi is blocked; changing Ketua moves ownership of the Diseminasi.
- E2E (`kriteria-4.spec.ts`): DTPR adds a PkM and a Diseminasi, submits both; Kaprodi verifies; previews of 4.A.2 and 4.C.2 show them with the footers.

## Acceptance checklist
- [ ] Official tables match PRD §8.27–§8.31.
- [ ] No duplicated form or compiler logic between Criterion 3 and 4 (shared bodies used).
- [ ] Criterion 3 golden tests still pass unchanged.
- [ ] `pnpm verify` and the E2E spec pass.

## Verify
```bash
pnpm db:reset && pnpm verify && pnpm test:e2e -- kriteria-4
```
