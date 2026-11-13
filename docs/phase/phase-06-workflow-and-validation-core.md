# Phase 06 — Workflow & Validation Core

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S1 | 04, 05 | FR-09, FR-11, FR-08 AC10–AC12, §4.5–§4.7, §7, D-11, D-12, D-19 | §3.4, §7.13, §7.19 (`lkps/registry`, `lkps/workflow`, `lkps/validation`), §11, §13, §14 | §6.1, §6.3, §7.3, §7.8 |

## Goal
The generic machinery every table uses: entity registry, `saveEntry`, status transitions, ownership, the validation engine with the cross-cutting rules, table status, Nihil, the verification queue, and the shared work-screen components.

## Read first
PRD §7 (workflow rules), §4.5–§4.7, FR-09, FR-11 · TRD §3.4, §11, §13, §14 · DESIGN §6.3, §7.3, §7.8.

## Out of scope
Any concrete table screen (Phases 07–14). Compilers (Phase 07). Dashboard.

## Deliverables
- **Registry:** `lkps-table-registry.ts` (all 31 tables with code, criterion, exact title from PRD §8, input type, entity type + filter, evidence mode, route), `get-table-definition.ts`, `parse-table-code.ts`.
- **Workflow:** every file under `lkps/workflow/` in TRD §7.19, with `entity-registry.ts` complete for all 25 entities (TRD §11 table).
- **Auth:** `src/backend/auth/assert-entry-access.ts`; complete `assert-file-readable.ts` with ownership.
- **Validation engine:** `rule.type.ts`, `rule-registry.ts`, `run-entry-rules.ts`, `run-table-rules.ts`.
- **Rules:** `v01-required-fields`, `v02-evidence-required`, `v03-year-in-period-range`, `v22-unique-within-table` (TRD §14.3).
- **Verification feature:** every file in TRD §7.13.
- **Period:** `set-table-nihil.action.ts`, `get-table-status.query.ts`, `table-nihil.schema.ts`; frontend `nihil-toggle.component.tsx`.
- **Schemas common:** `entry-intent.schema.ts`, `year-values.schema.ts`, `require-on-submit.ts`.
- **Frontend shared:** layout `criterion-tabs`; lkps `table-work-header`, `entry-form-footer`, `entry-row-actions`, `entry-count-footer`, `validation-summary`, `return-note-alert`, `derived-field`, `year-card-list`; form `money-input`, `year-amount-grid`, `year-select`; overlay `return-dialog`; hook `use-unsaved-changes-guard`.
- **Routing:** `/verifikasi`; nav + routes registered.

## Steps
1. `entityRegistry`: one config per entity (table, `ownerMode`, `anchor`, `yearRange`, `evidenceSlots`, `tableCodes`, `childTables`, `summary`, `routeFor`). `summary` examples: tridharma → "<judul> · Ketua: <nama>"; ewmp → "EWMP <nama> · TS"; mhs_data → "Data Mahasiswa <tahun>".
2. `transitionEntryStatus` implementing PRD §7.1 as a table-driven function; illegal moves throw `CONFLICT`. `resolveSubmitStatus` per D-12.
3. `assertEntryAccess` per TRD §13.3; the same rule as a reusable SQL condition builder for list queries (`build-ownership-filter.ts` → `buildOwnershipFilter`, add it to `lkps/workflow/`).
4. `saveEntry` per TRD §3.4 (eight steps). Details:
   - update requires `rowVersion`; mismatch → `CONFLICT` with the DESIGN §9.3 message;
   - `intent: 'draft'` on a `submitted`/`verified` row is rejected (PRD §7.2 rule 1);
   - editing a `verified` row with `intent: 'submit'` as non-Kaprodi → `submitted`, clears `verified_*`;
   - if the target table is flagged Nihil, clear the flag and log `nihil_clear`;
   - returns `{ id, status, rowVersion, violations }`.
5. Rule engine: `ruleRegistry` array; `runEntryRules` loads evidence and settings into the context once. Rules V-01 (reads each entity's required-field list from a `requiredOnSubmit` array added to `EntityConfig`), V-02 (required slots from `evidenceSlots`), V-03 (by `anchor`/`yearRange`), V-22 (entities and keys in TRD §14.3).
6. Generic actions (TRD §13.4): `submitEntryAction`, `verifyEntriesAction` (atomic), `returnEntryAction` (note ≥ 10), `deleteEntryAction` (permissions PRD §7.1; soft delete; removes evidence links), `checkTableEntriesAction` ("Periksa Semua": returns violations per entry). Each logs the matching app event.
7. `computeTableStatus` / `computeAllTableStatuses` per PRD §4.6 and TRD §13.5; `getTableStatusQuery`.
8. Nihil: `setTableNihilAction({ tableCode, isNihil, note })`; only E and D tables; refuses to set Nihil when live entries exist ("Hapus atau pindahkan entri terlebih dahulu."); logs `nihil_set` / `nihil_clear`.
9. Verification queue: `listVerificationQueueQuery` unions `submitted` rows across all entities using the registry (table code, summary, owner name, submitted time, warning count from `warning_notes`); filters and pagination; `getVerificationDetailQuery` returns labelled fields, evidence and history. Screen per DESIGN §7.8.
10. Shared components per DESIGN §6.1, §6.3, §7.3. `EntryFormFooter` implements every variation (status, Kaprodi, read-only). `TableWorkHeader` takes the table code and renders title, status, Pratinjau link (when `preview.view`), the "⋯" menu (Periksa Semua, Tandai/Batalkan Nihil) and the add button.
11. `useActionForm` (from Phase 02) gains violations handling and the warning-notes round trip.

## Rules to honour
- `transitionEntryStatus` is the only code that writes status fields.
- All of this runs inside one `withActor` transaction per action.
- No entity-specific `if` branches in generic code; behaviour comes from `EntityConfig`.
- Kaprodi's submit always results in `verified` with `self_verified = true`.

## Tests
- Unit: transition table (every legal and illegal pair); `resolveSubmitStatus`; `parseTableCode`; registry completeness (31 table codes; 25 entities; every table's entity exists).
- Integration (use `pimpinan_unit`, `ewmp` and `dana` rows directly through `saveEntry`):
  create draft → update → submit; submit with a missing required field → `VALIDATION_FAILED` and nothing saved; evidence-required entity without file → V-02; warning without note → `WARNING_NOTE_REQUIRED` (use a temporary test-only warning rule); stale `rowVersion` → `CONFLICT`; DTPR creating an `ewmp` for another Dosen → `FORBIDDEN`; DTPR list filter returns only own rows; Kaprodi submit → `verified` + `self_verified`; edit verified as Admin Prodi → `submitted`; verify many atomically (one stale → none changed); return requires note; delete permissions; Nihil set/clear and auto-clear on new entry; table status for each of the four statuses; locked/no period → `PERIOD_LOCKED` / `NO_ACTIVE_PERIOD`.
- Component tests for `EntryFormFooter` variations and `ValidationSummary`.

## Acceptance checklist
- [ ] PRD §7.1 state machine fully implemented and tested.
- [ ] FR-09 AC1–AC6 pass at the action/query level (the queue screen works with rows inserted by tests or seed).
- [ ] FR-11 AC1, AC2, AC4 pass at engine level.
- [ ] FR-08 AC10 (Nihil) passes at action level.
- [ ] `entity-registry.ts` and `lkps-table-registry.ts` are complete (25 / 31) and covered by the completeness test.
- [ ] All shared components listed exist with the behaviour in DESIGN.
- [ ] `pnpm verify` passes.

## Verify
```bash
pnpm db:reset && pnpm verify
```

## Handoff
Phase log: list the `requiredOnSubmit` field names per entity (later phases reuse them in schemas) and any registry decisions that were not obvious.
