# Phase 05 — Evidence Repository

| Sprint | Depends on | PRD | TRD | DESIGN |
|---|---|---|---|---|
| S1 | 03 | FR-10, V-21, D-05, D-16 | §7.14, §7.3 (attachments), §16, §6 (file routes) | §6.2, §7.9 (Pustaka Bukti) |

## Goal
Files can be uploaded, de-duplicated, stored privately, downloaded with authorisation, browsed in a library, and attached at period level. The uploader component is ready for entry forms.

## Read first
PRD FR-10 · TRD §16 · DESIGN §6.2.

## Out of scope
Linking files to entries from real forms (starts in Phase 07 through `saveEntry`, built in Phase 06). Export of evidence (Phase 16).

## Deliverables
- **Storage:** `storage-adapter.type.ts`, `create-local-disk-adapter.ts`, `get-storage.ts`.
- **Evidence backend:** every file in TRD §7.14 (2 handlers, `delete-unlinked-file.action.ts`, 2 queries, 6 lib files).
- **Rule:** `v21-file-type-and-size.rule.ts` → `ruleV21FileTypeAndSize` (used by the upload handler).
- **Period attachments:** `save-period-attachment.action.ts`, `remove-period-attachment.action.ts`, `get-period-attachment.query.ts`; frontend `period-attachment-uploader.component.tsx`.
- **Frontend:** `evidence-library.screen.tsx`, `evidence-picker-dialog.component.tsx`; shared `evidence-uploader.component.tsx`; hook `use-file-upload.ts`.
- **Routing:** `/bukti`; `app/api/files/route.ts`, `app/api/files/[fileId]/route.ts`; nav + routes registered.

## Steps
1. Local-disk adapter rooted at `STORAGE_LOCAL_PATH` (create directories as needed; reject keys containing `..`).
2. Upload handler per TRD §16.2: size limit, content sniffing with `file-type`, V-21, sha256 de-duplication per prodi, storage key `{prodiId}/{yyyy}/{mm}/{uuid}.{ext}`, insert `file`. Response `{ fileId, name, size, mime, reused }`.
3. Download handler per TRD §16.3 with `assertFileReadable`. Until entry access exists (Phase 06), "can read a linked entry" is implemented through a small function `canReadLinkedEntity(user, entityType, entityId)` inside `assert-file-readable.ts` that currently allows Kaprodi/Admin Prodi and the uploader; Phase 06 completes it with ownership.
4. `syncEntryEvidence(tx, { entityType, entityId, slot, fileIds })`: validates that every file belongs to the prodi; inserts missing links; removes links not listed.
5. Period attachments: one file per `(period, kind)`; saving replaces the previous link; requires an open period (`assertPeriodOpen`) and `entries.manage_all`.
6. `useFileUpload`: uploads with progress via `fetch`/XHR to `/api/files`, returns `{ fileId, name, size }`, surfaces 413/415 messages from DESIGN §9.3.
7. `EvidenceUploader` per DESIGN §6.2: props `value: FileRef[]`, `onChange`, `required`, `label`, `readOnly`; states empty/uploading/filled/error; "Pilih dari pustaka bukti" opens `EvidencePickerDialog` (search by name; own uploads for DTPR/Dosen, all for Kaprodi/Admin Prodi).
8. Library screen per DESIGN §7.9: columns, "Tidak tertaut" filter, delete for unlinked files (uploader, Admin Prodi, Kaprodi). "Tertaut" counts links in `evidence_link` plus `period_attachment`.

## Rules to honour
- Never trust the client's MIME type or extension.
- Files are never served from a public folder.
- Unlinking never deletes the file; only `deleteUnlinkedFileAction` deletes, and only when no link and no period attachment exists.
- `Content-Disposition` uses the original name, safely encoded.

## Tests
- Unit: `detectFileType` on real PDF/JPG/PNG bytes and on a renamed `.exe`; `buildStorageKey` shape; V-21.
- Integration: upload → row + file on disk; same bytes again → `reused: true`, one stored file; 6 MB rejected (413); text file renamed `.pdf` rejected (415); download as uploader OK, as another DTPR 403; `syncEntryEvidence` add/remove; delete refused while linked.
- E2E (`evidence.spec.ts`): Admin Prodi uploads a PDF in the library, sees it "Tidak tertaut", deletes it.

## Acceptance checklist
- [ ] FR-10 AC3, AC4, AC7 (period attachments API), AC8, AC9, AC10 pass.
- [ ] `EvidenceUploader` covers all states in DESIGN §6.2 and is keyboard-operable.
- [ ] Uploaded files land under `STORAGE_LOCAL_PATH`, which is git-ignored.
- [ ] `pnpm verify` and the E2E spec pass.

## Verify
```bash
pnpm verify && pnpm test:e2e -- evidence
```
