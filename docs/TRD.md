# TRD — Sistem Informasi LKPS

**Companion to:** `PRD.md` v1.0 (FR, V, D, A IDs refer to it) and `DESIGN.md` v1.0
**Status:** Baseline for build

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | 2026-11-08 | Satriya Wardhana | First draft |
| 0.2 | 2026-11-08 | Satriya Wardhana | One file per page and per function; page map and function inventory |
| 1.0 | 2026-11-13 | Satriya Wardhana | Split into `src/frontend` / `src/backend` / `src/shared` by feature; shadow revision removed; generic `saveEntry` workflow; year-value child tables; Nihil flags; merged Data Lulusan; full column-level data model; entity registry; assumption isolation map |

---

## 1. Scope

How the PRD is built: stack, architecture, folder and file names, page map, per-feature file inventory for frontend and backend, data model, workflow, validation, compilers, evidence, import, export, audit, security, deployment and testing. Visual design is in `DESIGN.md`. Work order is in `docs/phase/`.

---

## 2. Stack & Decisions

| # | Area | Choice | Notes |
|---|---|---|---|
| T1 | Architecture | One Next.js app (modular monolith), code split into `src/frontend`, `src/backend`, `src/shared` | D-09 |
| T2 | Framework | Next.js (App Router) + React + TypeScript `strict` | Use the latest stable major at setup (16.x at the time of writing) and pin exact versions |
| T3 | Database | PostgreSQL 17 | |
| T4 | ORM | Drizzle ORM + drizzle-kit (SQL migrations committed in `drizzle/`), driver `pg` | Use the `latest` stable npm tag, not beta tags |
| T5 | Auth | Better Auth: email/password, database sessions, Drizzle adapter, admin plugin, `nextCookies` plugin | D-10 |
| T6 | UI | Tailwind CSS v4, shadcn/ui, lucide-react, TanStack Table, Sonner | |
| T7 | Forms | React Hook Form + Zod (`@hookform/resolvers`) | One Zod schema per entity in `src/shared/schemas`, used by client and server |
| T8 | Excel | ExcelJS (read for import, write for export) | |
| T9 | ZIP | archiver | Evidence ZIP export |
| T10 | File type detection | file-type | Content-based (V-21) |
| T11 | Storage | `StorageAdapter` interface; local-disk adapter in MVP | S3-compatible adapter added when hosting is decided (OI-01) |
| T12 | Audit | PostgreSQL trigger on every business table + app-level events | |
| T13 | Mutations | Server Actions for forms; Route Handlers for upload, download, import preview, export | |
| T14 | Tests | Vitest (unit, integration against a test database), Playwright (end-to-end) | |
| T15 | Tooling | pnpm, ESLint (+ `eslint-plugin-unicorn` filename-case), Prettier, tsx for scripts | |
| T16 | Runtime | Node.js LTS (22 or newer), Docker Compose (db, app, backup) | |
| T17 | Code layout | One exported function or component per file; unique file stems; feature folders mirrored on both sides | D-08 |

**Adding any other runtime dependency requires the user's approval** (`CLAUDE.md` §10).

**Version note for agents:** before using an API from Next.js, Better Auth, Drizzle, Tailwind or shadcn, read the documentation for the version in `package.json`. Known points to verify at setup: request `params`/`searchParams` are asynchronous in current Next.js; Better Auth's `nextCookies()` must be the last plugin; the Better Auth schema is generated with its CLI and re-generated after plugin changes.

---

## 3. Architecture

### 3.1 Layers

```
Browser
  │
  ▼
app/                         ROUTING ONLY
  page.tsx      → re-exports one Screen
  route.ts      → re-exports one Handler
  layout.tsx    → renders AppShell
  │
  ├──────────────► src/frontend/                 RENDERING
  │                  features/<feature>/screens      Server Components: fetch via queries, compose UI
  │                  features/<feature>/components   Client/Server components: forms, panels
  │                  shared/components               layout, lkps, form, data, overlay, ui (shadcn)
  │                  shared/hooks, shared/navigation
  │                         │ calls
  │                         ▼
  └──────────────► src/backend/                  DATA & RULES
                     features/<feature>/actions      Server Actions (writes)
                     features/<feature>/queries      reads
                     features/<feature>/handlers     Route Handlers
                     features/<feature>/lib          helpers private to the backend
                     lkps/                           registry, workflow, validation, compilers, render
                     auth/  db/  storage/  shared/
                            │
                            ▼
                     PostgreSQL · file volume

src/shared/                   CONTRACTS used by both sides
  schemas/<feature>/          Zod input schemas
  types/                      ActionResult, SessionUser, TableModel, …
  permissions/                permission matrix, canPerform
  constants/  format/
```

### 3.2 Import boundaries (enforced)

| From | May import | Must never import |
|---|---|---|
| `app/**` | `src/frontend/**/screens/*`, `src/frontend/shared/components/layout/*`, `src/backend/**/handlers/*` | anything else |
| `src/frontend/**` | `src/shared/**`; `src/backend/**/actions/*.action`; `src/backend/**/queries/*.query` (only from `*.screen.tsx` files) | `src/backend/db/**`, `src/backend/lkps/**`, `src/backend/**/lib/**`, `src/backend/auth/**`, `src/backend/storage/**` |
| `src/backend/**` | `src/shared/**` | `src/frontend/**` |
| `src/shared/**` | external packages | `src/frontend/**`, `src/backend/**` |

One documented exception: `*.screen.tsx` files and `app/(app)/layout.tsx` may import `requireSessionUser` and `requireCapability` from `src/backend/auth/` to gate a page.

Path aliases (`tsconfig.json`): `@frontend/*` → `src/frontend/*`, `@backend/*` → `src/backend/*`, `@shared/*` → `src/shared/*`.

### 3.3 Read flow

```tsx
// app/(app)/kriteria-3/penelitian/page.tsx — routing only
export const metadata = { title: 'Tabel 3.A.2 Penelitian DTPR · LKPS' };
export { Table3A2PenelitianScreen as default } from '@frontend/features/kriteria-3/screens/table-3a2-penelitian.screen';
```

```tsx
// src/frontend/features/kriteria-3/screens/table-3a2-penelitian.screen.tsx — Server Component
export async function Table3A2PenelitianScreen({ searchParams }: ScreenProps) {
  const user = await requireSessionUser();
  const filters = parseListFilters(await searchParams);
  const [period, rows, tableStatus] = await Promise.all([
    getActivePeriodQuery(),
    listPenelitianQuery(filters),           // applies ownership for DTPR on the server
    getTableStatusQuery('3.A.2'),
  ]);
  return (/* PageHeader + CriterionTabs + FilterBar + DataTable + EntitySheet(PenelitianForm) */);
}
```

Every query starts with `requireSessionUser()` and a `canPerform()` check, and filters by `prodi_id` and (where relevant) ownership. Queries never trust arguments for authorisation.

### 3.4 Write flow

Every create/update action for an entry is thin: parse, map, call the generic `saveEntry`.

```ts
// src/backend/features/kriteria-3/actions/create-penelitian.action.ts
'use server';

export async function createPenelitianAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  return runAction(async () => {
    const user = await requireSessionUser();
    const data = penelitianSchema.parse(input);          // @shared/schemas/kriteria-3/penelitian.schema
    return saveEntry({
      user,
      entityType: 'tridharma',
      intent: data.intent,                                // 'draft' | 'submit'
      ownerDosenId: data.ketuaDosenId,
      values: { kind: 'penelitian', judul: data.judul, jenisHibah: data.jenisHibah,
                sumberLingkup: data.sumberLingkup, durasiTahun: data.durasiTahun },
      children: (tx, id) => saveTridharmaChildren(tx, id, data),
      evidence: { bukti: data.buktiFileIds },
      warningNotes: data.warningNotes,
    });
  });
}
```

`saveEntry` (in `src/backend/lkps/workflow/save-entry.ts`) performs, in one transaction opened with `withActor(user.id)`:

1. `assertPeriodOpen(prodiId)`; returns the open period.
2. Authorise: `canPerform` for the entity's capability, then `assertEntryAccess` (ownership, §13.3).
3. Insert (status `draft`) or update. Updates check `row_version` (optimistic concurrency) and increment it.
4. Run the `children` callback (replace child rows).
5. `syncEntryEvidence` for each slot.
6. If `intent === 'submit'`: `runEntryRules`. Any error → roll back and return `VALIDATION_FAILED` with the violations. Any warning without a note → same, code `WARNING_NOTE_REQUIRED`. Otherwise set the status from `resolveSubmitStatus(user)` (`verified` for Kaprodi, else `submitted`).
7. If `intent === 'draft'`: rules run and are returned as `violations` in a successful result; status rules per PRD §7.
8. `revalidateTablePaths(entityType)`.

`runAction` (`src/backend/shared/run-action.ts`) converts thrown `DomainError`, `ZodError` and unexpected errors into an `ActionResult`.

```ts
// src/shared/types/action-result.type.ts
export type RuleViolation = { ruleId: string; severity: 'error' | 'warning'; message: string; field?: string };
export type ActionResult<T = void> =
  | { ok: true; data: T; violations?: RuleViolation[] }
  | { ok: false; code: ActionErrorCode; message: string; fieldErrors?: Record<string, string>; violations?: RuleViolation[] };
export type ActionErrorCode =
  | 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INVALID_INPUT' | 'VALIDATION_FAILED'
  | 'WARNING_NOTE_REQUIRED' | 'CONFLICT' | 'PERIOD_LOCKED' | 'NO_ACTIVE_PERIOD' | 'IN_USE' | 'UNEXPECTED';
```

### 3.5 Client form pattern

Each entity has one form component (`<entity>-form.component.tsx`, a Client Component) built with React Hook Form + the shared Zod schema. It uses `useActionForm` (`src/frontend/shared/hooks/use-action-form.ts`) which: calls the create or update action, maps `fieldErrors` onto fields, puts `violations` into `ValidationSummary`, shows a toast, and closes the sheet on success. Forms never fetch; the screen passes initial data and option lists as props.

### 3.6 Official tables: one model, two renderers

`compileTable(code, ctx)` returns a `TableModel` (§15). `OfficialTable` (frontend) renders it; `writeTableSheet` (backend) writes it to Excel. Preview and export cannot differ (FR-12 AC7).

---

## 4. Folder Structure

```
.
├─ CLAUDE.md  AGENTS.md  README.md
├─ docs/                               PRD.md, TRD.md, DESIGN.md, phase/
├─ app/                                ROUTING ONLY
│  ├─ layout.tsx  globals.css  not-found.tsx  error.tsx
│  ├─ (auth)/login/page.tsx
│  ├─ (app)/layout.tsx  (app)/loading.tsx  (app)/forbidden/page.tsx
│  ├─ (app)/<url segments>/page.tsx    one per page in §5
│  └─ api/<...>/route.ts               one per handler in §6
├─ src/
│  ├─ frontend/
│  │  ├─ features/<feature>/screens/   *.screen.tsx
│  │  ├─ features/<feature>/components/*.component.tsx
│  │  └─ shared/
│  │     ├─ components/{layout,lkps,form,data,overlay,ui}/
│  │     ├─ hooks/                     use-*.ts
│  │     └─ navigation/                nav-items.ts
│  ├─ backend/
│  │  ├─ features/<feature>/{actions,queries,handlers,lib}/
│  │  ├─ lkps/{registry,workflow,validation,compilers,render}/
│  │  ├─ auth/
│  │  ├─ db/{tables,columns,enums,seed,sql}/  client.ts  auth-schema.ts
│  │  ├─ storage/
│  │  └─ shared/                       run-action.ts, with-actor.ts, domain-error.ts, …
│  └─ shared/
│     ├─ schemas/<feature>/            *.schema.ts
│     ├─ types/                        *.type.ts
│     ├─ permissions/                  permission-matrix.ts, can-perform.ts
│     ├─ constants/                    app-routes.ts, status-labels.ts, …
│     └─ format/                       format-*.ts
├─ scripts/                            check-*.ts
├─ drizzle/                            generated SQL migrations
├─ tests/e2e/                          *.spec.ts (Playwright)
├─ docker/                             Dockerfile, backup.sh
├─ docker-compose.yml  drizzle.config.ts  next.config.ts  eslint.config.mjs
├─ vitest.config.ts  playwright.config.ts  tsconfig.json  package.json
└─ .env.example
```

Feature folders (same name under `src/frontend/features`, `src/backend/features`, `src/shared/schemas`):
`auth` · `dashboard` · `period` · `identitas` · `kriteria-1` · `kriteria-2` · `kriteria-3` · `kriteria-4` · `kriteria-5` · `kriteria-6` · `prasarana` · `tridharma` · `master` · `verification` · `evidence` · `import` · `export` · `settings` · `admin` · `audit` · `notifications`

A feature has only the sub-folders it needs. Naming rules are in `CLAUDE.md` §5. Unit and integration tests sit next to their source as `<stem>.test.ts`.

---

## 5. Page Map (56 pages)

Route file rule: URL `/a/b` → `app/(app)/a/b/page.tsx` (login → `app/(auth)/login/page.tsx`). Each `page.tsx` only sets `metadata` and re-exports the screen as default.

Screen path rule: `src/frontend/features/<feature>/screens/<file>`.

Access: **AS** Admin Sistem · **KP** Kaprodi · **AP** Admin Prodi · **DT** DTPR · **DS** Dosen. "own" = only the user's own rows.

| # | URL | Feature | Screen file | Component | Access |
|---|---|---|---|---|---|
| 1 | `/login` | auth | `login.screen.tsx` | `LoginScreen` | public |
| 2 | `/ganti-kata-sandi` | auth | `change-password.screen.tsx` | `ChangePasswordScreen` | all |
| 3 | `/dashboard` | dashboard | `dashboard.screen.tsx` | `DashboardScreen` | KP AP DT DS |
| 4 | `/identitas/pengusul` | identitas | `identitas-pengusul.screen.tsx` | `IdentitasPengusulScreen` | KP AP |
| 5 | `/identitas/tim-penyusun` | identitas | `tim-penyusun.screen.tsx` | `TimPenyusunScreen` | KP AP |
| 6 | `/kriteria-1/struktur-organisasi` | kriteria-1 | `gambar-1a-struktur-organisasi.screen.tsx` | `Gambar1AStrukturOrganisasiScreen` | KP AP |
| 7 | `/kriteria-1/pimpinan-unit` | kriteria-1 | `table-1a1-pimpinan-unit.screen.tsx` | `Table1A1PimpinanUnitScreen` | KP AP |
| 8 | `/kriteria-1/sumber-dana` | kriteria-1 | `table-1a2-sumber-dana.screen.tsx` | `Table1A2SumberDanaScreen` | KP AP |
| 9 | `/kriteria-1/penggunaan-dana` | kriteria-1 | `table-1a3-penggunaan-dana.screen.tsx` | `Table1A3PenggunaanDanaScreen` | KP AP |
| 10 | `/kriteria-1/ewmp` | kriteria-1 | `table-1a4-ewmp.screen.tsx` | `Table1A4EwmpScreen` | KP AP DT(own) |
| 11 | `/kriteria-1/kualifikasi-tendik` | kriteria-1 | `table-1a5-kualifikasi-tendik.screen.tsx` | `Table1A5KualifikasiTendikScreen` | KP AP |
| 12 | `/kriteria-1/unit-spmi` | kriteria-1 | `table-1b-unit-spmi.screen.tsx` | `Table1BUnitSpmiScreen` | KP AP |
| 13 | `/kriteria-1/pratinjau` | kriteria-1 | `kriteria-1-pratinjau.screen.tsx` | `Kriteria1PratinjauScreen` | KP AP |
| 14 | `/kriteria-2/data-mahasiswa` | kriteria-2 | `table-2a1-data-mahasiswa.screen.tsx` | `Table2A1DataMahasiswaScreen` | KP AP |
| 15 | `/kriteria-2/asal-mahasiswa` | kriteria-2 | `table-2a2-asal-mahasiswa.screen.tsx` | `Table2A2AsalMahasiswaScreen` | KP AP |
| 16 | `/kriteria-2/kondisi-mahasiswa` | kriteria-2 | `table-2a3-kondisi-mahasiswa.screen.tsx` | `Table2A3KondisiMahasiswaScreen` | KP AP |
| 17 | `/kriteria-2/isi-pembelajaran` | kriteria-2 | `table-2b1-isi-pembelajaran.screen.tsx` | `Table2B1IsiPembelajaranScreen` | KP AP DS(own courses) |
| 18 | `/kriteria-2/pemetaan-cpl-pl` | kriteria-2 | `table-2b2-pemetaan-cpl-pl.screen.tsx` | `Table2B2PemetaanCplPlScreen` | KP AP |
| 19 | `/kriteria-2/peta-pemenuhan-cpl` | kriteria-2 | `table-2b3-peta-pemenuhan-cpl.screen.tsx` | `Table2B3PetaPemenuhanCplScreen` | KP AP DS(own courses) |
| 20 | `/kriteria-2/data-lulusan` | kriteria-2 | `table-2b4-2b5-data-lulusan.screen.tsx` | `Table2B42B5DataLulusanScreen` | KP AP |
| 21 | `/kriteria-2/kepuasan-pengguna` | kriteria-2 | `table-2b6-kepuasan-pengguna.screen.tsx` | `Table2B6KepuasanPenggunaScreen` | KP AP |
| 22 | `/kriteria-2/fleksibilitas-pembelajaran` | kriteria-2 | `table-2c-fleksibilitas-pembelajaran.screen.tsx` | `Table2CFleksibilitasPembelajaranScreen` | KP AP |
| 23 | `/kriteria-2/rekognisi-lulusan` | kriteria-2 | `table-2d-rekognisi-lulusan.screen.tsx` | `Table2DRekognisiLulusanScreen` | KP AP |
| 24 | `/kriteria-2/pratinjau` | kriteria-2 | `kriteria-2-pratinjau.screen.tsx` | `Kriteria2PratinjauScreen` | KP AP |
| 25 | `/kriteria-3/sarana-penelitian` | kriteria-3 | `table-3a1-sarana-penelitian.screen.tsx` | `Table3A1SaranaPenelitianScreen` | KP AP |
| 26 | `/kriteria-3/penelitian` | kriteria-3 | `table-3a2-penelitian.screen.tsx` | `Table3A2PenelitianScreen` | KP AP DT(own) |
| 27 | `/kriteria-3/pengembangan-dtpr` | kriteria-3 | `table-3a3-pengembangan-dtpr.screen.tsx` | `Table3A3PengembanganDtprScreen` | KP AP DT(own) |
| 28 | `/kriteria-3/kerjasama-penelitian` | kriteria-3 | `table-3c1-kerjasama-penelitian.screen.tsx` | `Table3C1KerjasamaPenelitianScreen` | KP AP DT(own) |
| 29 | `/kriteria-3/publikasi` | kriteria-3 | `table-3c2-publikasi.screen.tsx` | `Table3C2PublikasiScreen` | KP AP DT(own) |
| 30 | `/kriteria-3/hki-penelitian` | kriteria-3 | `table-3c3-hki-penelitian.screen.tsx` | `Table3C3HkiPenelitianScreen` | KP AP DT(own) |
| 31 | `/kriteria-3/pratinjau` | kriteria-3 | `kriteria-3-pratinjau.screen.tsx` | `Kriteria3PratinjauScreen` | KP AP |
| 32 | `/kriteria-4/sarana-pkm` | kriteria-4 | `table-4a1-sarana-pkm.screen.tsx` | `Table4A1SaranaPkmScreen` | KP AP |
| 33 | `/kriteria-4/pkm` | kriteria-4 | `table-4a2-pkm.screen.tsx` | `Table4A2PkmScreen` | KP AP DT(own) |
| 34 | `/kriteria-4/kerjasama-pkm` | kriteria-4 | `table-4c1-kerjasama-pkm.screen.tsx` | `Table4C1KerjasamaPkmScreen` | KP AP DT(own) |
| 35 | `/kriteria-4/diseminasi-pkm` | kriteria-4 | `table-4c2-diseminasi-pkm.screen.tsx` | `Table4C2DiseminasiPkmScreen` | KP AP DT(own) |
| 36 | `/kriteria-4/hki-pkm` | kriteria-4 | `table-4c3-hki-pkm.screen.tsx` | `Table4C3HkiPkmScreen` | KP AP DT(own) |
| 37 | `/kriteria-4/pratinjau` | kriteria-4 | `kriteria-4-pratinjau.screen.tsx` | `Kriteria4PratinjauScreen` | KP AP |
| 38 | `/kriteria-5/tata-kelola` | kriteria-5 | `table-51-tata-kelola.screen.tsx` | `Table51TataKelolaScreen` | KP AP |
| 39 | `/kriteria-5/sarana-pendidikan` | kriteria-5 | `table-52-sarana-pendidikan.screen.tsx` | `Table52SaranaPendidikanScreen` | KP AP |
| 40 | `/kriteria-5/pratinjau` | kriteria-5 | `kriteria-5-pratinjau.screen.tsx` | `Kriteria5PratinjauScreen` | KP AP |
| 41 | `/kriteria-6/visi-misi` | kriteria-6 | `table-6-visi-misi.screen.tsx` | `Table6VisiMisiScreen` | KP AP |
| 42 | `/kriteria-6/pratinjau` | kriteria-6 | `kriteria-6-pratinjau.screen.tsx` | `Kriteria6PratinjauScreen` | KP AP |
| 43 | `/verifikasi` | verification | `verification-queue.screen.tsx` | `VerificationQueueScreen` | KP |
| 44 | `/master/dosen` | master | `master-dosen.screen.tsx` | `MasterDosenScreen` | KP AP |
| 45 | `/master/mahasiswa` | master | `master-mahasiswa.screen.tsx` | `MasterMahasiswaScreen` | KP AP |
| 46 | `/master/mitra` | master | `master-mitra.screen.tsx` | `MasterMitraScreen` | KP AP |
| 47 | `/master/mata-kuliah` | master | `master-mata-kuliah.screen.tsx` | `MasterMataKuliahScreen` | KP AP |
| 48 | `/master/profil-lulusan` | master | `master-profil-lulusan.screen.tsx` | `MasterProfilLulusanScreen` | KP AP |
| 49 | `/master/cpl-cpmk` | master | `master-cpl-cpmk.screen.tsx` | `MasterCplCpmkScreen` | KP AP |
| 50 | `/bukti` | evidence | `evidence-library.screen.tsx` | `EvidenceLibraryScreen` | KP AP DT(own) DS(own) |
| 51 | `/ekspor` | export | `export-center.screen.tsx` | `ExportCenterScreen` | KP AP |
| 52 | `/periode` | period | `period-management.screen.tsx` | `PeriodManagementScreen` | KP (AP read-only) AS (reopen only) |
| 53 | `/pengaturan/validasi` | settings | `validation-settings.screen.tsx` | `ValidationSettingsScreen` | KP |
| 54 | `/admin/pengguna` | admin | `admin-users.screen.tsx` | `AdminUsersScreen` | AS |
| 55 | `/admin/referensi` | admin | `admin-reference-lists.screen.tsx` | `AdminReferenceListsScreen` | AS KP |
| 56 | `/admin/audit` | admin | `admin-audit-log.screen.tsx` | `AdminAuditLogScreen` | AS KP |

Error pages (Phase 18): `app/not-found.tsx` → `NotFoundScreen` (`auth/screens/not-found.screen.tsx`); `app/error.tsx` and `app/(app)/error.tsx` → `AppErrorScreen` (`auth/screens/app-error.screen.tsx`).

Extra routing files (no screens of their own): `app/(app)/forbidden/page.tsx` → `ForbiddenScreen` (`src/frontend/features/auth/screens/forbidden.screen.tsx`); `app/page.tsx` redirects to the user's landing page via `redirectToLanding` (`src/frontend/features/auth/screens/landing-redirect.screen.tsx` → `LandingRedirectScreen`).

---

## 6. Route Handlers

`route.ts` files only re-export, for example `export { uploadFileHandler as POST } from '@backend/features/evidence/handlers/upload-file.handler';`

| Method + URL | Handler file (`src/backend/features/…`) | Export |
|---|---|---|
| GET, POST `/api/auth/[...all]` | `auth/handlers/auth-route.handler.ts` | `authRouteHandler` (object `{ GET, POST }`; the route file destructures it) |
| POST `/api/files` | `evidence/handlers/upload-file.handler.ts` | `uploadFileHandler` |
| GET `/api/files/[fileId]` | `evidence/handlers/download-file.handler.ts` | `downloadFileHandler` |
| GET `/api/import/dosen/template` | `import/handlers/download-dosen-template.handler.ts` | `downloadDosenTemplateHandler` |
| POST `/api/import/dosen/preview` | `import/handlers/preview-dosen-import.handler.ts` | `previewDosenImportHandler` |
| GET `/api/import/mahasiswa/template` | `import/handlers/download-mahasiswa-template.handler.ts` | `downloadMahasiswaTemplateHandler` |
| POST `/api/import/mahasiswa/preview` | `import/handlers/preview-mahasiswa-import.handler.ts` | `previewMahasiswaImportHandler` |
| GET `/api/import/[jobId]/error-report` | `import/handlers/download-import-error-report.handler.ts` | `downloadImportErrorReportHandler` |
| GET `/api/export/tabel/[code]` | `export/handlers/export-table.handler.ts` | `exportTableHandler` |
| GET `/api/export/kriteria/[criterion]` | `export/handlers/export-criterion.handler.ts` | `exportCriterionHandler` |
| GET `/api/export/lengkap` | `export/handlers/export-full.handler.ts` | `exportFullHandler` |
| GET `/api/export/lengkap-zip` | `export/handlers/export-full-zip.handler.ts` | `exportFullZipHandler` |
| GET `/api/periode/[periodId]/snapshot/[seq]` | `period/handlers/download-period-snapshot.handler.ts` | `downloadPeriodSnapshotHandler` |

Table codes in URLs use the file form (`3a2`). Every handler authenticates, authorises, and returns JSON errors `{ code, message }` with the right HTTP status.

---

## 7. File Inventory by Feature

Each block lists the files for one feature on both sides. One line = one file = one export. Paths are relative to `src/`.

### 7.1 `auth`
```
frontend/features/auth/
  screens/login.screen.tsx                         LoginScreen
  screens/change-password.screen.tsx               ChangePasswordScreen
  screens/forbidden.screen.tsx                     ForbiddenScreen
  screens/landing-redirect.screen.tsx              LandingRedirectScreen
  components/login-form.component.tsx              LoginForm
  components/change-password-form.component.tsx    ChangePasswordForm

backend/features/auth/
  actions/sign-in.action.ts                        signInAction
  actions/sign-out.action.ts                       signOutAction
  actions/change-password.action.ts                changePasswordAction
  handlers/auth-route.handler.ts                   authRouteHandler

backend/auth/
  auth-instance.ts                                 authInstance        (Better Auth configuration)
  get-session-user.ts                              getSessionUser      (null when signed out)
  require-session-user.ts                          requireSessionUser  (redirects to /login; enforces must-change-password)
  require-capability.ts                            requireCapability   (redirects to /forbidden)
  load-user-roles.ts                               loadUserRoles
  assert-entry-access.ts                           assertEntryAccess   (ownership, §13.3)
  get-landing-path.ts                              getLandingPath

shared/schemas/auth/
  sign-in.schema.ts                                signInSchema
  change-password.schema.ts                        changePasswordSchema
shared/permissions/
  permission-matrix.ts                             permissionMatrix
  can-perform.ts                                   canPerform
  capability.type.ts                               (types Capability, Role)
shared/types/session-user.type.ts                  (type SessionUser)
```

### 7.2 `dashboard`
```
frontend/features/dashboard/
  screens/dashboard.screen.tsx                     DashboardScreen
  components/dashboard-kpi-row.component.tsx       DashboardKpiRow
  components/criterion-completeness-card.component.tsx  CriterionCompletenessCard
  components/indicator-values-card.component.tsx   IndicatorValuesCard
  components/my-tasks-card.component.tsx           MyTasksCard

backend/features/dashboard/
  queries/get-dashboard-kpis.query.ts              getDashboardKpisQuery
  queries/get-criterion-completeness.query.ts      getCriterionCompletenessQuery
  queries/get-indicator-values.query.ts            getIndicatorValuesQuery
  queries/get-my-tasks.query.ts                    getMyTasksQuery
  lib/compute-indicator-values.ts                  computeIndicatorValues
```

### 7.3 `period`
```
frontend/features/period/
  screens/period-management.screen.tsx             PeriodManagementScreen
  components/create-period-dialog.component.tsx    CreatePeriodDialog
  components/submit-period-dialog.component.tsx    SubmitPeriodDialog
  components/reopen-period-dialog.component.tsx    ReopenPeriodDialog
  components/period-attachment-uploader.component.tsx  PeriodAttachmentUploader
  components/nihil-toggle.component.tsx            NihilToggle

backend/features/period/
  actions/create-period.action.ts                  createPeriodAction
  actions/submit-period.action.ts                  submitPeriodAction
  actions/reopen-period.action.ts                  reopenPeriodAction
  actions/save-period-attachment.action.ts         savePeriodAttachmentAction
  actions/remove-period-attachment.action.ts       removePeriodAttachmentAction
  actions/set-table-nihil.action.ts                setTableNihilAction
  queries/get-active-period.query.ts               getActivePeriodQuery
  queries/list-periods.query.ts                    listPeriodsQuery
  queries/get-period-attachment.query.ts           getPeriodAttachmentQuery
  queries/get-period-submission-check.query.ts     getPeriodSubmissionCheckQuery
  queries/get-table-status.query.ts                getTableStatusQuery
  handlers/download-period-snapshot.handler.ts     downloadPeriodSnapshotHandler
  lib/get-ts-years.ts                              getTsYears
  lib/resolve-period-years.ts                      resolvePeriodYears   (labels → academic_year rows)
  lib/find-open-period.ts                          findOpenPeriod
  lib/assert-period-open.ts                        assertPeriodOpen
  lib/build-period-snapshot.ts                     buildPeriodSnapshot

shared/schemas/period/
  create-period.schema.ts                          createPeriodSchema
  reopen-period.schema.ts                          reopenPeriodSchema
  table-nihil.schema.ts                            tableNihilSchema
```

### 7.4 `identitas`
```
frontend/features/identitas/
  screens/identitas-pengusul.screen.tsx            IdentitasPengusulScreen
  screens/tim-penyusun.screen.tsx                  TimPenyusunScreen
  components/identitas-pengusul-form.component.tsx IdentitasPengusulForm
  components/program-studi-upps-panel.component.tsx ProgramStudiUppsPanel
  components/program-studi-upps-form.component.tsx ProgramStudiUppsForm
  components/tim-penyusun-form.component.tsx       TimPenyusunForm

backend/features/identitas/
  actions/save-identitas-pengusul.action.ts        saveIdentitasPengusulAction
  actions/create-program-studi-upps.action.ts      createProgramStudiUppsAction
  actions/update-program-studi-upps.action.ts      updateProgramStudiUppsAction
  actions/create-tim-penyusun.action.ts            createTimPenyusunAction
  actions/update-tim-penyusun.action.ts            updateTimPenyusunAction
  queries/get-identitas-pengusul.query.ts          getIdentitasPengusulQuery
  queries/list-program-studi-upps.query.ts         listProgramStudiUppsQuery
  queries/get-program-studi-upps.query.ts          getProgramStudiUppsQuery
  queries/list-tim-penyusun.query.ts               listTimPenyusunQuery
  queries/get-tim-penyusun.query.ts                getTimPenyusunQuery
  queries/get-identitas-status.query.ts            getIdentitasStatusQuery

shared/schemas/identitas/
  identitas-pengusul.schema.ts                     identitasPengusulSchema
  program-studi-upps.schema.ts                     programStudiUppsSchema
  tim-penyusun.schema.ts                           timPenyusunSchema
```

### 7.5 `kriteria-1`
```
frontend/features/kriteria-1/
  screens/gambar-1a-struktur-organisasi.screen.tsx Gambar1AStrukturOrganisasiScreen
  screens/table-1a1-pimpinan-unit.screen.tsx       Table1A1PimpinanUnitScreen
  screens/table-1a2-sumber-dana.screen.tsx         Table1A2SumberDanaScreen
  screens/table-1a3-penggunaan-dana.screen.tsx     Table1A3PenggunaanDanaScreen
  screens/table-1a4-ewmp.screen.tsx                Table1A4EwmpScreen
  screens/table-1a5-kualifikasi-tendik.screen.tsx  Table1A5KualifikasiTendikScreen
  screens/table-1b-unit-spmi.screen.tsx            Table1BUnitSpmiScreen
  screens/kriteria-1-pratinjau.screen.tsx          Kriteria1PratinjauScreen
  components/pimpinan-unit-form.component.tsx      PimpinanUnitForm
  components/sumber-dana-form.component.tsx        SumberDanaForm
  components/penggunaan-dana-form.component.tsx    PenggunaanDanaForm
  components/ewmp-form.component.tsx               EwmpForm
  components/kualifikasi-tendik-form.component.tsx KualifikasiTendikForm
  components/unit-spmi-form.component.tsx          UnitSpmiForm

backend/features/kriteria-1/
  actions/create-pimpinan-unit.action.ts           createPimpinanUnitAction        (1.A.1)
  actions/update-pimpinan-unit.action.ts           updatePimpinanUnitAction
  actions/create-sumber-dana.action.ts             createSumberDanaAction          (1.A.2)
  actions/update-sumber-dana.action.ts             updateSumberDanaAction
  actions/create-penggunaan-dana.action.ts         createPenggunaanDanaAction      (1.A.3)
  actions/update-penggunaan-dana.action.ts         updatePenggunaanDanaAction
  actions/create-ewmp.action.ts                    createEwmpAction                (1.A.4)
  actions/update-ewmp.action.ts                    updateEwmpAction
  actions/create-kualifikasi-tendik.action.ts      createKualifikasiTendikAction   (1.A.5)
  actions/update-kualifikasi-tendik.action.ts      updateKualifikasiTendikAction
  actions/create-unit-spmi.action.ts               createUnitSpmiAction            (1.B)
  actions/update-unit-spmi.action.ts               updateUnitSpmiAction
  queries/list-pimpinan-unit.query.ts              listPimpinanUnitQuery
  queries/get-pimpinan-unit.query.ts               getPimpinanUnitQuery
  queries/list-sumber-dana.query.ts                listSumberDanaQuery
  queries/get-sumber-dana.query.ts                 getSumberDanaQuery
  queries/list-penggunaan-dana.query.ts            listPenggunaanDanaQuery
  queries/get-penggunaan-dana.query.ts             getPenggunaanDanaQuery
  queries/list-ewmp.query.ts                       listEwmpQuery
  queries/get-ewmp.query.ts                        getEwmpQuery
  queries/get-suggested-sks-manajemen.query.ts     getSuggestedSksManajemenQuery
  queries/list-kualifikasi-tendik.query.ts         listKualifikasiTendikQuery
  queries/get-kualifikasi-tendik.query.ts          getKualifikasiTendikQuery
  queries/list-unit-spmi.query.ts                  listUnitSpmiQuery
  queries/get-unit-spmi.query.ts                   getUnitSpmiQuery
  lib/save-dana-tahun.ts                           saveDanaTahun                   (year amounts for 1.A.2 / 1.A.3)

shared/schemas/kriteria-1/
  pimpinan-unit.schema.ts                          pimpinanUnitSchema
  sumber-dana.schema.ts                            sumberDanaSchema
  penggunaan-dana.schema.ts                        penggunaanDanaSchema
  ewmp.schema.ts                                   ewmpSchema
  kualifikasi-tendik.schema.ts                     kualifikasiTendikSchema
  unit-spmi.schema.ts                              unitSpmiSchema
```

### 7.6 `kriteria-2`
```
frontend/features/kriteria-2/
  screens/table-2a1-data-mahasiswa.screen.tsx      Table2A1DataMahasiswaScreen
  screens/table-2a2-asal-mahasiswa.screen.tsx      Table2A2AsalMahasiswaScreen
  screens/table-2a3-kondisi-mahasiswa.screen.tsx   Table2A3KondisiMahasiswaScreen
  screens/table-2b1-isi-pembelajaran.screen.tsx    Table2B1IsiPembelajaranScreen
  screens/table-2b2-pemetaan-cpl-pl.screen.tsx     Table2B2PemetaanCplPlScreen
  screens/table-2b3-peta-pemenuhan-cpl.screen.tsx  Table2B3PetaPemenuhanCplScreen
  screens/table-2b4-2b5-data-lulusan.screen.tsx    Table2B42B5DataLulusanScreen
  screens/table-2b6-kepuasan-pengguna.screen.tsx   Table2B6KepuasanPenggunaScreen
  screens/table-2c-fleksibilitas-pembelajaran.screen.tsx  Table2CFleksibilitasPembelajaranScreen
  screens/table-2d-rekognisi-lulusan.screen.tsx    Table2DRekognisiLulusanScreen
  screens/kriteria-2-pratinjau.screen.tsx          Kriteria2PratinjauScreen
  components/data-mahasiswa-form.component.tsx     DataMahasiswaForm
  components/asal-mahasiswa-form.component.tsx     AsalMahasiswaForm
  components/kondisi-mahasiswa-form.component.tsx  KondisiMahasiswaForm
  components/isi-pembelajaran-matrix.component.tsx IsiPembelajaranMatrix
  components/cpl-profil-lulusan-matrix.component.tsx  CplProfilLulusanMatrix
  components/peta-pemenuhan-cpl-editor.component.tsx  PetaPemenuhanCplEditor
  components/kurikulum-pemetaan-bar.component.tsx  KurikulumPemetaanBar            (status + "Ajukan Pemetaan")
  components/data-lulusan-form.component.tsx       DataLulusanForm
  components/kepuasan-pengguna-form.component.tsx  KepuasanPenggunaForm
  components/fleksibilitas-pembelajaran-form.component.tsx  FleksibilitasPembelajaranForm
  components/rekognisi-lulusan-form.component.tsx  RekognisiLulusanForm

backend/features/kriteria-2/
  actions/save-data-mahasiswa.action.ts            saveDataMahasiswaAction         (2.A.1, upsert by year)
  actions/create-asal-mahasiswa.action.ts          createAsalMahasiswaAction       (2.A.2)
  actions/update-asal-mahasiswa.action.ts          updateAsalMahasiswaAction
  actions/save-kondisi-mahasiswa.action.ts         saveKondisiMahasiswaAction      (2.A.3, upsert by cohort)
  actions/toggle-mk-profil-lulusan.action.ts       toggleMkProfilLulusanAction     (2.B.1)
  actions/toggle-cpl-profil-lulusan.action.ts      toggleCplProfilLulusanAction    (2.B.2)
  actions/set-cpmk-mata-kuliah.action.ts           setCpmkMataKuliahAction         (2.B.3)
  actions/submit-kurikulum-pemetaan.action.ts      submitKurikulumPemetaanAction
  actions/save-data-lulusan.action.ts              saveDataLulusanAction           (2.B.4 + 2.B.5, upsert by year)
  actions/save-kepuasan-pengguna.action.ts         saveKepuasanPenggunaAction      (2.B.6)
  actions/create-fleksibilitas-pembelajaran.action.ts  createFleksibilitasPembelajaranAction  (2.C)
  actions/update-fleksibilitas-pembelajaran.action.ts  updateFleksibilitasPembelajaranAction
  actions/create-rekognisi-lulusan.action.ts       createRekognisiLulusanAction    (2.D)
  actions/update-rekognisi-lulusan.action.ts       updateRekognisiLulusanAction
  queries/list-data-mahasiswa.query.ts             listDataMahasiswaQuery
  queries/list-asal-mahasiswa.query.ts             listAsalMahasiswaQuery
  queries/get-asal-mahasiswa.query.ts              getAsalMahasiswaQuery
  queries/list-kondisi-mahasiswa.query.ts          listKondisiMahasiswaQuery
  queries/get-isi-pembelajaran-matrix.query.ts     getIsiPembelajaranMatrixQuery
  queries/get-cpl-profil-lulusan-matrix.query.ts   getCplProfilLulusanMatrixQuery
  queries/get-peta-pemenuhan-cpl.query.ts          getPetaPemenuhanCplQuery
  queries/get-kurikulum-pemetaan.query.ts          getKurikulumPemetaanQuery
  queries/list-data-lulusan.query.ts               listDataLulusanQuery
  queries/get-kepuasan-pengguna.query.ts           getKepuasanPenggunaQuery
  queries/list-fleksibilitas-pembelajaran.query.ts listFleksibilitasPembelajaranQuery
  queries/get-fleksibilitas-pembelajaran.query.ts  getFleksibilitasPembelajaranQuery
  queries/list-rekognisi-lulusan.query.ts          listRekognisiLulusanQuery
  queries/get-rekognisi-lulusan.query.ts           getRekognisiLulusanQuery
  lib/compute-total-mahasiswa-baru.ts              computeTotalMahasiswaBaru       [A-01]
  lib/compute-total-mahasiswa-aktif.ts             computeTotalMahasiswaAktif      [A-01]
  lib/load-verified-mhs-data.ts                    loadVerifiedMhsData             (per-year totals for cross-table use)
  lib/load-verified-lulusan.ts                     loadVerifiedLulusan
  lib/touch-kurikulum-pemetaan.ts                  touchKurikulumPemetaan          (get-or-create set; apply PRD §7.2 rule 6)
  lib/assert-mata-kuliah-pengampu.ts               assertMataKuliahPengampu        (Dosen may edit only own courses)
  lib/save-year-values.ts                          saveYearValues                  (generic child year rows: asal, fleksibilitas, rekognisi)

shared/schemas/kriteria-2/
  data-mahasiswa.schema.ts                         dataMahasiswaSchema
  asal-mahasiswa.schema.ts                         asalMahasiswaSchema
  kondisi-mahasiswa.schema.ts                      kondisiMahasiswaSchema
  mk-profil-lulusan-toggle.schema.ts               mkProfilLulusanToggleSchema
  cpl-profil-lulusan-toggle.schema.ts              cplProfilLulusanToggleSchema
  cpmk-mata-kuliah.schema.ts                       cpmkMataKuliahSchema
  data-lulusan.schema.ts                           dataLulusanSchema
  kepuasan-pengguna.schema.ts                      kepuasanPenggunaSchema
  fleksibilitas-pembelajaran.schema.ts             fleksibilitasPembelajaranSchema
  rekognisi-lulusan.schema.ts                      rekognisiLulusanSchema
```

### 7.7 `prasarana` (shared by 3.A.1, 4.A.1, 5.2)
```
frontend/features/prasarana/
  components/prasarana-form.component.tsx          PrasaranaForm
  components/prasarana-work-panel.component.tsx    PrasaranaWorkPanel   (list + sheet, takes a `usage` prop)

backend/features/prasarana/
  actions/create-prasarana.action.ts               createPrasaranaAction
  actions/update-prasarana.action.ts               updatePrasaranaAction
  queries/list-prasarana-by-usage.query.ts         listPrasaranaByUsageQuery
  queries/get-prasarana.query.ts                   getPrasaranaQuery

shared/schemas/prasarana/prasarana.schema.ts       prasaranaSchema
```

### 7.8 `tridharma` (helpers shared by Penelitian and PkM)
```
frontend/features/tridharma/
  components/tridharma-form-fields.component.tsx   TridharmaFormFields  (shared field group used by PenelitianForm and PkmForm)
  components/linked-outputs-panel.component.tsx    LinkedOutputsPanel   (read-only related publications / HKI / diseminasi)

backend/features/tridharma/
  queries/search-penelitian-options.query.ts       searchPenelitianOptionsQuery
  queries/search-pkm-options.query.ts              searchPkmOptionsQuery
  queries/list-linked-outputs.query.ts             listLinkedOutputsQuery
  lib/save-tridharma-children.ts                   saveTridharmaChildren   (ketua, anggota, mahasiswa, dana)
  lib/save-kerjasama-dana.ts                       saveKerjasamaDana
  lib/assert-no-linked-outputs.ts                  assertNoLinkedOutputs   (PRD §7.2 rule 4)

shared/schemas/tridharma/
  tridharma-base.schema.ts                         tridharmaBaseSchema
  kerjasama-base.schema.ts                         kerjasamaBaseSchema
  hki-base.schema.ts                               hkiBaseSchema
```

### 7.9 `kriteria-3`
```
frontend/features/kriteria-3/
  screens/table-3a1-sarana-penelitian.screen.tsx   Table3A1SaranaPenelitianScreen
  screens/table-3a2-penelitian.screen.tsx          Table3A2PenelitianScreen
  screens/table-3a3-pengembangan-dtpr.screen.tsx   Table3A3PengembanganDtprScreen
  screens/table-3c1-kerjasama-penelitian.screen.tsx Table3C1KerjasamaPenelitianScreen
  screens/table-3c2-publikasi.screen.tsx           Table3C2PublikasiScreen
  screens/table-3c3-hki-penelitian.screen.tsx      Table3C3HkiPenelitianScreen
  screens/kriteria-3-pratinjau.screen.tsx          Kriteria3PratinjauScreen
  components/penelitian-form.component.tsx         PenelitianForm
  components/pengembangan-dtpr-form.component.tsx  PengembanganDtprForm
  components/kerjasama-penelitian-form.component.tsx KerjasamaPenelitianForm
  components/publikasi-form.component.tsx          PublikasiForm
  components/hki-penelitian-form.component.tsx     HkiPenelitianForm

backend/features/kriteria-3/
  actions/create-penelitian.action.ts              createPenelitianAction          (3.A.2)
  actions/update-penelitian.action.ts              updatePenelitianAction
  actions/create-pengembangan-dtpr.action.ts       createPengembanganDtprAction    (3.A.3)
  actions/update-pengembangan-dtpr.action.ts       updatePengembanganDtprAction
  actions/create-kerjasama-penelitian.action.ts    createKerjasamaPenelitianAction (3.C.1)
  actions/update-kerjasama-penelitian.action.ts    updateKerjasamaPenelitianAction
  actions/create-publikasi.action.ts               createPublikasiAction           (3.C.2)
  actions/update-publikasi.action.ts               updatePublikasiAction
  actions/create-hki-penelitian.action.ts          createHkiPenelitianAction       (3.C.3)
  actions/update-hki-penelitian.action.ts          updateHkiPenelitianAction
  queries/list-penelitian.query.ts                 listPenelitianQuery
  queries/get-penelitian.query.ts                  getPenelitianQuery
  queries/list-pengembangan-dtpr.query.ts          listPengembanganDtprQuery
  queries/get-pengembangan-dtpr.query.ts           getPengembanganDtprQuery
  queries/list-kerjasama-penelitian.query.ts       listKerjasamaPenelitianQuery
  queries/get-kerjasama-penelitian.query.ts        getKerjasamaPenelitianQuery
  queries/list-publikasi.query.ts                  listPublikasiQuery
  queries/get-publikasi.query.ts                   getPublikasiQuery
  queries/list-hki-penelitian.query.ts             listHkiPenelitianQuery
  queries/get-hki-penelitian.query.ts              getHkiPenelitianQuery

shared/schemas/kriteria-3/
  penelitian.schema.ts                             penelitianSchema
  pengembangan-dtpr.schema.ts                      pengembanganDtprSchema
  kerjasama-penelitian.schema.ts                   kerjasamaPenelitianSchema
  publikasi.schema.ts                              publikasiSchema
  hki-penelitian.schema.ts                         hkiPenelitianSchema
```

### 7.10 `kriteria-4`
```
frontend/features/kriteria-4/
  screens/table-4a1-sarana-pkm.screen.tsx          Table4A1SaranaPkmScreen
  screens/table-4a2-pkm.screen.tsx                 Table4A2PkmScreen
  screens/table-4c1-kerjasama-pkm.screen.tsx       Table4C1KerjasamaPkmScreen
  screens/table-4c2-diseminasi-pkm.screen.tsx      Table4C2DiseminasiPkmScreen
  screens/table-4c3-hki-pkm.screen.tsx             Table4C3HkiPkmScreen
  screens/kriteria-4-pratinjau.screen.tsx          Kriteria4PratinjauScreen
  components/pkm-form.component.tsx                PkmForm
  components/kerjasama-pkm-form.component.tsx      KerjasamaPkmForm
  components/diseminasi-pkm-form.component.tsx     DiseminasiPkmForm
  components/hki-pkm-form.component.tsx            HkiPkmForm

backend/features/kriteria-4/
  actions/create-pkm.action.ts                     createPkmAction                 (4.A.2)
  actions/update-pkm.action.ts                     updatePkmAction
  actions/create-kerjasama-pkm.action.ts           createKerjasamaPkmAction        (4.C.1)
  actions/update-kerjasama-pkm.action.ts           updateKerjasamaPkmAction
  actions/create-diseminasi-pkm.action.ts          createDiseminasiPkmAction       (4.C.2)
  actions/update-diseminasi-pkm.action.ts          updateDiseminasiPkmAction
  actions/create-hki-pkm.action.ts                 createHkiPkmAction              (4.C.3)
  actions/update-hki-pkm.action.ts                 updateHkiPkmAction
  queries/list-pkm.query.ts                        listPkmQuery
  queries/get-pkm.query.ts                         getPkmQuery
  queries/list-kerjasama-pkm.query.ts              listKerjasamaPkmQuery
  queries/get-kerjasama-pkm.query.ts               getKerjasamaPkmQuery
  queries/list-diseminasi-pkm.query.ts             listDiseminasiPkmQuery
  queries/get-diseminasi-pkm.query.ts              getDiseminasiPkmQuery
  queries/list-hki-pkm.query.ts                    listHkiPkmQuery
  queries/get-hki-pkm.query.ts                     getHkiPkmQuery

shared/schemas/kriteria-4/
  pkm.schema.ts                                    pkmSchema
  kerjasama-pkm.schema.ts                          kerjasamaPkmSchema
  diseminasi-pkm.schema.ts                         diseminasiPkmSchema
  hki-pkm.schema.ts                                hkiPkmSchema
```

### 7.11 `kriteria-5` and `kriteria-6`
```
frontend/features/kriteria-5/
  screens/table-51-tata-kelola.screen.tsx          Table51TataKelolaScreen
  screens/table-52-sarana-pendidikan.screen.tsx    Table52SaranaPendidikanScreen
  screens/kriteria-5-pratinjau.screen.tsx          Kriteria5PratinjauScreen
  components/tata-kelola-form.component.tsx        TataKelolaForm
backend/features/kriteria-5/
  actions/create-tata-kelola.action.ts             createTataKelolaAction          (5.1)
  actions/update-tata-kelola.action.ts             updateTataKelolaAction
  queries/list-tata-kelola.query.ts                listTataKelolaQuery
  queries/get-tata-kelola.query.ts                 getTataKelolaQuery
shared/schemas/kriteria-5/tata-kelola.schema.ts    tataKelolaSchema

frontend/features/kriteria-6/
  screens/table-6-visi-misi.screen.tsx             Table6VisiMisiScreen
  screens/kriteria-6-pratinjau.screen.tsx          Kriteria6PratinjauScreen
  components/visi-misi-form.component.tsx          VisiMisiForm
backend/features/kriteria-6/
  actions/save-visi-misi.action.ts                 saveVisiMisiAction              (6)
  queries/get-visi-misi.query.ts                   getVisiMisiQuery
shared/schemas/kriteria-6/visi-misi.schema.ts      visiMisiSchema
```

### 7.12 `master`
```
frontend/features/master/
  screens/master-dosen.screen.tsx                  MasterDosenScreen
  screens/master-mahasiswa.screen.tsx              MasterMahasiswaScreen
  screens/master-mitra.screen.tsx                  MasterMitraScreen
  screens/master-mata-kuliah.screen.tsx            MasterMataKuliahScreen
  screens/master-profil-lulusan.screen.tsx         MasterProfilLulusanScreen
  screens/master-cpl-cpmk.screen.tsx               MasterCplCpmkScreen
  components/dosen-form.component.tsx              DosenForm
  components/dosen-year-status-fields.component.tsx DosenYearStatusFields
  components/mahasiswa-form.component.tsx          MahasiswaForm
  components/mitra-form.component.tsx              MitraForm
  components/mata-kuliah-form.component.tsx        MataKuliahForm
  components/profil-lulusan-form.component.tsx     ProfilLulusanForm
  components/cpl-form.component.tsx                CplForm
  components/cpmk-form.component.tsx               CpmkForm

backend/features/master/
  actions/create-dosen.action.ts                   createDosenAction
  actions/update-dosen.action.ts                   updateDosenAction               (includes per-year status)
  actions/create-mahasiswa.action.ts               createMahasiswaAction
  actions/update-mahasiswa.action.ts               updateMahasiswaAction
  actions/create-mitra.action.ts                   createMitraAction
  actions/update-mitra.action.ts                   updateMitraAction
  actions/create-mata-kuliah.action.ts             createMataKuliahAction          (includes pengampu)
  actions/update-mata-kuliah.action.ts             updateMataKuliahAction
  actions/create-profil-lulusan.action.ts          createProfilLulusanAction
  actions/update-profil-lulusan.action.ts          updateProfilLulusanAction
  actions/create-cpl.action.ts                     createCplAction
  actions/update-cpl.action.ts                     updateCplAction
  actions/create-cpmk.action.ts                    createCpmkAction
  actions/update-cpmk.action.ts                    updateCpmkAction
  actions/archive-master-record.action.ts          archiveMasterRecordAction       (archive / restore, any master)
  queries/list-dosen.query.ts                      listDosenQuery
  queries/get-dosen.query.ts                       getDosenQuery
  queries/search-dosen-options.query.ts            searchDosenOptionsQuery         (supports `dtprAtYearId` filter)
  queries/list-mahasiswa.query.ts                  listMahasiswaQuery
  queries/get-mahasiswa.query.ts                   getMahasiswaQuery
  queries/search-mahasiswa-options.query.ts        searchMahasiswaOptionsQuery
  queries/list-mitra.query.ts                      listMitraQuery
  queries/get-mitra.query.ts                       getMitraQuery
  queries/search-mitra-options.query.ts            searchMitraOptionsQuery
  queries/list-mata-kuliah.query.ts                listMataKuliahQuery
  queries/get-mata-kuliah.query.ts                 getMataKuliahQuery
  queries/list-profil-lulusan.query.ts             listProfilLulusanQuery
  queries/get-profil-lulusan.query.ts              getProfilLulusanQuery
  queries/list-cpl-with-cpmk.query.ts              listCplWithCpmkQuery
  queries/get-cpl.query.ts                         getCplQuery
  queries/get-cpmk.query.ts                        getCpmkQuery
  queries/list-ref-options-for-form.query.ts       listRefOptionsForFormQuery      (active options of one type; used by every form)
  lib/assert-master-not-referenced.ts              assertMasterNotReferenced

shared/schemas/master/
  dosen.schema.ts                                  dosenSchema
  mahasiswa.schema.ts                              mahasiswaSchema
  mitra.schema.ts                                  mitraSchema
  mata-kuliah.schema.ts                            mataKuliahSchema
  profil-lulusan.schema.ts                         profilLulusanSchema
  cpl.schema.ts                                    cplSchema
  cpmk.schema.ts                                   cpmkSchema
  archive-master-record.schema.ts                  archiveMasterRecordSchema
```

### 7.13 `verification`
```
frontend/features/verification/
  screens/verification-queue.screen.tsx            VerificationQueueScreen
  components/verification-detail-panel.component.tsx  VerificationDetailPanel
  components/bulk-verify-bar.component.tsx         BulkVerifyBar

backend/features/verification/
  actions/submit-entry.action.ts                   submitEntryAction      (submit an existing draft/returned entry from a list)
  actions/verify-entries.action.ts                 verifyEntriesAction    (one or many; atomic)
  actions/return-entry.action.ts                   returnEntryAction
  actions/delete-entry.action.ts                   deleteEntryAction
  actions/check-table-entries.action.ts            checkTableEntriesAction  ("Periksa Semua")
  queries/list-verification-queue.query.ts         listVerificationQueueQuery
  queries/get-verification-detail.query.ts         getVerificationDetailQuery

shared/schemas/verification/
  entry-ref.schema.ts                              entryRefSchema         ({ entityType, id, rowVersion })
  verify-entries.schema.ts                         verifyEntriesSchema
  return-entry.schema.ts                           returnEntrySchema
```

### 7.14 `evidence`
```
frontend/features/evidence/
  screens/evidence-library.screen.tsx              EvidenceLibraryScreen
  components/evidence-picker-dialog.component.tsx  EvidencePickerDialog   ("Pilih dari pustaka bukti")

backend/features/evidence/
  handlers/upload-file.handler.ts                  uploadFileHandler
  handlers/download-file.handler.ts                downloadFileHandler
  actions/delete-unlinked-file.action.ts           deleteUnlinkedFileAction
  queries/list-evidence-files.query.ts             listEvidenceFilesQuery
  queries/list-entry-evidence.query.ts             listEntryEvidenceQuery
  lib/detect-file-type.ts                          detectFileType
  lib/hash-file-sha256.ts                          hashFileSha256
  lib/build-storage-key.ts                         buildStorageKey
  lib/find-file-by-hash.ts                         findFileByHash
  lib/sync-entry-evidence.ts                       syncEntryEvidence      (make links for one entry + slot match a file-id list)
  lib/assert-file-readable.ts                      assertFileReadable     (download authorisation)

backend/storage/
  storage-adapter.type.ts                          (type StorageAdapter)
  create-local-disk-adapter.ts                     createLocalDiskAdapter
  get-storage.ts                                   getStorage
```

### 7.15 `import`
```
frontend/features/import/
  components/import-wizard-dialog.component.tsx    ImportWizardDialog
  components/import-review-table.component.tsx     ImportReviewTable

backend/features/import/
  handlers/download-dosen-template.handler.ts      downloadDosenTemplateHandler
  handlers/download-mahasiswa-template.handler.ts  downloadMahasiswaTemplateHandler
  handlers/preview-dosen-import.handler.ts         previewDosenImportHandler
  handlers/preview-mahasiswa-import.handler.ts     previewMahasiswaImportHandler
  handlers/download-import-error-report.handler.ts downloadImportErrorReportHandler
  actions/commit-dosen-import.action.ts            commitDosenImportAction
  actions/commit-mahasiswa-import.action.ts        commitMahasiswaImportAction
  lib/read-import-workbook.ts                      readImportWorkbook
  lib/validate-dosen-import-row.ts                 validateDosenImportRow
  lib/validate-mahasiswa-import-row.ts             validateMahasiswaImportRow
  lib/build-dosen-import-template.ts               buildDosenImportTemplate
  lib/build-mahasiswa-import-template.ts           buildMahasiswaImportTemplate
  lib/build-import-error-report.ts                 buildImportErrorReport
  lib/save-import-job.ts                           saveImportJob
  lib/load-import-job.ts                           loadImportJob

shared/schemas/import/
  dosen-import-row.schema.ts                       dosenImportRowSchema
  mahasiswa-import-row.schema.ts                   mahasiswaImportRowSchema
  commit-import.schema.ts                          commitImportSchema
shared/types/import-preview.type.ts                (types ImportPreview, ImportRowResult)
```

### 7.16 `export`
```
frontend/features/export/
  screens/export-center.screen.tsx                 ExportCenterScreen
  components/export-progress-card.component.tsx    ExportProgressCard
  components/export-criterion-list.component.tsx   ExportCriterionList

backend/features/export/
  handlers/export-table.handler.ts                 exportTableHandler
  handlers/export-criterion.handler.ts             exportCriterionHandler
  handlers/export-full.handler.ts                  exportFullHandler
  handlers/export-full-zip.handler.ts              exportFullZipHandler
  queries/get-criterion-preview.query.ts           getCriterionPreviewQuery   (TableModel[] for a criterion; snapshot when locked)
  queries/get-export-overview.query.ts             getExportOverviewQuery
  lib/load-models-for-export.ts                    loadModelsForExport        (compiles live for an open period; reads the latest snapshot for a locked one)
```

### 7.17 `settings`, `admin`, `audit`, `notifications`
```
frontend/features/settings/
  screens/validation-settings.screen.tsx           ValidationSettingsScreen
  components/validation-settings-form.component.tsx ValidationSettingsForm
backend/features/settings/
  actions/update-validation-settings.action.ts     updateValidationSettingsAction
  queries/get-validation-settings.query.ts         getValidationSettingsQuery
  lib/load-prodi-setting.ts                        loadProdiSetting
shared/schemas/settings/validation-settings.schema.ts  validationSettingsSchema

frontend/features/admin/
  screens/admin-users.screen.tsx                   AdminUsersScreen
  screens/admin-reference-lists.screen.tsx         AdminReferenceListsScreen
  screens/admin-audit-log.screen.tsx               AdminAuditLogScreen
  components/user-form.component.tsx               UserForm
  components/reset-password-dialog.component.tsx   ResetPasswordDialog
  components/ref-option-form.component.tsx         RefOptionForm
  components/ref-option-list.component.tsx         RefOptionList
backend/features/admin/
  actions/create-user.action.ts                    createUserAction
  actions/update-user.action.ts                    updateUserAction          (name, roles, linked Dosen)
  actions/reset-user-password.action.ts            resetUserPasswordAction
  actions/set-user-active.action.ts                setUserActiveAction       (deactivate / reactivate)
  actions/create-ref-option.action.ts              createRefOptionAction
  actions/update-ref-option.action.ts              updateRefOptionAction
  actions/reorder-ref-options.action.ts            reorderRefOptionsAction
  actions/set-ref-option-active.action.ts          setRefOptionActiveAction
  queries/list-users.query.ts                      listUsersQuery
  queries/get-user.query.ts                        getUserQuery
  queries/list-ref-options.query.ts                listRefOptionsQuery
shared/schemas/admin/
  user.schema.ts                                   userSchema
  reset-user-password.schema.ts                    resetUserPasswordSchema
  ref-option.schema.ts                             refOptionSchema

frontend/features/audit/
  components/audit-diff-list.component.tsx         AuditDiffList
backend/features/audit/
  queries/list-audit-logs.query.ts                 listAuditLogsQuery
  queries/get-entry-history.query.ts               getEntryHistoryQuery
  lib/log-app-event.ts                             logAppEvent

backend/features/notifications/
  queries/get-notification-counts.query.ts         getNotificationCountsQuery
```

### 7.18 Frontend shared (`src/frontend/shared/`)
```
components/layout/
  app-shell.component.tsx                          AppShell
  app-sidebar.component.tsx                        AppSidebar
  app-topbar.component.tsx                         AppTopbar
  period-switcher.component.tsx                    PeriodSwitcher        (shows the active period; read-only indicator)
  notification-bell.component.tsx                  NotificationBell
  user-menu.component.tsx                          UserMenu
  page-header.component.tsx                        PageHeader
  criterion-tabs.component.tsx                     CriterionTabs         (links to sibling tables by code)
  locked-period-banner.component.tsx               LockedPeriodBanner
  no-period-state.component.tsx                    NoPeriodState
components/lkps/
  status-badge.component.tsx                       StatusBadge
  ts-chip.component.tsx                            TsChip
  kpi-small-box.component.tsx                      KpiSmallBox
  official-table.component.tsx                     OfficialTable
  criterion-preview-accordion.component.tsx        CriterionPreviewAccordion
  year-card-list.component.tsx                     YearCardList
  matrix-grid.component.tsx                        MatrixGrid
  derived-field.component.tsx                      DerivedField
  evidence-uploader.component.tsx                  EvidenceUploader
  validation-summary.component.tsx                 ValidationSummary
  return-note-alert.component.tsx                  ReturnNoteAlert
  history-drawer.component.tsx                     HistoryDrawer
  entry-form-footer.component.tsx                  EntryFormFooter       (Batal · Simpan Draf · Ajukan, status-aware)
  entry-row-actions.component.tsx                  EntryRowActions       (Ubah · Riwayat · Hapus)
  entry-count-footer.component.tsx                 EntryCountFooter
  table-work-header.component.tsx                  TableWorkHeader       (title, status, Pratinjau, Nihil menu, Periksa Semua, add)
components/form/
  person-picker.component.tsx                      PersonPicker          (single or multi; Dosen / Mahasiswa)
  option-picker.component.tsx                      OptionPicker          (Mitra, Penelitian, PkM; async search)
  ref-select.component.tsx                         RefSelect             (reference list + optional "Lainnya")
  money-input.component.tsx                        MoneyInput
  year-amount-grid.component.tsx                   YearAmountGrid        (money or int per TS year)
  year-select.component.tsx                        YearSelect
  number-input.component.tsx                       NumberInput
  form-field.component.tsx                         FormField             (label, help, error wiring)
components/data/
  data-table.component.tsx                         DataTable
  filter-bar.component.tsx                         FilterBar
  empty-state.component.tsx                        EmptyState
components/overlay/
  entity-sheet.component.tsx                       EntitySheet
  confirm-dialog.component.tsx                     ConfirmDialog
  return-dialog.component.tsx                      ReturnDialog
components/ui/*                                    shadcn primitives (exempt from naming rules)
hooks/
  use-action-form.ts                               useActionForm
  use-file-upload.ts                               useFileUpload
  use-unsaved-changes-guard.ts                     useUnsavedChangesGuard
  use-list-filters.ts                              useListFilters        (URL search params ⇄ filters)
navigation/
  nav-items.ts                                     navItems              (groups, labels, icons, routes, capability)
  filter-nav-items.ts                              filterNavItems
```

### 7.19 Backend engine and infrastructure (`src/backend/`)
```
lkps/registry/
  lkps-table-registry.ts                           lkpsTableRegistry     (31 tables: code, criterion, title, type, entityType, evidence, route)
  get-table-definition.ts                          getTableDefinition
  parse-table-code.ts                              parseTableCode        ('3a2' ⇄ '3.A.2')
lkps/workflow/
  entity-registry.ts                               entityRegistry        (§11)
  get-entity-config.ts                             getEntityConfig
  save-entry.ts                                    saveEntry             (§3.4)
  load-entry.ts                                    loadEntry
  transition-entry-status.ts                       transitionEntryStatus
  resolve-submit-status.ts                         resolveSubmitStatus   (D-12)
  soft-delete-entry.ts                             softDeleteEntry
  build-ownership-filter.ts                        buildOwnershipFilter  (SQL condition for list queries; same rule as assertEntryAccess)
  compute-table-status.ts                          computeTableStatus    (PRD §4.6)
  compute-all-table-statuses.ts                    computeAllTableStatuses
  revalidate-table-paths.ts                        revalidateTablePaths
lkps/validation/
  rule.type.ts                                     (types Rule, RuleCtx)
  rule-registry.ts                                 ruleRegistry
  run-entry-rules.ts                               runEntryRules
  run-table-rules.ts                               runTableRules
  rules/v01-…  to  rules/v24-…                     see §14.3
lkps/compilers/
  compiler-registry.ts                             compilerRegistry
  compile-table.ts                                 compileTable
  compile-criterion.ts                             compileCriterion
  compile-all-tables.ts                            compileAllTables
  compile-identitas.ts                             compileIdentitas
  helpers/…                                        see §15.4
  table-*.compiler.ts, identitas-*.compiler.ts     see §15.5
lkps/render/
  build-lkps-workbook.ts                           buildLkpsWorkbook
  write-table-sheet.ts                             writeTableSheet
  write-cover-sheet.ts                             writeCoverSheet
  write-identitas-sheet.ts                         writeIdentitasSheet
  write-daftar-ps-sheet.ts                         writeDaftarPsSheet
  write-tim-penyusun-sheet.ts                      writeTimPenyusunSheet
  write-summary-sheet.ts                           writeSummarySheet
  build-evidence-zip.ts                            buildEvidenceZip
  build-export-filename.ts                         buildExportFilename
  resolve-evidence-cell.ts                         resolveEvidenceCell   (URL mode vs ZIP-path mode)
db/
  client.ts                                        db
  auth-schema.ts                                   (generated by Better Auth CLI; exempt)
  columns/workflow-columns.ts                      workflowColumns
  columns/timestamps-columns.ts                    timestampsColumns
  enums/*.enum.ts                                  one pgEnum per file (§10.2)
  tables/*.table.ts                                one table per file (§10)
  sql/audit-trigger.sql                            audit function
  sql/apply-audit-triggers.ts                      applyAuditTriggers    (runs the SQL; creates missing triggers idempotently)
  seed/run-seed.ts                                 runSeed
  seed/seed-organisation.ts                        seedOrganisation
  seed/seed-academic-years.ts                      seedAcademicYears
  seed/seed-reference-lists.ts                     seedReferenceLists
  seed/seed-users.ts                               seedUsers
  seed/seed-demo-data.ts                           seedDemoData
shared/
  run-action.ts                                    runAction
  with-actor.ts                                    withActor
  domain-error.ts                                  DomainError
  to-action-result.ts                              toActionResult
  parse-list-filters.ts                            parseListFilters
  json-error-response.ts                           jsonErrorResponse
  get-current-prodi-id.ts                          getCurrentProdiId     (the single prodi; reads DEFAULT_PRODI_CODE)
```

### 7.20 Shared contracts (`src/shared/`)
```
types/
  action-result.type.ts      session-user.type.ts     table-model.type.ts
  entity-type.type.ts        entry-status.type.ts     table-status.type.ts
  period.type.ts             list-filters.type.ts     import-preview.type.ts
  screen-props.type.ts
constants/
  app-routes.ts                                    appRoutes
  entry-status-labels.ts                           entryStatusLabels
  table-status-labels.ts                           tableStatusLabels
  role-labels.ts                                   roleLabels
  lingkup-options.ts                               lingkupOptions        (L / N / I)
  jenis-publikasi-options.ts                       jenisPublikasiOptions
  asal-mahasiswa-options.ts                        asalMahasiswaOptions
  kemampuan-lulusan-options.ts                     kemampuanLulusanOptions (7 rows of 2.B.6)
  upload-limits.ts                                 uploadLimits
format/
  format-number-id.ts                              formatNumberId
  format-rupiah-juta.ts                            formatRupiahJuta
  format-date-id.ts                                formatDateId
  format-academic-year.ts                          formatAcademicYear
  format-file-size.ts                              formatFileSize
schemas/common/
  entry-intent.schema.ts                           entryIntentSchema     ('draft' | 'submit', warningNotes, buktiFileIds, rowVersion)
  year-values.schema.ts                            yearValuesSchema
  require-on-submit.ts                             requireOnSubmit
  zod-error-map-id.ts                                 zodErrorMapId
```

### 7.21 Scripts
```
scripts/check-single-export.ts                     checkSingleExport
scripts/check-unique-stems.ts                      checkUniqueStems
scripts/check-import-boundaries.ts                 checkImportBoundaries
scripts/check-routing-files.ts                     checkRoutingFiles     (page.tsx / route.ts contain only re-exports + metadata)
scripts/check-action-guards.ts                     checkActionGuards     (every *.action.ts calls requireSessionUser; added in Phase 18)
scripts/backup.sh · scripts/restore.sh             (shell; database dump + file archive, Phase 18)
scripts/run-convention-checks.ts                   runConventionChecks   (`pnpm check:conventions`)
```

---

## 8. Navigation

`navItems` (`src/frontend/shared/navigation/nav-items.ts`) is the single definition of the sidebar. `filterNavItems(navItems, user)` removes what the user may not open. Labels are final UI copy.

| Group | Item (label) | Target | Visible when |
|---|---|---|---|
| UMUM | Dashboard | `/dashboard` | `dashboard.full` or `dashboard.my_tasks` |
| IDENTITAS | Identitas Pengusul | `/identitas/pengusul` | `entries.manage_all` |
| IDENTITAS | Tim Penyusun | `/identitas/tim-penyusun` | `entries.manage_all` |
| DATA KINERJA | 1. Budaya Mutu | first accessible page of `kriteria-1` | any page of the criterion is accessible |
| DATA KINERJA | 2. Relevansi Pendidikan | first accessible page of `kriteria-2` | same |
| DATA KINERJA | 3. Relevansi Penelitian | first accessible page of `kriteria-3` | same |
| DATA KINERJA | 4. Relevansi PkM | first accessible page of `kriteria-4` | same |
| DATA KINERJA | 5. Akuntabilitas | first accessible page of `kriteria-5` | same |
| DATA KINERJA | 6. Diferensiasi Misi | first accessible page of `kriteria-6` | same |
| VERIFIKASI | Verifikasi (count badge) | `/verifikasi` | `entries.verify` |
| MASTER DATA | Dosen · Mahasiswa · Mitra · Mata Kuliah · Profil Lulusan · CPL & CPMK | `/master/*` | `master.manage` |
| LAPORAN | Pustaka Bukti | `/bukti` | `evidence.view_all` or `evidence.view_own` |
| LAPORAN | Pratinjau & Ekspor | `/ekspor` | `export.run` |
| LAPORAN | Periode | `/periode` | `period.view` |
| PENGATURAN | Validasi | `/pengaturan/validasi` | `settings.validation` |
| PENGATURAN | Pengguna | `/admin/pengguna` | `users.manage` |
| PENGATURAN | Referensi | `/admin/referensi` | `refs.manage` |
| PENGATURAN | Audit | `/admin/audit` | `audit.view` |

Page access inside a criterion:
- `entries.manage_all` → every page of the criterion, including Pratinjau.
- `entries.manage_own` → only pages of DTPR-owned tables (pages 10, 26–30, 33–36 in §5).
- `curriculum.edit_own` → pages 17 and 19.

`CriterionTabs` shows the accessible sibling pages of the current criterion in instrument order, labelled `<code> <short name>` (for example "3.A.2 Penelitian"), plus "Pratinjau" at the end for users with `preview.view`. Tabs are links. The page lists per criterion are part of `navItems`, so the sidebar and the tabs cannot disagree.

---

## 9. Standard Contracts

### 9.1 Screens
```ts
// src/shared/types/screen-props.type.ts
export type ScreenProps = {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
```
Every `*.screen.tsx` is an async Server Component taking `ScreenProps`, starts with `requireSessionUser()` and `requireCapability(...)` (or the page-access rule in §8), then loads data with queries in parallel.

### 9.2 List filters
```ts
// src/shared/types/list-filters.type.ts
export type ListFilters = {
  q?: string;                  // search text
  status?: EntryStatus;
  yearId?: string;             // academic_year id
  page: number;                // 1-based, default 1
  pageSize: 25 | 50 | 100;     // default 25
  entri?: string;              // entry id to open in the sheet
};
export type ListResult<T> = { rows: T[]; total: number; countsByStatus: Record<EntryStatus, number> };
```
Filters live in the URL query string (`useListFilters` on the client, `parseListFilters` on the server), so lists are linkable and survive reloads. Every `list-*.query.ts` returns a `ListResult`.

### 9.3 Entry input schemas
Every entry schema in `src/shared/schemas/<feature>/` follows one pattern:

```ts
// src/shared/schemas/common/entry-intent.schema.ts
export const entryIntentSchema = z.object({
  id: z.string().uuid().optional(),             // present on update
  rowVersion: z.number().int().optional(),      // required on update
  intent: z.enum(['draft', 'submit']),
  buktiFileIds: z.array(z.string().uuid()).default([]),
  warningNotes: z.record(z.string(), z.string()).default({}),
});
```
```ts
// src/shared/schemas/kriteria-3/publikasi.schema.ts
export const publikasiSchema = entryIntentSchema
  .extend({
    dosenId: z.string().uuid(),                 // identity fields: always required
    judul: z.string().trim().min(1).max(500),
    jenis: z.enum(['IB', 'I', 'S1', 'S2', 'S3', 'S4', 'T']).optional(),
    academicYearId: z.string().uuid().optional(),
    tridharmaId: z.string().uuid().nullable().optional(),
    urlDoi: z.string().url().nullable().optional(),
  })
  .superRefine(requireOnSubmit(['jenis', 'academicYearId']));
```
- Identity fields (marked **ID** in PRD §8) are required always; all other required fields are enforced only when `intent === 'submit'` through `requireOnSubmit` (`src/shared/schemas/common/require-on-submit.ts`).
- Entities with several evidence slots replace `buktiFileIds` with `evidence: Record<slot, string[]>`.
- Error messages are Bahasa Indonesia (set once in `src/shared/schemas/common/zod-error-map-id.ts`, export `zodErrorMapId`).

### 9.4 Dates, numbers, money
- Dates travel as ISO strings (`YYYY-MM-DD`); timestamps as ISO 8601 UTC; shown in WIB with `formatDateId`.
- Money travels as an integer number of rupiah (JavaScript `number` is safe up to 9 × 10¹⁵); stored as `bigint`.
- Decimal inputs accept comma or dot as the decimal separator and are normalised by `NumberInput`.

---

## 10. Data Model

### 10.1 Conventions
- Every table has `id uuid primary key default gen_random_uuid()`, including join tables (which also carry a unique constraint on their pair). The audit log uses `bigserial`.
- Better Auth tables use their generated shape (`text` ids).
- Business tables carry `prodi_id uuid not null references prodi(id)`. Child tables inherit scope from their parent and do not repeat it.
- Time-series values reference `academic_year_id`. TS labels are never stored.
- Money: `bigint` rupiah. Decimals: `numeric(8,2)`.
- Timestamps: `timestamptz`, UTC.
- **Workflow tables** include `workflowColumns`:

| Column | Type | Notes |
|---|---|---|
| `prodi_id` | uuid, not null | |
| `owner_dosen_id` | uuid null → dosen | Null = prodi-owned |
| `status` | enum `entry_status` | `draft`, `submitted`, `verified`, `returned`; default `draft` |
| `return_note` | text null | |
| `warning_notes` | jsonb null | `{ "V-06": "note" }` |
| `submitted_at`, `submitted_by` | timestamptz null, text null → user | |
| `verified_at`, `verified_by` | timestamptz null, text null → user | |
| `self_verified` | boolean, default false | D-12 |
| `created_by`, `updated_by` | text → user | |
| `created_at`, `updated_at` | timestamptz | |
| `row_version` | integer, default 1 | Optimistic concurrency |
| `deleted_at` | timestamptz null | Soft delete |

- Non-workflow tables that need them use `timestampsColumns` (`created_at`, `updated_at`).
- Indexes: `(prodi_id, status)` on every workflow table; `(academic_year_id)` where present; every foreign key; unique constraints as listed. Unique constraints on workflow tables are **partial** (`where deleted_at is null`).

### 10.2 Enums (one file each in `db/enums/`)

| Enum | Values |
|---|---|
| `entry_status` | draft, submitted, verified, returned |
| `period_status` | open, locked |
| `role` | admin_sistem, kaprodi, admin_prodi, dtpr, dosen |
| `lingkup` | L, N, I |
| `tridharma_kind` | penelitian, pkm |
| `dana_kind` | sumber, penggunaan |
| `peran_tridharma` | ketua, anggota |
| `jalur_masuk` | reguler, rpl |
| `status_mahasiswa` | aktif, lulus, cuti, mengundurkan_diri, do |
| `kepemilikan` | M, W |
| `lisensi` | L, P, T |
| `akses_sistem` | lokal, internet |
| `jenis_publikasi` | IB, I, S1, S2, S3, S4, T |
| `asal_mahasiswa` | kota_sama, kota_lain, provinsi_lain, negara_lain, afirmasi, kebutuhan_khusus |
| `period_attachment_kind` | org_chart, roadmap_penelitian, roadmap_pkm, sk_pendirian, sk_pembukaan, sk_akreditasi |
| `audit_action` | insert, update, delete, login, logout, login_failed, submit, verify, return, import, export, period_create, period_lock, period_reopen, nihil_set, nihil_clear, user_create, user_update, user_deactivate, user_activate, password_reset |

Reference-list values (jenis hibah, jenis HKI, …) are **not** enums; they are `ref_option` rows referenced by id.

### 10.3 Core

| Table | Columns | Constraints / notes |
|---|---|---|
| `fakultas` | id, kode, nama | unique kode |
| `prodi` | id, fakultas_id, kode, nama, jenjang | unique kode |
| `academic_year` | id, start_year int, label text | unique start_year; label "2025/2026" |
| `lkps_period` | id, prodi_id, ts_year_id → academic_year, status `period_status`, instrument_version text default '2.1', created_by, created_at, locked_by, locked_at, reopened_by, reopened_at, reopen_reason | unique (prodi_id, ts_year_id); partial unique (prodi_id) where status = 'open' |
| `period_snapshot` | id, period_id, seq int, compiled jsonb, export_file_id → file, created_by, created_at | unique (period_id, seq); never updated |
| `period_attachment` | id, period_id, kind `period_attachment_kind`, file_id → file, created_by, created_at | unique (period_id, kind) |
| `period_table_flag` | id, period_id, table_code text, is_nihil boolean, note text null, updated_by, updated_at | unique (period_id, table_code) |
| `ref_option` | id, prodi_id null, type text, label text, sort int, active boolean default true, meta jsonb null | unique (type, label); `meta.defaultSks` for `jabatan_struktural` |
| `prodi_setting` | id, prodi_id, key text, value jsonb, updated_by, updated_at | unique (prodi_id, key). Keys: `ewmp_sks_range` → `{ "min": 12, "max": 16 }` |
| `import_job` | id, prodi_id, entity text, payload jsonb, created_by, created_at, expires_at | deleted after commit or 24 h |

### 10.4 Access

| Table | Columns | Notes |
|---|---|---|
| `user`, `session`, `account`, `verification` | generated by Better Auth | `user` additional fields: `must_change_password boolean default true`; admin-plugin fields (`role`, `banned`, …) |
| `user_role` | id, user_id → user, prodi_id, role `role` | unique (user_id, prodi_id, role) |
| `user_dosen` | id, user_id → user, dosen_id → dosen | unique user_id; unique dosen_id |

Better Auth's own `user.role` is set to `admin` for Admin Sistem accounts (needed by the admin plugin) and `user` otherwise. LKPS permissions come only from `user_role`.

### 10.5 Master

| Table | Columns | Constraints |
|---|---|---|
| `dosen` | id, prodi_id, nidn, nama, pendidikan_terakhir text, jabatan_fungsional text, archived_at null, timestamps | unique (prodi_id, nidn) |
| `dosen_year` | id, dosen_id, academic_year_id, is_dtpr boolean, jabatan_struktural_id null → ref_option | unique (dosen_id, academic_year_id) |
| `mahasiswa` | id, prodi_id, nim, nama, angkatan_year_id → academic_year, jalur `jalur_masuk`, is_afirmasi, is_kebutuhan_khusus, status `status_mahasiswa`, archived_at null, timestamps | unique (prodi_id, nim) |
| `mitra` | id, prodi_id, nama, jenis_id → ref_option, negara text, archived_at null, timestamps | unique (prodi_id, nama) |
| `mata_kuliah` | id, prodi_id, kode, nama, sks int, semester int, archived_at null, timestamps | unique (prodi_id, kode) |
| `mk_dosen` | id, mata_kuliah_id, dosen_id | unique pair (pengampu) |
| `profil_lulusan` | id, prodi_id, kode, deskripsi, sort int, archived_at null | unique (prodi_id, kode) |
| `cpl` | id, prodi_id, kode, deskripsi, sort int, archived_at null | unique (prodi_id, kode) |
| `cpmk` | id, cpl_id, kode, deskripsi, sort int, archived_at null | unique (cpl_id, kode) |
| `mk_pl` | id, mata_kuliah_id, profil_lulusan_id | unique pair (2.B.1) |
| `cpl_pl` | id, cpl_id, profil_lulusan_id | unique pair (2.B.2) |
| `cpmk_mk` | id, cpmk_id, mata_kuliah_id | unique pair (2.B.3) |

### 10.6 Identitas (all workflow tables)

| Table | Columns besides workflow columns | Constraints |
|---|---|---|
| `identitas_pengusul` | period_id, perguruan_tinggi, upps, jenis_program, nama_ps, alamat, telepon, email, website, sk_pt_nomor, sk_pt_tanggal date, sk_pt_pejabat, sk_ps_nomor, sk_ps_tanggal date, sk_ps_pejabat, tahun_pertama int, peringkat_id → ref_option, sk_akreditasi_nomor | unique (period_id) |
| `upps_program` | period_id, jenis_program, nama_ps, peringkat_id → ref_option, sk_nomor, sk_tanggal date, tanggal_kadaluarsa date, is_self boolean, jumlah_mahasiswa_ts int null | partial unique (period_id) where is_self |
| `tim_penyusun` | period_id, dosen_id null, nama, nidn, jabatan, tanggal_pengisian date, sudah_tanda_tangan boolean | |

All nullable in the database except identity fields, because drafts may be incomplete. "Required" in the PRD is enforced by the Zod `submit` refinement and V-01, not by `NOT NULL`. **This applies to every workflow table below.**

### 10.7 Criterion 1 (workflow tables unless marked child)

| Table | Columns besides workflow columns | Constraints |
|---|---|---|
| `pimpinan_unit` | period_id, unit_kerja, dosen_id null, nama_ketua, periode_jabatan, pendidikan_terakhir, jabatan_fungsional, tupoksi | |
| `dana` | kind `dana_kind`, kategori_id null → ref_option, label_custom text null | partial unique (prodi_id, kind, kategori_id); partial unique (prodi_id, kind, lower(label_custom)) |
| `dana_tahun` (child) | id, dana_id, academic_year_id, amount_rp bigint | unique (dana_id, academic_year_id) |
| `ewmp` | dosen_id, academic_year_id, sks_ps_sendiri, sks_ps_lain_pt_sendiri, sks_pt_lain, sks_penelitian, sks_pkm, sks_man_pt_sendiri, sks_man_pt_lain (all numeric(8,2)) | partial unique (dosen_id, academic_year_id). Total is computed in code (`computeEwmpTotal`), not stored |
| `tendik_kualifikasi` | academic_year_id, jenis_id → ref_option, n_s3, n_s2, n_s1, n_d4, n_d3, n_d2, n_d1, n_sma (int), unit_kerja | partial unique (prodi_id, academic_year_id, jenis_id) |
| `spmi_unit` | period_id, level text, level_custom text null, nama, jumlah_auditor int, certified int, non_certified int, frekuensi_per_tahun int | evidence slots `dokumen_spmi`, `bukti_certified`, `laporan_audit` |

### 10.8 Criterion 2

| Table | Columns besides workflow columns | Constraints |
|---|---|---|
| `mhs_data` | academic_year_id, daya_tampung, pendaftar, pendaftar_afirmasi, pendaftar_kk, baru_reg_diterima, baru_reg_afirmasi, baru_reg_kk, baru_rpl_diterima, baru_rpl_afirmasi, baru_rpl_kk, aktif_reg_diterima, aktif_reg_afirmasi, aktif_reg_kk, aktif_rpl_diterima, aktif_rpl_afirmasi, aktif_rpl_kk (all int) | partial unique (prodi_id, academic_year_id) |
| `mhs_asal` | kategori `asal_mahasiswa`, rincian text null | partial unique (prodi_id, kategori, lower(coalesce(rincian, ''))) |
| `mhs_asal_tahun` (child) | id, mhs_asal_id, academic_year_id, jumlah int | unique pair |
| `mhs_kondisi` | period_id, cohort_year_id → academic_year, aktif_ts int, lulus_ts int, do_ts int | partial unique (period_id, cohort_year_id) |
| `kurikulum_pemetaan` | period_id | unique (period_id). The workflow record for 2.B.1–2.B.3 |
| `lulusan` | academic_year_id (graduation year), jumlah_lulusan, jumlah_terlacak, rata_tunggu_bulan numeric(8,2), infokom, non_infokom, multinasional, nasional, wirausaha | partial unique (prodi_id, academic_year_id) |
| `kepuasan_survey` | academic_year_id (TS), jumlah_responden int | partial unique (prodi_id, academic_year_id) |
| `kepuasan_item` (child) | id, survey_id, kemampuan text (one of the 7 keys), pct_sangat_baik, pct_baik, pct_cukup, pct_kurang numeric(5,2), rencana_tindak_lanjut text | unique (survey_id, kemampuan) |
| `fleksibilitas` | bentuk_id null → ref_option, label_custom text null | partial unique as `dana` |
| `fleksibilitas_tahun` (child) | id, fleksibilitas_id, academic_year_id, jumlah int | unique pair |
| `rekognisi` | sumber_id null → ref_option, sumber_custom text null, jenis_pengakuan text | |
| `rekognisi_tahun` (child) | id, rekognisi_id, academic_year_id, jumlah int | unique pair |

### 10.9 Criteria 3 to 6

Research and PkM share one model with `kind`.

| Table | Columns besides workflow columns | Constraints |
|---|---|---|
| `prasarana` | nama, daya_tampung int, luas_m2 numeric(8,2), kepemilikan `kepemilikan`, lisensi `lisensi`, perangkat text, use_penelitian, use_pkm, use_pendidikan boolean | partial unique (prodi_id, lower(nama)) |
| `tridharma` | kind `tridharma_kind`, judul text, jenis_hibah_id → ref_option, sumber_lingkup `lingkup`, durasi_tahun int | `owner_dosen_id` = Ketua |
| `tridharma_dosen` (child) | id, tridharma_id, dosen_id, peran `peran_tridharma` | unique (tridharma_id, dosen_id); partial unique (tridharma_id) where peran = 'ketua' |
| `tridharma_mahasiswa` (child) | id, tridharma_id, mahasiswa_id | unique pair |
| `tridharma_dana` (child) | id, tridharma_id, academic_year_id, amount_rp bigint | unique pair. A missing row means "not entered" (prints "—") |
| `pengembangan_dtpr` | dosen_id, jenis_id → ref_option, academic_year_id, keterangan text null | `owner_dosen_id` = dosen_id |
| `kerjasama` | kind `tridharma_kind`, judul, mitra_id → mitra, sumber_lingkup `lingkup`, durasi_tahun int | |
| `kerjasama_dana` (child) | id, kerjasama_id, academic_year_id, amount_rp bigint | unique pair |
| `publikasi` | dosen_id, judul, jenis `jenis_publikasi`, academic_year_id, tridharma_id null, url_doi text null | `owner_dosen_id` = dosen_id |
| `diseminasi` | tridharma_id (kind must be pkm), lingkup `lingkup`, academic_year_id, bentuk text null | `owner_dosen_id` = Ketua of the PkM |
| `hki` | kind `tridharma_kind`, judul, jenis_id → ref_option, dosen_id, academic_year_id, tridharma_id null | `owner_dosen_id` = dosen_id |
| `tata_kelola` | period_id, jenis_id null → ref_option, jenis_custom text null, nama_sistem, akses `akses_sistem`, unit_pengelola | |
| `visi_misi` | period_id, visi_pt, visi_upps, visi_keilmuan_ps, misi_pt, misi_upps (text) | unique (period_id) |

### 10.10 Files and audit

| Table | Columns | Notes |
|---|---|---|
| `file` | id, prodi_id, storage_key, original_name, mime, size_bytes int, sha256, uploaded_by, created_at | unique (prodi_id, sha256) |
| `evidence_link` | id, file_id, entity_type text, entity_id uuid, slot text default 'bukti', created_by, created_at | unique (entity_type, entity_id, slot, file_id); index (entity_type, entity_id) |
| `audit_log` | id bigserial, at timestamptz, actor_user_id text null, action `audit_action`, entity_type text null, entity_id text null, parent_entity_type text null, parent_entity_id text null, prodi_id uuid null, before jsonb null, after jsonb null, meta jsonb null | indexes (entity_type, entity_id, at desc), (parent_entity_type, parent_entity_id, at desc), (at). Append-only |

---

## 11. Entity Registry

`entityRegistry` (`src/backend/lkps/workflow/entity-registry.ts`) is the single description of every workflow entity. Generic code (save, submit, verify, return, delete, queue, table status, evidence, history) reads it.

```ts
// src/shared/types/entity-type.type.ts
export type EntityType =
  | 'identitas_pengusul' | 'upps_program' | 'tim_penyusun'
  | 'pimpinan_unit' | 'dana' | 'ewmp' | 'tendik_kualifikasi' | 'spmi_unit'
  | 'mhs_data' | 'mhs_asal' | 'mhs_kondisi' | 'kurikulum_pemetaan' | 'lulusan'
  | 'kepuasan_survey' | 'fleksibilitas' | 'rekognisi'
  | 'prasarana' | 'tridharma' | 'pengembangan_dtpr' | 'kerjasama' | 'publikasi' | 'diseminasi' | 'hki'
  | 'tata_kelola' | 'visi_misi';
```

```ts
type EntityConfig = {
  entityType: EntityType;
  table: PgTable;                                   // the Drizzle table
  ownerMode: 'prodi' | 'dosen' | 'dosen_or_prodi';
  anchor: 'period' | 'year' | 'year_values' | 'none';
  yearRange?: 'ts' | 'ts2_ts' | 'ts3_ts';           // which years are valid / required
  evidenceSlots: { slot: string; label: string; required: boolean | ((row: unknown) => boolean) }[];
  requiredOnSubmit: string[];                       // field names V-01 requires on "Ajukan" (mirrors the Zod submit schema)
  extraEvidenceCheck?: (tx: Tx, row: unknown) => Promise<Violation[]>;  // e.g. identitas_pengusul: the three SK period attachments
  tableCodes: (row: unknown) => string[];           // official tables this row feeds
  childTables?: { table: PgTable; fk: string }[];   // soft-deleted with the parent; included in history
  summary: (row: unknown, ctx: SummaryCtx) => string;  // one line for queues and history
  routeFor: (row: unknown) => string;               // work-screen URL for links
};
```

| Entity | Owner | Anchor | Evidence slots (required?) | Feeds table(s) | Route |
|---|---|---|---|---|---|
| `identitas_pengusul` | prodi | period | — (uses period attachments) | Identitas | `/identitas/pengusul` |
| `upps_program` | prodi | period | — | Identitas (Daftar PS) | `/identitas/pengusul` |
| `tim_penyusun` | prodi | period | — | Identitas (Tim) | `/identitas/tim-penyusun` |
| `pimpinan_unit` | prodi | period | bukti (no) | 1.A.1 | `/kriteria-1/pimpinan-unit` |
| `dana` | prodi | year_values ts2_ts | bukti (yes) | 1.A.2 (`sumber`) / 1.A.3 (`penggunaan`) | `/kriteria-1/sumber-dana` or `/penggunaan-dana` |
| `ewmp` | dosen | year ts | bukti (no) | 1.A.4 | `/kriteria-1/ewmp` |
| `tendik_kualifikasi` | prodi | year ts | bukti (no) | 1.A.5 | `/kriteria-1/kualifikasi-tendik` |
| `spmi_unit` | prodi | period | dokumen_spmi (yes), bukti_certified (when certified > 0), laporan_audit (yes) | 1.B | `/kriteria-1/unit-spmi` |
| `mhs_data` | prodi | year ts3_ts | bukti (no) | 2.A.1 | `/kriteria-2/data-mahasiswa` |
| `mhs_asal` | prodi | year_values ts2_ts | bukti (yes) | 2.A.2 | `/kriteria-2/asal-mahasiswa` |
| `mhs_kondisi` | prodi | period (cohorts ts2_ts) | bukti (no) | 2.A.3 | `/kriteria-2/kondisi-mahasiswa` |
| `kurikulum_pemetaan` | prodi | period | — | 2.B.1, 2.B.2, 2.B.3 | `/kriteria-2/isi-pembelajaran` |
| `lulusan` | prodi | year ts2_ts | bukti (no) | 2.B.4, 2.B.5 | `/kriteria-2/data-lulusan` |
| `kepuasan_survey` | prodi | year ts | bukti (no) | 2.B.6 | `/kriteria-2/kepuasan-pengguna` |
| `fleksibilitas` | prodi | year_values ts2_ts | bukti (yes) | 2.C | `/kriteria-2/fleksibilitas-pembelajaran` |
| `rekognisi` | prodi | year_values ts2_ts | bukti (yes) | 2.D | `/kriteria-2/rekognisi-lulusan` |
| `prasarana` | prodi | none | bukti (yes) | 3.A.1 / 4.A.1 / 5.2 by usage flags | first matching of the three pages |
| `tridharma` | dosen | year_values ts2_ts | bukti (yes) | 3.A.2 (`penelitian`) / 4.A.2 (`pkm`) | `/kriteria-3/penelitian` or `/kriteria-4/pkm` |
| `pengembangan_dtpr` | dosen | year ts2_ts | bukti (yes) | 3.A.3 | `/kriteria-3/pengembangan-dtpr` |
| `kerjasama` | dosen_or_prodi | year_values ts2_ts | bukti (yes) | 3.C.1 / 4.C.1 | `/kriteria-3/kerjasama-penelitian` or `/kriteria-4/kerjasama-pkm` |
| `publikasi` | dosen | year ts2_ts | bukti (yes) | 3.C.2 | `/kriteria-3/publikasi` |
| `diseminasi` | dosen | year ts2_ts | bukti (yes) | 4.C.2 | `/kriteria-4/diseminasi-pkm` |
| `hki` | dosen | year ts2_ts | bukti (yes) | 3.C.3 / 4.C.3 | `/kriteria-3/hki-penelitian` or `/kriteria-4/hki-pkm` |
| `tata_kelola` | prodi | period | bukti (yes) | 5.1 | `/kriteria-5/tata-kelola` |
| `visi_misi` | prodi | period | bukti (no) | 6 | `/kriteria-6/visi-misi` |

Work-screen links open the entry with `?entri=<id>` so the screen can open the sheet on load.

**Which rows belong to the active period** (used by lists, table status and compilers):
- `period`: `period_id` = active period.
- `year`: `academic_year_id` within the entity's `yearRange` of the active period.
- `year_values`: all non-deleted rows of the prodi (their year columns are read for the period's years).
- `none`: all non-deleted rows of the prodi.

---

## 12. Periods and TS Mapping

```ts
// src/backend/features/period/lib/get-ts-years.ts
export type TsLabel = 'TS' | 'TS-1' | 'TS-2' | 'TS-3';
export function getTsYears(tsStartYear: number): { label: TsLabel; startYear: number }[] {
  return [
    { label: 'TS-3', startYear: tsStartYear - 3 },   // [A-08] range constant lives here
    { label: 'TS-2', startYear: tsStartYear - 2 },
    { label: 'TS-1', startYear: tsStartYear - 1 },
    { label: 'TS',   startYear: tsStartYear },
  ];
}
```

- `resolvePeriodYears(period)` joins those to `academic_year` rows and returns `{ ts3, ts2, ts1, ts }` with ids and labels. It is the only place TS labels are produced.
- `getActivePeriodQuery()` returns the open period, or else the most recently locked one (read-only), or `null`.
- `assertPeriodOpen(tx, prodiId)` returns the open period or throws `NO_ACTIVE_PERIOD` / `PERIOD_LOCKED`. It is called by `saveEntry`, the workflow actions, the mapping actions, `savePeriodAttachmentAction` and `setTableNihilAction`. Master-data actions do not call it.

---

## 13. Workflow Implementation

### 13.1 Status transitions (`transitionEntryStatus`)
Implements the table in PRD §7.1. It is the only function that writes `status`, `submitted_*`, `verified_*`, `self_verified` and `return_note`. Illegal transitions throw `DomainError('CONFLICT')`.

`resolveSubmitStatus(user)` returns `{ status: 'verified', selfVerified: true }` when the user has the Kaprodi role, otherwise `{ status: 'submitted', selfVerified: false }` (D-12).

### 13.2 Capabilities (`permissionMatrix`, `canPerform`)

```ts
// src/shared/permissions/capability.type.ts
export type Role = 'admin_sistem' | 'kaprodi' | 'admin_prodi' | 'dtpr' | 'dosen';
export type Capability =
  | 'users.manage' | 'refs.manage' | 'audit.view'
  | 'period.create' | 'period.submit' | 'period.reopen' | 'period.view'
  | 'settings.validation'
  | 'master.manage' | 'import.run'
  | 'entries.manage_all' | 'entries.manage_own' | 'curriculum.edit_own'
  | 'entries.verify' | 'table.nihil'
  | 'preview.view' | 'export.run'
  | 'dashboard.full' | 'dashboard.my_tasks'
  | 'evidence.view_all' | 'evidence.view_own';
```

| Capability | Roles |
|---|---|
| `users.manage`, `period.reopen` | admin_sistem |
| `refs.manage`, `audit.view` | admin_sistem, kaprodi |
| `period.create`, `period.submit`, `settings.validation`, `entries.verify` | kaprodi |
| `period.view` | admin_sistem, kaprodi, admin_prodi |
| `master.manage`, `import.run`, `entries.manage_all`, `table.nihil`, `preview.view`, `export.run`, `dashboard.full`, `evidence.view_all` | kaprodi, admin_prodi |
| `entries.manage_own` | kaprodi, admin_prodi, dtpr |
| `evidence.view_own`, `dashboard.my_tasks` | kaprodi, admin_prodi, dtpr, dosen |
| `curriculum.edit_own` | kaprodi, admin_prodi, dosen |

`canPerform(user, capability)` is a pure function over `user.roles`; it has one unit test per matrix cell.

### 13.3 Ownership (`assertEntryAccess`)
- User has `entries.manage_all` → allowed.
- Else user has `entries.manage_own`, the entity's `ownerMode` is `dosen` or `dosen_or_prodi`, and `row.owner_dosen_id === user.dosenId` → allowed. On create, the owner must equal `user.dosenId`.
- Else → `FORBIDDEN`.
- List queries apply the same rule as a SQL filter.
- Curriculum cells: `assertMataKuliahPengampu` checks `mk_dosen` for users without `entries.manage_all`.

### 13.4 Generic workflow actions
- `submitEntryAction({ entityType, id, rowVersion, warningNotes })`: loads the row, runs rules, transitions.
- `verifyEntriesAction({ entries: [{ entityType, id, rowVersion }] })`: one transaction; if any row is not `submitted` or its version changed, roll back with `CONFLICT`.
- `returnEntryAction({ entityType, id, rowVersion, note })`.
- `deleteEntryAction({ entityType, id, rowVersion })`: permission per PRD §7.1; `assertNoLinkedOutputs` for `tridharma`; `softDeleteEntry` sets `deleted_at` on the row (children stay, hidden with the parent); evidence links are removed.
- Adding an entry to a Nihil table clears the flag inside `saveEntry` (and logs `nihil_clear`).

### 13.5 Table status (`computeTableStatus`)
Input: table code and period. Uses `lkpsTableRegistry` to find the entity type and filter, counts rows by status, checks required years/records per PRD §4.6, checks `period_table_flag`, and counts entries that fail `runEntryRules` with an error. `computeAllTableStatuses` does this for all 31 tables with a small number of grouped queries and is used by the dashboard, export overview and submission check.

---

## 14. Validation Engine

### 14.1 Types

```ts
// src/backend/lkps/validation/rule.type.ts
export type RuleCtx<TRow = unknown> = {
  tx: Tx; prodiId: string; period: ResolvedPeriod; entityType: EntityType;
  row: TRow;                       // the entry as stored, with children loaded
  evidence: Record<string, string[]>;   // slot → file ids
  settings: ProdiSettings;
};
export type Rule<TRow = unknown> = {
  id: string;                      // 'V-06'
  severity: 'error' | 'warning';
  appliesTo: EntityType[];
  when?: (ctx: RuleCtx<TRow>) => boolean;          // e.g. only kind = 'penelitian'
  check: (ctx: RuleCtx<TRow>) => Promise<RuleViolation | null>;   // null = pass
};
```

### 14.2 Behaviour
- Field-level checks (V-01 and format parts of V-03, V-21) live in the Zod schemas: every entity schema has a base shape (drafts) and a `submit` refinement (all required fields). V-01 also has a rule file that reports missing required fields for rows loaded from the database (used by "Periksa Semua" and table status).
- `runEntryRules(ctx)` runs every rule whose `appliesTo` includes the entity type and returns all violations.
- `runTableRules(tableCode, period)` loads every entry of the table and runs `runEntryRules` on each ("Periksa Semua", table status).
- Messages are Bahasa Indonesia, built from the templates in PRD §10.
- Each rule file has a test with one passing and one failing case.

### 14.3 Rule files (`src/backend/lkps/validation/rules/`)

| File | Export | Entities |
|---|---|---|
| `v01-required-fields.rule.ts` | `ruleV01RequiredFields` | all |
| `v02-evidence-required.rule.ts` | `ruleV02EvidenceRequired` | entities with required slots |
| `v03-year-in-period-range.rule.ts` | `ruleV03YearInPeriodRange` | year-anchored entities |
| `v04-master-unique.rule.ts` | `ruleV04MasterUnique` | (used by master actions, not `runEntryRules`) |
| `v05-ewmp-total-positive.rule.ts` | `ruleV05EwmpTotalPositive` | ewmp |
| `v06-ewmp-sks-range.rule.ts` | `ruleV06EwmpSksRange` | ewmp `[A-02]` |
| `v07-ewmp-manajemen-default.rule.ts` | `ruleV07EwmpManajemenDefault` | ewmp |
| `v08-spmi-auditor-count.rule.ts` | `ruleV08SpmiAuditorCount` | spmi_unit |
| `v09-pendaftar-subsets.rule.ts` | `ruleV09PendaftarSubsets` | mhs_data |
| `v10-mahasiswa-baru-vs-pendaftar.rule.ts` | `ruleV10MahasiswaBaruVsPendaftar` | mhs_data |
| `v11-reguler-vs-daya-tampung.rule.ts` | `ruleV11RegulerVsDayaTampung` | mhs_data |
| `v12-asal-vs-mahasiswa-baru.rule.ts` | `ruleV12AsalVsMahasiswaBaru` | mhs_asal |
| `v13-kondisi-vs-cohort.rule.ts` | `ruleV13KondisiVsCohort` | mhs_kondisi |
| `v14-lulusan-consistency.rule.ts` | `ruleV14LulusanConsistency` | lulusan |
| `v15-kepuasan-sums-100.rule.ts` | `ruleV15KepuasanSums100` | kepuasan_survey |
| `v16-fleksibilitas-vs-aktif.rule.ts` | `ruleV16FleksibilitasVsAktif` | fleksibilitas |
| `v17a-tridharma-structure.rule.ts` | `ruleV17aTridharmaStructure` | tridharma |
| `v17b-ketua-is-dtpr.rule.ts` | `ruleV17bKetuaIsDtpr` | tridharma |
| `v18-single-year-in-range.rule.ts` | `ruleV18SingleYearInRange` | publikasi, hki, diseminasi, pengembangan_dtpr |
| `v19-duplicate-title.rule.ts` | `ruleV19DuplicateTitle` | tridharma, publikasi, hki |
| `v20-pengembangan-no-repeat.rule.ts` | `ruleV20PengembanganNoRepeat` | pengembangan_dtpr |
| `v21-file-type-and-size.rule.ts` | `ruleV21FileTypeAndSize` | (used by `uploadFileHandler`) |
| `v22-unique-within-table.rule.ts` | `ruleV22UniqueWithinTable` | dana, fleksibilitas, ewmp, tendik_kualifikasi, prasarana, mhs_asal |
| `v23-kurikulum-coverage.rule.ts` | `ruleV23KurikulumCoverage` | kurikulum_pemetaan |
| `v24-upps-program-dates.rule.ts` | `ruleV24UppsProgramDates` | upps_program |

V-22 is also backed by the partial unique indexes; the rule gives the friendly message before the database rejects the write.

---

## 15. Compilers

### 15.1 TableModel

```ts
// src/shared/types/table-model.type.ts
export type Cell = {
  v: string | number | null;                 // null renders "—"
  kind?: 'text' | 'int' | 'dec' | 'money_juta' | 'percent' | 'check' | 'evidence';
  align?: 'left' | 'right' | 'center';
  colSpan?: number; rowSpan?: number;
  indent?: boolean; bold?: boolean;
  evidence?: { fileId: string; name: string }[];   // for kind 'evidence'
};
export type HeaderCell = { label: string; colSpan?: number; rowSpan?: number };
export type BodyRow = {
  cells: Cell[];
  variant?: 'data' | 'group' | 'derived' | 'subheader';
  entry?: { entityType: EntityType; id: string; status: EntryStatus };   // absent on computed rows
};
export type TableModel = {
  code: string;                    // '3.A.2'
  title: string;                   // exact instrument title, e.g. 'Tabel 3.A.2 Penelitian DTPR, Hibah dan Pembiayaan Penelitian'
  preamble?: { label: string; cell: Cell }[];
  header: HeaderCell[][];          // header rows with spans, exactly as PRD §8
  columnCount: number;
  rows: BodyRow[];
  footer: { label: string; labelColSpan: number; cells: Cell[] }[];
  notes: string[];
  isNihil: boolean; nihilNote?: string;
  status: TableStatus;
  stats: { verified: number; submitted: number; draftOrReturned: number; missingEvidence: number; errors: number; warnings: number };
  issues: { entityType: EntityType; id: string; label: string; problem: string }[];
};
export type CompileCtx = { prodiId: string; period: ResolvedPeriod; mode: 'preview' | 'export' };
```

### 15.2 Rules for every compiler
1. Read non-deleted rows only. `preview` mode: `verified` and `submitted`. `export` mode: `verified` only.
2. Footers and derived rows are computed from **verified** rows only in both modes.
3. Column order, header groups, footer labels and notes come from PRD §8 verbatim.
4. Year columns are produced with `buildTsHeader` and the period's resolved years.
5. Money cells carry rupiah; renderers divide by 1,000,000 and format (kind `money_juta`).
6. A Nihil table returns one body row "Tidak ada data" spanning all columns.
7. Compilers are registered in `compilerRegistry` by `(instrumentVersion, code)`. A future instrument version adds compilers without changing entry code.
8. Compilers do not check permissions; the calling query or handler does.

### 15.3 Example: core query of 3.A.2 (export mode)

```sql
select t.id, t.judul, ro.label as jenis_hibah, t.sumber_lingkup, t.durasi_tahun, d.nama as ketua,
       (select count(*) from tridharma_mahasiswa tm where tm.tridharma_id = t.id)               as jml_mhs,
       max(td.amount_rp) filter (where ay.start_year = $ts - 2)                                 as dana_ts2,
       max(td.amount_rp) filter (where ay.start_year = $ts - 1)                                 as dana_ts1,
       max(td.amount_rp) filter (where ay.start_year = $ts)                                     as dana_ts
from tridharma t
join tridharma_dosen kd on kd.tridharma_id = t.id and kd.peran = 'ketua'
join dosen d            on d.id = kd.dosen_id
left join ref_option ro on ro.id = t.jenis_hibah_id
join tridharma_dana td  on td.tridharma_id = t.id
join academic_year ay   on ay.id = td.academic_year_id and ay.start_year between $ts - 2 and $ts
where t.prodi_id = $prodi and t.kind = 'penelitian' and t.deleted_at is null and t.status = 'verified'
group by t.id, ro.label, d.nama
order by d.nama, t.judul;
```

The inner join on `tridharma_dana` restricted to TS-2..TS implements "appears when it has funding entered for at least one of TS-2..TS".

### 15.4 Core and helper files (`src/backend/lkps/compilers/`)
```
compiler-registry.ts                 compilerRegistry
compile-table.ts                     compileTable
compile-criterion.ts                 compileCriterion
compile-all-tables.ts                compileAllTables
compile-identitas.ts                 compileIdentitas
helpers/build-ts-header.ts           buildTsHeader
helpers/build-nihil-row.ts           buildNihilRow
helpers/build-evidence-cell.ts       buildEvidenceCell
helpers/load-entry-evidence-map.ts   loadEntryEvidenceMap
helpers/sum-cells.ts                 sumCells
helpers/average-cells.ts             averageCells
helpers/percent-of.ts                percentOf
helpers/weighted-average.ts          weightedAverage          [A-09]
helpers/compute-ewmp-total.ts        computeEwmpTotal
helpers/collect-table-issues.ts      collectTableIssues
helpers/compile-prasarana-table.ts   compilePrasaranaTable    (shared body for 3.A.1 / 4.A.1 / 5.2)
helpers/compile-tridharma-table.ts   compileTridharmaTable    (shared body for 3.A.2 / 4.A.2)
helpers/compile-kerjasama-table.ts   compileKerjasamaTable    (shared body for 3.C.1 / 4.C.1)
helpers/compile-hki-table.ts         compileHkiTable          (shared body for 3.C.3 / 4.C.3)
helpers/compile-dana-table.ts        compileDanaTable         (shared body for 1.A.2 / 1.A.3)
```

### 15.5 Compiler files (31 tables + 3 Identitas)

| File | Export |
|---|---|
| `identitas-pengusul.compiler.ts` | `compileIdentitasPengusul` |
| `identitas-daftar-ps.compiler.ts` | `compileIdentitasDaftarPs` |
| `identitas-tim-penyusun.compiler.ts` | `compileIdentitasTimPenyusun` |
| `table-1a1-pimpinan-unit.compiler.ts` | `compileTable1A1PimpinanUnit` |
| `table-1a2-sumber-dana.compiler.ts` | `compileTable1A2SumberDana` |
| `table-1a3-penggunaan-dana.compiler.ts` | `compileTable1A3PenggunaanDana` |
| `table-1a4-ewmp.compiler.ts` | `compileTable1A4Ewmp` |
| `table-1a5-kualifikasi-tendik.compiler.ts` | `compileTable1A5KualifikasiTendik` |
| `table-1b-unit-spmi.compiler.ts` | `compileTable1BUnitSpmi` |
| `table-2a1-data-mahasiswa.compiler.ts` | `compileTable2A1DataMahasiswa` |
| `table-2a2-asal-mahasiswa.compiler.ts` | `compileTable2A2AsalMahasiswa` |
| `table-2a3-kondisi-mahasiswa.compiler.ts` | `compileTable2A3KondisiMahasiswa` |
| `table-2b1-isi-pembelajaran.compiler.ts` | `compileTable2B1IsiPembelajaran` |
| `table-2b2-pemetaan-cpl-pl.compiler.ts` | `compileTable2B2PemetaanCplPl` |
| `table-2b3-peta-pemenuhan-cpl.compiler.ts` | `compileTable2B3PetaPemenuhanCpl` |
| `table-2b4-masa-tunggu-lulusan.compiler.ts` | `compileTable2B4MasaTungguLulusan` |
| `table-2b5-bidang-kerja-lulusan.compiler.ts` | `compileTable2B5BidangKerjaLulusan` |
| `table-2b6-kepuasan-pengguna.compiler.ts` | `compileTable2B6KepuasanPengguna` |
| `table-2c-fleksibilitas-pembelajaran.compiler.ts` | `compileTable2CFleksibilitasPembelajaran` |
| `table-2d-rekognisi-lulusan.compiler.ts` | `compileTable2DRekognisiLulusan` |
| `table-3a1-sarana-penelitian.compiler.ts` | `compileTable3A1SaranaPenelitian` |
| `table-3a2-penelitian.compiler.ts` | `compileTable3A2Penelitian` |
| `table-3a3-pengembangan-dtpr.compiler.ts` | `compileTable3A3PengembanganDtpr` |
| `table-3c1-kerjasama-penelitian.compiler.ts` | `compileTable3C1KerjasamaPenelitian` |
| `table-3c2-publikasi.compiler.ts` | `compileTable3C2Publikasi` |
| `table-3c3-hki-penelitian.compiler.ts` | `compileTable3C3HkiPenelitian` |
| `table-4a1-sarana-pkm.compiler.ts` | `compileTable4A1SaranaPkm` |
| `table-4a2-pkm.compiler.ts` | `compileTable4A2Pkm` |
| `table-4c1-kerjasama-pkm.compiler.ts` | `compileTable4C1KerjasamaPkm` |
| `table-4c2-diseminasi-pkm.compiler.ts` | `compileTable4C2DiseminasiPkm` |
| `table-4c3-hki-pkm.compiler.ts` | `compileTable4C3HkiPkm` |
| `table-51-tata-kelola.compiler.ts` | `compileTable51TataKelola` |
| `table-52-sarana-pendidikan.compiler.ts` | `compileTable52SaranaPendidikan` |
| `table-6-visi-misi.compiler.ts` | `compileTable6VisiMisi` |

Each compiler has a golden test: seed a fixture, compile, compare with the expected `TableModel` (header, rows, footer, notes).

---

## 16. Evidence & Storage

### 16.1 Storage adapter

```ts
// src/backend/storage/storage-adapter.type.ts
export interface StorageAdapter {
  put(key: string, body: Buffer, mime: string): Promise<void>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}
```

`getStorage()` returns the local-disk adapter rooted at `STORAGE_LOCAL_PATH`. Adding S3 later means one new file (`create-s3-adapter.ts`) and one branch in `getStorage`.

### 16.2 Upload (`uploadFileHandler`, `POST /api/files`, multipart field `file`)
1. `requireSessionUser`; reject bodies above `MAX_UPLOAD_MB` (also checked after reading).
2. Read the file into a Buffer. `detectFileType` (content sniffing). Run V-21. Reject anything other than PDF, JPEG, PNG with HTTP 415; too large with 413.
3. `hashFileSha256`. If `findFileByHash(prodiId, hash)` finds a row, return it (no second copy).
4. `buildStorageKey` → `{prodiId}/{yyyy}/{mm}/{uuid}.{ext}`; `storage.put`; insert `file`.
5. Respond `{ fileId, name, size, mime }`. Linking happens when the entry is saved (`syncEntryEvidence`).

### 16.3 Download (`downloadFileHandler`, `GET /api/files/:fileId`)
`assertFileReadable(user, file)`: allowed with `evidence.view_all`; otherwise the user must be the uploader or be able to read at least one linked entry. Respond with the bytes, `Content-Type` from the stored mime, `Content-Disposition: inline` for PDF/images with the original file name, `X-Content-Type-Options: nosniff`, `Cache-Control: private, no-store`.

### 16.4 Linking
`syncEntryEvidence(tx, { entityType, entityId, slot, fileIds })` inserts missing links and deletes links not in the list. Files are never deleted by unlinking. `deleteUnlinkedFileAction` deletes a file only when it has no links and no period attachment.

---

## 17. Import (Dosen, Mahasiswa)

| Step | Implementation |
|---|---|
| Template | `build*ImportTemplate` creates the workbook (header row, 2 sample rows, data-validation dropdowns); handler streams it |
| Preview | Handler reads the upload (≤ 2 MB, ≤ 2,000 rows) with `readImportWorkbook`; each row goes through `validate*ImportRow` (Zod row schema, enum mapping, duplicate-in-file check, exists-in-database check); result stored with `saveImportJob`; response is an `ImportPreview` (`jobId`, counts, first 200 problem rows) |
| Error report | `downloadImportErrorReportHandler` builds the `.xlsx` with `buildImportErrorReport` from the stored job |
| Commit | `commit*ImportAction({ jobId, updateExisting })` loads the job (must belong to the user and not be expired), upserts valid rows in one `withActor` transaction (for Dosen also the TS-year `dosen_year` row), deletes the job, logs an `import` event with counts |

---

## 18. Excel Export

| Item | Specification |
|---|---|
| Entry point | The four handlers call `compileTable` / `compileCriterion` / `compileAllTables` in `export` mode (or load the snapshot for a locked period), then `buildLkpsWorkbook` |
| `writeTableSheet(ws, model, opts)` | Row 1 title (bold). Optional red banner row when `status !== 'complete'`. Preamble rows. Header rows with `mergeCells` from spans; bold; fill `F1F3F5`; thin borders. A column-number row `(1) (2) …`. Body rows. Footer rows bold with fill `F8F9FA`. Blank row, then notes. Column widths from content (min 8, max 60). Wrap text on. |
| Number formats | `int` → `0`; `dec` → `0.00`; `money_juta` → value ÷ 1,000,000 with `#,##0.00`; `percent` → `0.0` followed by "%" text in the header, not the cell; `check` → "√" |
| Evidence cells | `resolveEvidenceCell(cell, mode)`: URL mode → hyperlink `${PUBLIC_BASE_URL}/api/files/{id}` with the file name as text; ZIP mode → relative path text and hyperlink `bukti/<code>/<row>-<safe-name>` |
| Full export | Sheets in order: `Sampul`, `Identitas`, `Daftar PS`, `Tim Penyusun`, the 31 tables in instrument order, `Ringkasan` |
| ZIP | `buildEvidenceZip` streams a ZIP with the workbook at the root and files under `bukti/<code>/`; a file linked to several rows is stored once per row path |
| File name | `buildExportFilename({ prodi, tsLabel, scope, date, ext })` |
| Audit | Each handler calls `logAppEvent('export', { scope, code })` |
| Performance | Full workbook under 10 s at reference volume |

---

## 19. Audit Trail

### 19.1 Trigger

```sql
-- src/backend/db/sql/audit-trigger.sql
create or replace function audit_row() returns trigger language plpgsql as $$
declare
  v_actor  text  := nullif(current_setting('app.user_id', true), '');
  v_new    jsonb := case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end;
  v_old    jsonb := case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end;
  v_row    jsonb := coalesce(v_new, v_old);
  v_fk     text  := case when tg_nargs >= 1 then tg_argv[0] end;   -- parent fk column
  v_parent text  := case when tg_nargs >= 2 then tg_argv[1] end;   -- parent table name
begin
  insert into audit_log(at, actor_user_id, action, entity_type, entity_id,
                        parent_entity_type, parent_entity_id, prodi_id, before, after)
  values (now(), v_actor, lower(tg_op)::audit_action, tg_table_name, v_row->>'id',
          v_parent, case when v_fk is not null then v_row->>v_fk end,
          nullif(v_row->>'prodi_id','')::uuid, v_old, v_new);
  return coalesce(new, old);
end $$;
```

Created by a migration for every business table. Parent tables: `create trigger trg_audit after insert or update or delete on tridharma for each row execute function audit_row();`. Child tables pass their parent: `… on tridharma_dana … execute function audit_row('tridharma_id', 'tridharma');`.

Not audited: `audit_log`, `session`, `verification`, `import_job`, `period_snapshot` (already immutable).

### 19.2 Actor
```ts
// src/backend/shared/with-actor.ts
export async function withActor<T>(userId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_id', ${userId}, true)`);
    return fn(tx);
  });
}
```
All business writes run inside `withActor`. A write outside it is recorded with a null actor, which the integration tests treat as a failure.

### 19.3 App events
`logAppEvent(tx | db, { action, actorUserId, entityType?, entityId?, meta? })` inserts workflow and system events (PRD FR-16 AC2). `getEntryHistoryQuery(entityType, id)` returns rows where the entity is the row itself or the parent, newest first; `AuditDiffList` shows changed keys, hiding technical columns (`updated_at`, `row_version`, …).

### 19.4 Immutability
The application database role is granted `INSERT` and `SELECT` on `audit_log`, not `UPDATE` or `DELETE` (set in the migration that creates the role grants; in local Docker the single role is acceptable and the grant statement is still present for hosted setups).

---

## 20. Auth & Security

### 20.1 Better Auth configuration (`authInstance`)
- `database`: Drizzle adapter, provider `pg`, schema from `db/auth-schema.ts`.
- `emailAndPassword`: enabled, sign-up disabled, minimum password length 10.
- `user.additionalFields`: `mustChangePassword` (boolean, default true).
- `session`: `expiresIn` = `SESSION_IDLE_MINUTES` × 60, `updateAge` = 300 seconds (sliding expiry gives the idle timeout).
- `rateLimit`: enabled, with a custom rule for the email sign-in path: 5 requests per 15 minutes.
- `plugins`: `admin()`, then `nextCookies()` last.
- Account creation, password reset and deactivation use the admin plugin's server API from `createUserAction`, `resetUserPasswordAction` and `setUserActiveAction` (ban/unban). The seed script creates the first accounts through the same server API or a documented equivalent; confirm the exact calls in the Better Auth docs for the installed version.
- `signInAction` calls the server sign-in API and logs `login` or `login_failed` (no email stored for failures beyond a hash in `meta`).

### 20.2 Session user

```ts
// src/shared/types/session-user.type.ts
export type SessionUser = {
  id: string; name: string; email: string;
  roles: Role[]; prodiId: string;
  dosenId: string | null;
  mustChangePassword: boolean;
};
```

`requireSessionUser()` (cached per request with React `cache`): no session → redirect `/login`; `mustChangePassword` and not already on `/ganti-kata-sandi` → redirect there. `requireCapability(capability)` → redirect `/forbidden` when missing. `app/(app)/layout.tsx` calls `requireSessionUser()` so every app page is gated even before its own check.

### 20.3 Controls

| Area | Control |
|---|---|
| Authorisation | `canPerform` + ownership in every action, query and handler |
| CSRF | Server Actions' origin check; handlers that change state verify `Origin` against `PUBLIC_BASE_URL` |
| Input | Zod at every boundary; parameterised SQL only |
| Files | Content-type sniffing, size cap, random storage keys, private storage, `nosniff` |
| Headers | CSP (`default-src 'self'`; fonts and inline styles as needed by Next.js), `frame-ancestors 'none'`, `Referrer-Policy: same-origin`, set in `next.config.ts` |
| Secrets | `.env` only; `.env.example` lists keys without values |
| Errors | Users see friendly messages; stack traces only in server logs |

---

## 21. Environment & Deployment

### 21.1 `.env.example`
```
DATABASE_URL=postgres://lkps:lkps@localhost:5432/lkps
TEST_DATABASE_URL=postgres://lkps:lkps@localhost:5432/lkps_test
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
PUBLIC_BASE_URL=http://localhost:3000
STORAGE_DRIVER=local
STORAGE_LOCAL_PATH=./.data/uploads
MAX_UPLOAD_MB=5
SESSION_IDLE_MINUTES=60
DEFAULT_PRODI_CODE=SI
TZ=Asia/Jakarta
```

### 21.2 `docker-compose.yml`
```yaml
services:
  db:
    image: postgres:17
    environment: { POSTGRES_USER: lkps, POSTGRES_PASSWORD: lkps, POSTGRES_DB: lkps, TZ: Asia/Jakarta }
    volumes: [ "pgdata:/var/lib/postgresql/data" ]
    ports: [ "5432:5432" ]
  app:
    build: { context: ., dockerfile: docker/Dockerfile }
    env_file: .env
    environment: { DATABASE_URL: "postgres://lkps:lkps@db:5432/lkps", STORAGE_LOCAL_PATH: /data/uploads }
    depends_on: [ db ]
    ports: [ "3000:3000" ]
    volumes: [ "uploads:/data/uploads" ]
    profiles: [ "full" ]
  backup:
    image: postgres:17
    entrypoint: [ "/bin/sh", "/backup.sh" ]
    environment: { PGPASSWORD: lkps }
    volumes: [ "./docker/backup.sh:/backup.sh:ro", "backups:/backups", "uploads:/data/uploads:ro" ]
    depends_on: [ db ]
    profiles: [ "full" ]
volumes: { pgdata: {}, uploads: {}, backups: {} }
```

- Development: `docker compose up -d db` + `pnpm dev`.
- UAT: `docker compose --profile full up -d --build`; the app container runs migrations on start.
- `backup.sh`: daily `pg_dump -Fc` and a tar of uploads at 01:00 WIB, keep 14 days.
- The test database `lkps_test` is created by the Vitest global setup.

### 21.3 `package.json` scripts
```
dev, build, start, lint, typecheck, test, test:e2e,
check:conventions  → tsx scripts/run-convention-checks.ts
verify             → pnpm lint && pnpm typecheck && pnpm check:conventions && pnpm test
db:generate        → drizzle-kit generate
db:migrate         → drizzle-kit migrate && tsx src/backend/db/sql/apply-audit-triggers.ts
db:seed            → tsx src/backend/db/seed/run-seed.ts
db:reset           → drop schema, db:migrate, db:seed (refuses when NODE_ENV=production)
```
(`apply-audit-triggers.ts` exports `applyAuditTriggers`; it runs `audit-trigger.sql` and creates missing triggers idempotently.)

---

## 22. Testing

| Level | Tool | What |
|---|---|---|
| Unit | Vitest | Zod schemas (draft vs submit), `getTsYears`, `canPerform` (every cell), formatters, `computeTotalMahasiswa*`, `resolveSubmitStatus`, every rule (pass + fail) |
| Integration | Vitest + `lkps_test` | `saveEntry` (create, update, conflict, submit with errors/warnings, Kaprodi auto-verify), ownership, `verifyEntriesAction` atomicity, `assertPeriodOpen`, audit rows with actor, `computeTableStatus`, Nihil |
| Compiler | Vitest + fixtures | Golden `TableModel` per compiler |
| Export | Vitest | Build workbook, read back with ExcelJS: sheet names, merged headers, totals, verified-only rows, banner |
| End-to-end | Playwright | One spec per feature phase, plus the seven journeys listed in Phase 18 |
| Conventions | scripts | Single export, unique stems, import boundaries, routing files |

Test helpers live in `tests/helpers/` (`create-test-user.ts`, `create-test-period.ts`, `reset-test-database.ts`, …), one function per file.

---

## 23. Assumption Isolation Map

| Assumption | Single place to change |
|---|---|
| A-01 totals in 2.A.1 / footer of 2.A.2 | `compute-total-mahasiswa-baru.ts`, `compute-total-mahasiswa-aktif.ts`, footer block of `table-2a2-asal-mahasiswa.compiler.ts` |
| A-02 EWMP range | `prodi_setting` key `ewmp_sks_range` (default in `seed-reference-lists.ts`) |
| A-03 shared lulusan counts | `lulusan` table + `data-lulusan.schema.ts` + `DataLulusanForm` |
| A-04 one DTPR per publication/HKI | `publikasi.dosen_id`, `hki.dosen_id` |
| A-05 reference seeds | `seed-reference-lists.ts` (and the admin screen at run time) |
| A-08 2.A.1 year range | `get-ts-years.ts` and `yearRange: 'ts3_ts'` of `mhs_data` |
| A-09 weighted waiting time | `helpers/weighted-average.ts` call in `table-2b4-masa-tunggu-lulusan.compiler.ts` |

---

## 24. Open Items

| ID | Item | Priority | Owner | Recommendation |
|---|---|---|---|---|
| TRD-OI-01 | Hosting (PRD OI-01) decides whether URL or ZIP evidence is primary and whether an S3 adapter is needed | High | Satriya / Kaprodi | Both export modes are built; add the adapter when decided |
| TRD-OI-02 | Exact Better Auth admin-plugin calls for server-side user creation and seeding | Medium | Agent in Phase 02 | Verify against current docs; record the result in the phase log |
| TRD-OI-03 | About 450 source files because of one-function-per-file | Low | Novriani | Keep the convention checks in CI from Phase 00 |
