# DESIGN — Sistem Informasi LKPS

**Companion to:** `PRD.md` v1.0, `TRD.md` v1.0
**Visual direction:** MyAtma orange on an AdminLTE-style admin layout, built with shadcn/ui and Tailwind CSS v4
**Status:** Baseline for build

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.1 | 2026-11-08 | Satriya Wardhana | First draft: tokens, theme, layout, components, screen patterns, copy |
| 1.0 | 2026-11-13 | Satriya Wardhana | Aligned with PRD/TRD 1.0: component paths, status set without revisions, Nihil, form footer states, per-screen specifications, full UI copy deck, state catalogue |

---

## 1. Design Principles

1. **Instrument-faithful.** Table names, column names and order follow the LAM INFOKOM instrument exactly (PRD §8). Users should recognise every preview as "the official table".
2. **Status first.** Every entry, table and period shows its status at a glance, always as an icon plus a text label, never colour alone.
3. **Enter once, see everywhere.** Linked data (lecturers, students, partners, facilities) is picked from lists, never retyped. Computed values look different from inputs.
4. **Dense but calm.** Compact tables and forms, generous space between sections, one primary action per screen.
5. **Familiar.** AdminLTE's mental model: dark sidebar, white top bar, grey content area, white cards.
6. **No scoring signals.** No gauges, traffic lights on indicator values, targets or rankings anywhere (PRD §1.3).

---

## 2. Brand Placeholders

No official MyAtma assets are available (PRD OI-05). Values marked `[CONFIRM]` are working placeholders chosen to pass contrast. When official values arrive, change only the tokens in §3 and §4.

| Asset | Placeholder | Status |
|---|---|---|
| Primary orange | `#F07316` (brand-500) | [CONFIRM] |
| Logo | A 32 px rounded square in brand-500 with the white letters "LK", next to the text "LKPS" / "Atma Jaya" | [CONFIRM] official logo and usage rules |
| Typeface | Source Sans 3 (successor of AdminLTE's Source Sans Pro); Source Code Pro for codes | [CONFIRM] |

---

## 3. Design Tokens

### 3.1 Brand scale `[CONFIRM]`

| Token | Hex | Use |
|---|---|---|
| brand-50 | `#FFF4EB` | Selected row, hover background, selected year card |
| brand-100 | `#FFE4CC` | Highlight chips |
| brand-200 | `#FFC999` | — |
| brand-300 | `#FFA866` | — |
| brand-400 | `#FB8A33` | Decorative only |
| brand-500 | `#F07316` | **MyAtma orange.** Decorative only: logo mark, selected-row bar, selected-card border. Never for text or as a background under white text (2.9:1) |
| brand-600 | `#D9620B` | Focus ring, icons on white (≥ 3:1) |
| brand-700 | `#B4500A` | **Primary action:** buttons, links, active nav fill (white text 5.1:1) |
| brand-800 | `#8F400C` | Primary hover / pressed, accent text |
| brand-900 | `#74350E` | — |

### 3.2 Neutrals

| Token | Hex | Use |
|---|---|---|
| background | `#F4F6F9` | Content area |
| card | `#FFFFFF` | Cards, tables, forms, top bar |
| foreground | `#212529` | Body text |
| muted-foreground | `#5C636A` | Helper text, labels (≥ 5.6:1) |
| border | `#DEE2E6` | Card and table borders |
| input | `#CED4DA` | Input borders |
| secondary / muted | `#E9ECEF` | Secondary buttons, neutral badges, derived fields |
| table-head | `#F1F3F5` | Official-table header fill |
| table-agg | `#F8F9FA` | Footer rows, work-list header |
| sidebar | `#1F2329` | Sidebar background |
| sidebar-foreground | `#C2C7D0` | Sidebar text |
| sidebar-muted | `#8A929C` | Sidebar group labels |
| sidebar-accent | `#2C3238` | Sidebar hover |
| sidebar-border | `#343A40` | Sidebar dividers |

### 3.3 Semantic

| Role | Solid | Soft background | Soft text |
|---|---|---|---|
| success | `#198754` | `#D1E7DD` | `#0F5132` |
| warning | `#B8860B` (icons only) | `#FFF3CD` | `#664D03` |
| danger | `#DC3545` | `#F8D7DA` | `#842029` |
| info | `#0B7285` | `#CFF4FC` | `#055160` |
| neutral | `#6C757D` | `#E9ECEF` | `#495057` |

### 3.4 Status mapping

| Object | Status | Label | Tone | Icon (lucide) |
|---|---|---|---|---|
| Entry | draft | Draf | neutral | `FilePen` |
| Entry | submitted | Diajukan | info | `Send` |
| Entry | verified | Terverifikasi | success | `CircleCheck` |
| Entry | returned | Dikembalikan | danger | `Undo2` |
| Table | not_started | Belum mulai | neutral | `Circle` |
| Table | incomplete | Belum lengkap | danger | `CircleAlert` |
| Table | awaiting_verification | Menunggu verifikasi | warning | `Clock` |
| Table | complete | Lengkap | success | `CircleCheck` |
| Table | complete + Nihil | Lengkap · Nihil | success | `CircleSlash` |
| Period | open | Terbuka | info | `LockOpen` |
| Period | locked | Terkunci | neutral | `Lock` |
| Evidence | present | Ada | success | `Paperclip` |
| Evidence | missing (required) | Belum ada | danger | `Paperclip` |
| Evidence | none (optional) | – | neutral text "–" | none |
| Validation | error | (message) | danger text + icon | `CircleX` |
| Validation | warning | (message) | warning panel | `TriangleAlert` |
| User | active / inactive | Aktif / Nonaktif | success / neutral | `UserCheck` / `UserX` |

### 3.5 Typography

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| display | 28 / 36 | 700 | Login headline |
| h1 | 22 / 30 | 700 | Page title |
| h2 | 17 / 24 | 600 | Card title, sheet title |
| h3 | 15 / 22 | 600 | Form section, accordion title |
| body | 14 / 21 | 400 | Default |
| body-sm | 13 / 19 | 400 | Helper text, secondary line in tables |
| caption | 12 / 16 | 600, uppercase, +0.04em | Work-list column headers, KPI labels, sidebar groups |
| code | 13 / 19 | 500, Source Code Pro | NIDN, NIM, table codes, year chips |

Numbers use `tabular-nums` everywhere. Minimum text size is 12 px. Official-table text is 13 px.

### 3.6 Spacing, radius, elevation

| Token | Value |
|---|---|
| Spacing | 4 px base: 4, 8, 12, 16, 20, 24, 32 |
| Content padding | 24 px (16 px below 768 px) |
| Card padding | 16 px body; 12 × 16 px header and footer |
| Gap between cards | 16 px |
| Radius | 6 px (`--radius: 0.375rem`); badges fully rounded |
| Card shadow | `0 0 1px rgba(0,0,0,.125), 0 1px 3px rgba(0,0,0,.2)` |
| Control height | 36 px default; 32 px in table rows; 40 px on login |
| Hit target | ≥ 32 × 32 px with ≥ 8 px gap |
| Sidebar width | 250 px; 64 px collapsed |
| Top bar height | 56 px |
| Sheet width | 640 px (720 px for Penelitian, PkM, Data Mahasiswa) |

### 3.7 Icons
lucide-react. 16 px in tables and buttons, 18 px in navigation, 20 px in KPI boxes, stroke 1.75. Icon-only buttons have `aria-label` and a tooltip.

| Navigation item | Icon |
|---|---|
| Dashboard | `LayoutDashboard` |
| Identitas Pengusul / Tim Penyusun | `IdCard` / `Users` |
| 1. Budaya Mutu | `ShieldCheck` |
| 2. Relevansi Pendidikan | `GraduationCap` |
| 3. Relevansi Penelitian | `FlaskConical` |
| 4. Relevansi PkM | `HandHeart` |
| 5. Akuntabilitas | `Scale` |
| 6. Diferensiasi Misi | `Target` |
| Verifikasi | `ClipboardCheck` |
| Master Data items | `Database` |
| Pustaka Bukti | `FolderOpen` |
| Pratinjau & Ekspor | `FileSpreadsheet` |
| Periode | `CalendarRange` |
| Validasi / Pengguna / Referensi / Audit | `SlidersHorizontal` / `UserCog` / `ListTree` / `History` |

---

## 4. Theme (copy into `app/globals.css`)

```css
@import "tailwindcss";
@import "tw-animate-css";

:root {
  --radius: 0.375rem;

  /* brand [CONFIRM] */
  --brand-50:#FFF4EB; --brand-100:#FFE4CC; --brand-200:#FFC999; --brand-300:#FFA866; --brand-400:#FB8A33;
  --brand-500:#F07316; --brand-600:#D9620B; --brand-700:#B4500A; --brand-800:#8F400C; --brand-900:#74350E;

  --background:#F4F6F9;  --foreground:#212529;
  --card:#FFFFFF;        --card-foreground:#212529;
  --popover:#FFFFFF;     --popover-foreground:#212529;
  --primary:#B4500A;     --primary-foreground:#FFFFFF;
  --secondary:#E9ECEF;   --secondary-foreground:#212529;
  --muted:#E9ECEF;       --muted-foreground:#5C636A;
  --accent:#FFF4EB;      --accent-foreground:#8F400C;
  --destructive:#DC3545; --destructive-foreground:#FFFFFF;
  --border:#DEE2E6;      --input:#CED4DA;  --ring:#D9620B;

  --success:#198754; --success-soft:#D1E7DD; --success-soft-fg:#0F5132;
  --warning:#B8860B; --warning-soft:#FFF3CD; --warning-soft-fg:#664D03;
  --danger:#DC3545;  --danger-soft:#F8D7DA;  --danger-soft-fg:#842029;
  --info:#0B7285;    --info-soft:#CFF4FC;    --info-soft-fg:#055160;
  --neutral-soft:#E9ECEF; --neutral-soft-fg:#495057;

  --table-head:#F1F3F5; --table-agg:#F8F9FA;

  --sidebar:#1F2329; --sidebar-foreground:#C2C7D0; --sidebar-muted:#8A929C;
  --sidebar-primary:#B4500A; --sidebar-primary-foreground:#FFFFFF;
  --sidebar-accent:#2C3238;  --sidebar-accent-foreground:#FFFFFF;
  --sidebar-border:#343A40;  --sidebar-ring:#D9620B;
}

@theme inline {
  --font-sans: var(--font-source-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-source-code), ui-monospace, monospace;
  --radius-sm: calc(var(--radius) - 2px); --radius-md: var(--radius); --radius-lg: calc(var(--radius) + 2px);

  --color-background: var(--background); --color-foreground: var(--foreground);
  --color-card: var(--card); --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover); --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary); --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary); --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted); --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent); --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive); --color-border: var(--border); --color-input: var(--input); --color-ring: var(--ring);

  --color-brand-50: var(--brand-50);   --color-brand-100: var(--brand-100); --color-brand-500: var(--brand-500);
  --color-brand-600: var(--brand-600); --color-brand-700: var(--brand-700); --color-brand-800: var(--brand-800);

  --color-success: var(--success); --color-success-soft: var(--success-soft); --color-success-soft-fg: var(--success-soft-fg);
  --color-warning: var(--warning); --color-warning-soft: var(--warning-soft); --color-warning-soft-fg: var(--warning-soft-fg);
  --color-danger: var(--danger);   --color-danger-soft: var(--danger-soft);   --color-danger-soft-fg: var(--danger-soft-fg);
  --color-info: var(--info);       --color-info-soft: var(--info-soft);       --color-info-soft-fg: var(--info-soft-fg);
  --color-neutral-soft: var(--neutral-soft); --color-neutral-soft-fg: var(--neutral-soft-fg);
  --color-table-head: var(--table-head); --color-table-agg: var(--table-agg);

  --color-sidebar: var(--sidebar); --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-muted: var(--sidebar-muted);
  --color-sidebar-primary: var(--sidebar-primary); --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent); --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border); --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground text-sm antialiased; font-variant-numeric: tabular-nums; }
  .card-elev { box-shadow: 0 0 1px rgba(0,0,0,.125), 0 1px 3px rgba(0,0,0,.2); }
}
```

```tsx
// app/layout.tsx
import { Source_Sans_3, Source_Code_Pro } from 'next/font/google';
const sans = Source_Sans_3({ subsets: ['latin'], variable: '--font-source-sans' });
const mono = Source_Code_Pro({ subsets: ['latin'], variable: '--font-source-code' });
// <html lang="id" className={`${sans.variable} ${mono.variable}`}>
```

Check the Tailwind and shadcn docs for the installed versions before relying on this syntax. There is no dark mode.

---

## 5. Layout Shell

```
┌──────────────┬────────────────────────────────────────────────────────────┐
│ ▣ LKPS       │ ☰  Prodi Sistem Informasi · FBTI   [TS 2025/2026 ● Terbuka]  🔔3  (AP)▾ │  top bar 56 px, white
│   Atma Jaya  ├────────────────────────────────────────────────────────────┤
│──────────────│ Beranda / 3. Relevansi Penelitian / Tabel 3.A.2            │  breadcrumb
│ UMUM         │ Tabel 3.A.2 Penelitian DTPR, Hibah dan Pembiayaan Penelitian│  page header (h1)
│  Dashboard   │ [● Belum lengkap]            [Pratinjau] [⋯] [+ Tambah Penelitian]
│ IDENTITAS    │ 3.A.1 Sarana │ 3.A.2 Penelitian │ 3.A.3 … │ Pratinjau       │  criterion tabs (links)
│  …           │ ┌────────────────────────────────────────────────────────┐ │
│ DATA KINERJA │ │ card                                                   │ │  content, bg #F4F6F9
│  1. Budaya … │ └────────────────────────────────────────────────────────┘ │
│ █3. Relevan… │   ← active: brand-700 fill, white text                    │
│ VERIFIKASI 12│                                                            │
│ MASTER DATA  │                                                            │
│ LAPORAN      │                                                            │
│ PENGATURAN   │ © 2026 Prodi Sistem Informasi · Unika Atma Jaya      v1.0  │  footer
└──────────────┴────────────────────────────────────────────────────────────┘
```

| Region | Component | Specification |
|---|---|---|
| Sidebar | `AppSidebar` | Brand block (logo square + "LKPS" 16/700 white + "Atma Jaya" 12 px sidebar-muted). Groups and items from `navItems` (TRD §8). Group labels in caption style, sidebar-muted. Item: 38 px high, icon + label, hover sidebar-accent. Active item: brand-700 fill, white text. Verifikasi shows a count badge (white on brand-700, or brand-100 text on dark when inactive). Collapsible to icons; state remembered in a cookie. |
| Top bar | `AppTopbar` | Left: sidebar toggle; "Prodi Sistem Informasi · FBTI" (hidden below 768 px). Right: `PeriodSwitcher` (a non-interactive chip "TS 2025/2026" + period status badge; "Belum ada periode" when none), `NotificationBell`, `UserMenu` (avatar initials, name, role badges; menu: Ganti Kata Sandi, Keluar). |
| Page header | `PageHeader` / `TableWorkHeader` | Breadcrumb (body-sm, muted). h1 = exact instrument title for table pages. Table status badge under the title. Right side: secondary buttons, a "⋯" menu, and at most one primary button. |
| Criterion tabs | `CriterionTabs` | Underline tabs, links, horizontally scrollable. Label `<code> <short name>`. Active: 2 px brand-700 underline, brand-800 text, weight 600. "Pratinjau" last. |
| Banners | `LockedPeriodBanner`, `NoPeriodState` | Locked: info-soft banner under the header with `Lock` icon: "Periode TS 2025/2026 terkunci sejak 20 Des 2026. Data hanya dapat dilihat dan diekspor." No period: a centred empty state replacing the page content. |
| Footer | in `AppShell` | 12 px muted: "© 2026 Program Studi Sistem Informasi · Universitas Katolik Indonesia Atma Jaya" and the app version on the right. |

---

## 6. Components

All custom components live in `src/frontend/shared/components/` (TRD §7.18) and are built from shadcn primitives in `components/ui`.

### 6.1 Catalogue

| Component | Built from | Specification |
|---|---|---|
| `Button` (ui) | shadcn | Variants: `default` (brand-700; hover brand-800), `secondary`, `outline`, `ghost`, `destructive`, `link`. Sizes sm 32 / default 36 / lg 40. One `default` per view. Loading state: spinner replaces the icon, label stays, button disabled. |
| `StatusBadge` | Badge + cva | Pill, soft tone, 14 px icon + label, 12 px / 600. Props: `status` (entry, table or period status key). |
| `TsChip` | Badge outline | "TS-1 · 2024/2025" in code font, 12 px. |
| `KpiSmallBox` | Card | White card, 4 px left border in the tone colour, caption label, 28 px / 700 number, optional sub-text, 20 px icon top-right at 40 % opacity, whole card is a link. |
| `DataTable` | TanStack + Table | Header row on table-agg with caption-style labels. Rows 44 px, two-line first column allowed. Hover brand-50. Selected / open row: brand-50 with a 2 px brand-500 left bar. Numbers right-aligned. Sticky header inside the card. Pagination footer: "1–25 dari 132" + page size select (25/50/100) + previous/next. Sort by clicking a header where the screen spec allows. |
| `FilterBar` | Input, Select | Search box with `Search` icon (debounced 300 ms), status select, year select where relevant, "Reset" link when any filter is active. Wraps on narrow widths. |
| `EmptyState` | — | 40 px muted icon, one sentence, optional primary button. |
| `EntitySheet` | Sheet (right) | Header: title, `TsChip` when year-bound, `StatusBadge`, close button. Scrollable body. Sticky footer = `EntryFormFooter`. Closes on Esc with the unsaved-changes guard. |
| `EntryFormFooter` | Buttons | Left: "Riwayat" ghost button (existing entries). Right: Batal · Simpan Draf · **Ajukan**. Variations: status `submitted`/`verified` → no "Simpan Draf", primary reads "Simpan & Ajukan Ulang"; Kaprodi → primary reads "Simpan & Verifikasi"; read-only (locked period or no permission) → only "Tutup". |
| `FormField` | Label + slot | Label 13 px / 600 above the control, red asterisk for fields required on submit, help text below in body-sm muted, error text in danger with `CircleX` 14 px; wires `aria-describedby`. |
| `NumberInput` | Input | Right-aligned, `inputmode="decimal"` or `numeric`, accepts comma or dot, no spinner arrows. |
| `MoneyInput` | Input | "Rp" prefix, thousand separators while typing, helper "= 40,00 juta". |
| `YearAmountGrid` | 3 × input | Three columns labelled with `TsChip`s (TS-2, TS-1, TS); money or integer mode. |
| `YearSelect` | Select | Options are the period's years as "TS-1 · 2024/2025". |
| `RefSelect` | Select + Input | Options from a reference list; optional last option "Lainnya…" reveals a text input. |
| `PersonPicker` | Popover + Command | Async search by name / NIDN / NIM. Single mode shows the chosen person as a row with a clear button. Multi mode shows chips with ×. Each option: name + code line. |
| `OptionPicker` | Popover + Command | Same pattern for Mitra, Penelitian, PkM. Optional footer action ("+ Tambah mitra baru"). |
| `DerivedField` | — | Read-only box on muted background with a `Sigma` icon, the value, and helper "Dihitung otomatis dari …". |
| `EvidenceUploader` | — | See §6.2. |
| `ValidationSummary` | Alert | See §6.3. |
| `ReturnNoteAlert` | Alert (danger-soft) | "Dikembalikan oleh <nama> · 20 Nov 2026 14:05" + the note. Shown at the top of the form while status is `returned`. |
| `HistoryDrawer` | Sheet (right, 480 px) | Timeline newest first: avatar initials, actor, action label, time; for updates a list "Field: lama → baru" (old struck through). |
| `OfficialTable` | `<table>` | See §7.6. |
| `CriterionPreviewAccordion` | Accordion | One item per table: code + title, "n baris", `StatusBadge`, chevron; body = issue line + `OfficialTable` + "Ekspor tabel ini" link. |
| `YearCardList` | Buttons | Vertical list of year cards (§7.4). |
| `MatrixGrid` | `<table>` + Checkbox | Sticky first column and header; 40 px cells; a cell the user may not edit is disabled with a tooltip "Hanya pengampu mata kuliah ini yang dapat mengubah". |
| `ConfirmDialog` | AlertDialog | Title, consequence sentence, Cancel + confirm (destructive variant for deletes). |
| `ReturnDialog` | Dialog | Textarea "Catatan untuk pemilik entri" (min 10 characters), counter, Batal · Kembalikan. |
| Toasts | Sonner | Bottom-right, 4 s. Success and error variants. Errors also stay inline. |
| Skeletons | Skeleton | Table: 6 grey rows. Cards: grey blocks matching the layout. Used in `loading.tsx`. |

### 6.2 EvidenceUploader

- **Empty (required slot):** dashed border box, `Upload` icon, "Unggah PDF/JPG/PNG, maks. 5 MB", buttons "Pilih file" and "Pilih dari pustaka bukti". Accepts drag and drop. When the entry is submitted without a file, the box border turns danger and the error "Link Bukti wajib diunggah sebelum diajukan." appears.
- **Empty (optional slot):** same, with the label "Lampiran internal (opsional, tidak ikut diekspor)".
- **Uploading:** file row with a progress bar.
- **Filled:** one row per file: type icon, file name (link, opens in a new tab), size, "Hapus" icon button (unlinks). "Tambah file" below. Several files per slot are allowed.
- **Error:** inline danger text under the box ("Jenis file tidak didukung." / "Ukuran file melebihi 5 MB.").
- Table 1.B shows three uploaders, labelled Dokumen SPMI, Bukti Certified Auditor, Laporan Audit.

### 6.3 ValidationSummary

Placed above the form footer after "Simpan Draf" or a failed "Ajukan".
- **Errors:** danger-soft panel titled "n galat harus diperbaiki sebelum diajukan", a list of messages; clicking a message focuses its field.
- **Warnings:** warning-soft panel titled "n peringatan memerlukan catatan"; each warning has its message and a small textarea "Catatan untuk Kaprodi" (min 5 characters). "Ajukan" stays enabled; submitting without notes highlights the empty textareas.
- Cross-table hints (skipped checks) appear as muted info lines.

### 6.4 StatusBadge reference implementation

```tsx
// src/frontend/shared/components/lkps/status-badge.component.tsx
const tone = cva('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', {
  variants: { tone: {
    neutral: 'bg-neutral-soft text-neutral-soft-fg', info: 'bg-info-soft text-info-soft-fg',
    success: 'bg-success-soft text-success-soft-fg', warning: 'bg-warning-soft text-warning-soft-fg',
    danger: 'bg-danger-soft text-danger-soft-fg',
  } },
});
export function StatusBadge({ status }: { status: StatusKey }) {
  const { tone: t, label, Icon } = STATUS_MAP[status];   // from §3.4
  return <span className={tone({ tone: t })}><Icon aria-hidden className="size-3.5" />{label}</span>;
}
```

---

## 7. Screen Patterns

### 7.1 Login and change password
- **Login:** split layout. Left panel (≥ 1024 px): brand-700 background, logo, "Sistem Informasi LKPS" (display, white), "Program Studi Sistem Informasi · Fakultas Biosains, Teknologi, dan Inovasi · Universitas Katolik Indonesia Atma Jaya", and at the bottom "Mengacu pada Instrumen APS 2.1 · LAM INFOKOM" (white at 80 %). Right: a 380 px form: h1 "Masuk", Email, Kata Sandi (show/hide toggle), **Masuk** (40 px, full width), helper "Lupa kata sandi? Hubungi Admin Sistem." Errors in a danger-soft alert above the fields.
- **Ganti Kata Sandi:** centred 420 px card: Kata sandi saat ini, Kata sandi baru, Ulangi kata sandi baru, rules listed as helper text, **Simpan Kata Sandi**. On a forced change the card shows an info alert "Anda perlu mengganti kata sandi sebelum melanjutkan." and no navigation.

### 7.2 Dashboard
1. Row of five `KpiSmallBox`: Tabel Lengkap "18 / 31" (success) · Menunggu Verifikasi (info) · Dikembalikan (danger) · Bukti Belum Ada (danger) · Peringatan Validasi (warning).
2. Card "Kelengkapan per Kriteria" (2/3 width): rows Identitas, 1 to 6; columns Bagian, Tabel ("4/6"), Progress (6 px bar; fill success at 100 %, brand-700 otherwise), "Buka" link.
3. Card "Nilai Indikator" (1/3 width): subtitle "Angka mentah dari data terverifikasi · tanpa penilaian"; label/value rows; values in foreground colour only.
4. Card "Tugas Saya" (full width; the only card for DTPR and Dosen): three sections Dikembalikan, Draf, Belum ada bukti; each row = table code, entry summary, `StatusBadge`, "Buka". Empty: "Tidak ada tugas. Semua entri Anda sudah diajukan."

### 7.3 Work screen for entry tables (types E and D)
```
[TableWorkHeader]  title · status · Pratinjau · ⋯ (Periksa Semua, Tandai Nihil) · + Tambah <item>
[CriterionTabs]
┌ Card ────────────────────────────────────────────────────────────────┐
│ [FilterBar]  Cari…   Status ▾   (Tahun ▾)                      Reset │
│ [DataTable]  columns per screen spec (§8)                            │
│ [EntryCountFooter]  5 entri · 3 terverifikasi · 1 diajukan · 1 draf  │
└──────────────────────────────────────────────────────────────────────┘
[EntitySheet]  opens on row click or "+ Tambah"
```
- Row actions (`EntryRowActions`, visible on hover and focus, always in a "⋯" menu on touch): Ubah, Riwayat, Hapus.
- DTPR users see only their rows and a muted line above the table: "Menampilkan entri milik Anda."
- Nihil state: the card body shows `EmptyState` "Tabel ini ditandai Nihil (tidak ada data untuk dilaporkan)." with the note and a "Batalkan Nihil" button.
- Table empty: "Belum ada <item> untuk periode ini." + the add button.
- Period attachments (Roadmap on 3.A.2 / 4.A.2): a slim card above the list: "Roadmap Penelitian" + `PeriodAttachmentUploader`.

### 7.4 Work screen for year records (type Y)
Two columns: left 320 px card "Data per Tahun Akademik" with `YearCardList`; right the form card for the selected year.
- Year card: `TsChip`, `StatusBadge`, two or three key numbers (per §8), or "Belum diisi" in muted text. Selected: 1.5 px brand-500 border, brand-50 background.
- The form groups fields in fieldsets that mirror the instrument's column groups; totals are `DerivedField`s; footer = `EntryFormFooter`.
- Selecting another year with unsaved edits triggers the unsaved-changes guard.

### 7.5 Single-record screens (type S)
One form card (max width 960 px), `StatusBadge` in the header, `EntryFormFooter` at the bottom. Kepuasan Pengguna renders its seven rows as a compact grid (row label + four percentage inputs + a row total that turns danger when ≠ 100).

### 7.6 Official table (`OfficialTable`) and preview pages
- Preview page: header "Pratinjau Tabel Resmi — 3. Relevansi Penelitian", buttons "Ekspor Kriteria 3 (.xlsx)"; info banner "Hanya baca. Tabel disusun otomatis dari data yang diinput."; then `CriterionPreviewAccordion`.
- Table style: all cell borders `#DEE2E6`; header cells on table-head, 600, centred, multi-row with spans; a column-number row "(1) (2) …" in 11 px muted; body 13 px; numbers right-aligned; "√" centred; empty value "—"; footer rows on table-agg, bold, label right-aligned across `labelColSpan`; `group` rows bold without numbers; `subheader` rows on table-head.
- Unverified rows (preview only): italic, muted-foreground, a 2 px dashed brand-500 left border, and a small "Diajukan" badge in the first cell.
- Evidence cells: file names as links, one per line; "—" when none.
- Wide tables scroll horizontally inside the card; the first column stays sticky.
- Notes under the table in body-sm muted, one per line.
- Issue line above the table (danger text, `CircleAlert`): "2 entri belum memiliki bukti: [Nama Dosen 3], [Nama Dosen 5]", names link to the entries.
- Nihil: one row "Tidak ada data" centred across all columns, plus the note below.

### 7.7 Curriculum mapping (type M)
- `KurikulumPemetaanBar` under the tabs on pages 2.B.1, 2.B.2, 2.B.3: status badge of the mapping set, counts ("42 mata kuliah · 5 PL · 9 CPL · 27 CPMK"), warnings count, and **Ajukan Pemetaan** (Kaprodi / Admin Prodi).
- 2.B.1 and 2.B.2: `MatrixGrid` in a card; toggling a cell saves immediately (optimistic, with a small "Tersimpan" indicator; on failure the cell reverts and a toast explains).
- 2.B.3: accordion per CPL (code + description + "n CPMK"); inside, one row per CPMK: code, description, multi-select of Mata Kuliah shown as chips "MK01 · Smt 1".
- Links to the master pages when lists are empty: "Belum ada Profil Lulusan. Tambahkan di Master Data → Profil Lulusan."

### 7.8 Verification queue
Two columns: list card (flex) and detail panel (480 px).
- List: `FilterBar` (Kriteria, Tabel, Pemilik, "Lebih dari 3 hari", "Ada peringatan"), `DataTable` with a checkbox column; columns Tabel (code chip), Entri (summary, two lines), Pemilik, Diajukan (relative time + date on hover), Peringatan (count badge).
- `BulkVerifyBar` appears above the table when rows are ticked: "4 dipilih" · **Verifikasi Semua** · Batal.
- `VerificationDetailPanel`: title, field list (label/value), evidence links, warning notes (warning-soft boxes), "Riwayat" link, footer buttons Kembalikan (outline) and **Verifikasi**.
- Empty queue: "Tidak ada entri yang menunggu verifikasi."

### 7.9 Other screens

| Screen | Pattern |
|---|---|
| Identitas Pengusul | Form card with four sections (Data Program Studi; SK Pendirian PT; SK Pembukaan PS; Akreditasi), each SK section ending with its attachment uploader; below it the card "Daftar Program Studi di UPPS" (`ProgramStudiUppsPanel`: small table + add/edit sheet + JUMLAH row) |
| Tim Penyusun | Entry list pattern; columns No, Nama, NIDN, Jabatan, Tanggal Pengisian, Tanda Tangan (Sudah/Belum), Status |
| Gambar 1.A | Card with the current image preview (max height 480 px) or PDF link, and upload/replace/remove buttons |
| Master pages | `DataTable` + `EntitySheet`; header buttons "Impor Excel" (Dosen, Mahasiswa) and "+ Tambah"; filter "Tampilkan arsip"; row actions Ubah, Arsipkan / Pulihkan |
| Master CPL & CPMK | Accordion per CPL with its CPMK rows; "+ Tambah CPL", "+ Tambah CPMK" inside each |
| Import wizard | Dialog 720 px, 3 steps with a step indicator: (1) Unggah: "Unduh templat" link + dropzone; (2) Tinjau: three count chips Valid / Galat / Duplikat, problem table (Baris, Kolom, Nilai, Keterangan), checkbox "Perbarui data yang sudah ada", "Unduh laporan galat"; (3) Selesai: "n ditambahkan · n diperbarui · n dilewati" |
| Pustaka Bukti | `DataTable`: Nama file, Jenis, Ukuran, Diunggah oleh, Tanggal, Tertaut ("3 entri" link opening a popover list, or a danger badge "Tidak tertaut"); filter "Tidak tertaut"; row action Hapus (unlinked only) |
| Pratinjau & Ekspor | `ExportProgressCard` (x / 31, bar, chips "n lengkap", "n belum lengkap"); buttons **Ekspor LKPS Lengkap (.xlsx)** and "Ekspor + Lampiran (.zip)"; `ExportCriterionList`: per criterion its tables with status, "Pratinjau" and "Ekspor" links |
| Periode | Card for the active period (TS, the four derived years, status, created/locked info) with **Ajukan & Kunci LKPS** (Kaprodi) or "Buka Kembali Periode" (Admin Sistem, when locked); table of all periods with snapshot download links; "+ Buat Periode" when none is open |
| Submit-period dialog | Lists incomplete tables (code, title, status) and "n peringatan belum beres"; checkbox "Saya memahami masih ada data yang belum lengkap" (only when there are gaps); **Ajukan & Kunci** |
| Pengaturan Validasi | Small form: "Rentang wajar total SKS EWMP" with Minimum and Maksimum; **Simpan** |
| Admin · Pengguna | `DataTable`: Nama, Email, Peran (badges), Dosen tertaut, Status; sheet form; row actions Ubah, Reset kata sandi, Nonaktifkan / Aktifkan |
| Admin · Referensi | Left: list of reference types; right: `RefOptionList` (drag handle or up/down buttons, label, Aktif switch, Ubah); "+ Tambah opsi" |
| Admin · Audit | `FilterBar` (date range, Aktor, Aksi, Jenis entitas) + `DataTable`: Waktu, Aktor, Aksi, Objek; row opens `HistoryDrawer` |
| 403 | Centred: `ShieldAlert` icon, "Anda tidak memiliki akses ke halaman ini.", button "Kembali ke beranda" |
| 404 / error | Centred message "Halaman tidak ditemukan." / "Terjadi kesalahan. Coba muat ulang halaman." with a retry button |

---

## 8. Work-List Columns per Table

Every list ends with the columns **Bukti** (where evidence applies), **Status**, and row actions. Columns marked → are right-aligned numbers.

| Table / entity | List columns (before Bukti, Status) | Add button | Sheet title |
|---|---|---|---|
| 1.A.1 | Unit Kerja · Nama Ketua (+ Periode Jabatan below) · Pendidikan · Jabatan Fungsional | Tambah Pimpinan | Pimpinan Unit |
| 1.A.2 | Sumber Pendanaan · TS-2 → · TS-1 → · TS → (Rp juta) | Tambah Sumber Dana | Sumber Pendanaan |
| 1.A.3 | Penggunaan Dana · TS-2 → · TS-1 → · TS → | Tambah Penggunaan Dana | Penggunaan Dana |
| 1.A.4 | Nama DTPR (+ NIDN) · Pengajaran → (sum of 3) · Penelitian → · PkM → · Manajemen → (sum of 2) · Total SKS → | Tambah EWMP | Beban Kerja DTPR |
| 1.A.5 | Jenis Tenaga Kependidikan · Total → · Unit Kerja | Tambah Tenaga Kependidikan | Kualifikasi Tenaga Kependidikan |
| 1.B | Unit SPMI · Nama Unit · Auditor → · Certified → · Frekuensi/tahun → | Tambah Unit SPMI | Unit SPMI |
| 2.A.2 | Asal Mahasiswa (+ Rincian below) · TS-2 → · TS-1 → · TS → | Tambah Asal Mahasiswa | Keragaman Asal Mahasiswa |
| 2.C | Bentuk Pembelajaran · TS-2 → · TS-1 → · TS → | Tambah Bentuk Pembelajaran | Fleksibilitas Pembelajaran |
| 2.D | Sumber Rekognisi · Jenis Pengakuan · TS-2 → · TS-1 → · TS → | Tambah Rekognisi | Rekognisi Lulusan |
| Prasarana (3.A.1, 4.A.1, 5.2) | Nama Prasarana · Daya Tampung → · Luas (m²) → · M/W · L/P/T · Digunakan untuk (chips) | Tambah Prasarana | Prasarana |
| 3.A.2 / 4.A.2 | Judul (+ "Ketua: … · Jenis Hibah · n thn" below) · Sumber (L/N/I chip) · Mhs → · Dana TS-2..TS → (sum, Rp juta) | Tambah Penelitian / Tambah PkM | Penelitian / PkM |
| 3.A.3 | Nama DTPR · Jenis Pengembangan · Tahun (TsChip) | Tambah Pengembangan | Pengembangan DTPR |
| 3.C.1 / 4.C.1 | Judul Kerjasama (+ Mitra below) · Sumber · Durasi → · Dana → | Tambah Kerjasama | Kerjasama Penelitian / Kerjasama PkM |
| 3.C.2 | Judul Publikasi (+ Nama DTPR below) · Jenis (chip) · Tahun | Tambah Publikasi | Publikasi |
| 3.C.3 / 4.C.3 | Judul (+ Nama DTPR below) · Jenis HKI · Tahun | Tambah HKI | HKI |
| 4.C.2 | Judul PkM (+ Ketua below) · Diseminasi (L/N/I) · Tahun | Tambah Diseminasi | Diseminasi Hasil PkM |
| 5.1 | Jenis Tata Kelola · Nama Sistem Informasi · Akses (chip) · Unit Pengelola | Tambah Sistem | Sistem Tata Kelola |

Year-card key numbers (type Y): 2.A.1 → Pendaftar, Mhs Baru, Mhs Aktif · 2.A.3 → Aktif, Lulus, DO · Data Lulusan → Lulusan, Terlacak, Masa tunggu (bln).

---

## 9. Content & Copy

### 9.1 Voice
Bahasa Indonesia, formal and short. Sentence case. No exclamation marks. Address the user as "Anda". Instrument terms exactly as written (DTPR, PkM, HKI, EWMP, TS, Link Bukti, UPPS, PS).

### 9.2 Glossary of UI labels

| Concept | Label |
|---|---|
| Save draft / Submit | Simpan Draf / Ajukan |
| Submit by Kaprodi | Simpan & Verifikasi |
| Re-submit after editing | Simpan & Ajukan Ulang |
| Verify / Return | Verifikasi / Kembalikan |
| Add / Edit / Delete / Cancel / Close | Tambah / Ubah / Hapus / Batal / Tutup |
| Archive / Restore | Arsipkan / Pulihkan |
| Preview / Export | Pratinjau / Ekspor |
| History | Riwayat |
| Evidence | Bukti (official column: "Link Bukti") |
| Optional attachment | Lampiran internal |
| Computed | Dihitung otomatis |
| Check all | Periksa Semua |
| Mark as nothing to report | Tandai Nihil / Batalkan Nihil |
| Lock period / Reopen | Ajukan & Kunci LKPS / Buka Kembali Periode |
| Search placeholder | Cari… |
| Required marker | * (with legend "* wajib diisi untuk diajukan" at the top of each form) |

### 9.3 Standard messages

| Situation | Text |
|---|---|
| Draft saved | Tersimpan sebagai draf. |
| Submitted | Diajukan ke Kaprodi. |
| Submitted by Kaprodi | Tersimpan dan terverifikasi. |
| Verified (n) | n entri terverifikasi. |
| Returned | Entri dikembalikan ke pemilik. |
| Deleted | Entri dihapus. |
| Confirm delete (draft) | Hapus entri ini? Tindakan ini tidak dapat dibatalkan. |
| Confirm delete (verified) | Entri ini sudah terverifikasi dan akan hilang dari tabel resmi. Hapus? |
| Confirm edit verified | Entri ini sudah terverifikasi. Jika diubah, entri kembali berstatus Diajukan dan tidak masuk ekspor sampai diverifikasi ulang. |
| Unsaved changes | Buang perubahan yang belum disimpan? |
| Conflict | Data telah diubah oleh pengguna lain. Muat ulang untuk melihat versi terbaru. |
| Linked entry | Entri ini masih ditautkan oleh n entri lain. |
| Locked | Periode terkunci. Data hanya dapat dilihat dan diekspor. |
| No period | Belum ada periode LKPS. Kaprodi perlu membuat periode terlebih dahulu. |
| Forbidden | Anda tidak memiliki akses ke halaman ini. |
| Session expired | Sesi Anda berakhir. Silakan masuk kembali. |
| Generic failure | Terjadi kesalahan. Coba lagi. |
| Upload type / size | Jenis file tidak didukung. / Ukuran file melebihi 5 MB. |
| Login failed / throttled | Email atau kata sandi salah. / Terlalu banyak percobaan. Coba lagi dalam 15 menit. |
| Nihil set | Tabel ditandai Nihil. |
| Export started | Menyiapkan berkas ekspor… |
| Period locked | LKPS diajukan dan periode dikunci. |

Validation messages follow the templates in PRD §10.

### 9.4 Formats

| Type | UI | Export |
|---|---|---|
| Integer | `1.234` (id-ID) | number |
| Decimal | `40,00` | number `0.00` |
| Money | Input in rupiah with separators; display "40,00" under a "(Rp juta)" header | Rp juta, `#,##0.00` |
| Percent | `85,0%` | number with one decimal |
| Date | `08 Nov 2026` | Tanggal Pengisian: `DD-MM-YYYY`; others `DD-MM-YYYY` |
| Date-time | `08 Nov 2026 14:05` (WIB) | — |
| Academic year | `2025/2026`; chip `TS · 2025/2026` | row/column labels `TS-2`, `TS-1`, `TS` |
| Empty value | `—` | empty cell (or "—" where PRD §8 says so) |

---

## 10. States Every Screen Must Handle

| State | Treatment |
|---|---|
| Loading | Skeleton via `loading.tsx`; buttons show a spinner while their action runs |
| Empty | `EmptyState` with the sentence from §7 and, when allowed, the add button |
| Error (load) | The error boundary message with a retry button |
| Error (action) | Toast + inline message; the form keeps the user's input |
| No period | `NoPeriodState` instead of the page content (master, admin and period pages excepted) |
| Locked period | `LockedPeriodBanner`; inputs disabled; add / edit / delete / Nihil hidden; sheets open read-only with "Tutup" |
| No permission for an action | The control is not rendered |
| Nihil | §7.3 |
| Long text | Truncate with ellipsis in lists (full text in a tooltip); wrap in official tables |

---

## 11. Accessibility

1. Text contrast ≥ 4.5:1; UI components and focus rings ≥ 3:1. Recheck after any `[CONFIRM]` swap.
2. Focus ring: 2 px `--ring` with 2 px offset on every interactive element; never removed.
3. Status is never colour-only: icon + text everywhere.
4. Semantic elements: `<button>`, `<a href>`, `<label for>`, `<th scope="col|row">`, `<caption>` (visually hidden) on official tables with the table title.
5. Sheets and dialogs trap focus, close on Esc, return focus to the opener.
6. On a failed submit, focus moves to the validation summary; each message links to its field.
7. Tabs that are links use `aria-current="page"`, not the ARIA tab pattern.
8. The matrix grid is keyboard-operable: arrow keys move, Space toggles; each checkbox has an `aria-label` "<MK> – <PL>".
9. Toasts are announced politely and are never the only feedback for an error.

---

## 12. Responsive Behaviour

| Width | Behaviour |
|---|---|
| ≥ 1280 px (primary) | Full sidebar; two-column patterns side by side |
| 1024–1279 px | Sidebar collapsed to icons; two-column patterns at 1/3 + 2/3 |
| 768–1023 px | Sidebar as an overlay; columns stack; sheets full-width |
| < 768 px | View and light edits; tables scroll inside cards; forms single-column; top bar hides the prodi text |

---

## 13. Relation to the Existing Canvas

The design canvas "Sistem Informasi LKPS" (navy `#1E3A5F`, IBM Plex) remains the reference for layouts and table structures. Only tokens change: navy → brand-700 for actions and a neutral dark sidebar; gold accent → brand-500; IBM Plex → Source Sans 3 / Source Code Pro; 10 px radius → 6 px with the AdminLTE card shadow. The canvas screens "Rencana Aksi" and any "Target: Unggul" label are out of scope.

---

## 14. Open Items

| ID | Item | Priority | Owner | Recommendation |
|---|---|---|---|---|
| DS-OI-01 | Official MyAtma orange, logo and font | Medium | Satriya / Novriani | Swap the `[CONFIRM]` tokens only |
| DS-OI-02 | Rules for using the Unika Atma Jaya logo | Low | Kaprodi | Confirm before UAT |
| DS-OI-03 | Restyle the canvas to these tokens | Low | Satriya | After DS-OI-01 |
