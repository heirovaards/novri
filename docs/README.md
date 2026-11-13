# LKPS Documentation

| File | Purpose | Version |
|---|---|---|
| [`PRD.md`](./PRD.md) | Product requirements: scope, roles, rules, field-level spec of all 31 tables, validation, acceptance criteria | 1.0 |
| [`TRD.md`](./TRD.md) | Technical requirements: stack, frontend/backend folder structure, file inventory, data model, engine, security, deployment | 1.0 |
| [`DESIGN.md`](./DESIGN.md) | Design system and screen patterns: tokens, theme, components, layouts, UI copy | 1.0 |
| [`phase/README.md`](./phase/README.md) | Phase index, dependencies, sprint mapping, status tracker, phase log | — |
| `phase/phase-NN-*.md` | One work order per phase (00 to 18) | — |

## Reading order for an agent

1. `../CLAUDE.md` (rules of the repo)
2. `phase/README.md` (which phase is next)
3. The phase file
4. Only the PRD / TRD / DESIGN sections the phase file references

## Reference instrument

LAM INFOKOM, *Instrumen Akreditasi Program Studi 2.1, Program Sarjana: Panduan Penyusunan Laporan Kinerja Program Studi (LKPS)*, Lampiran 4 Peraturan LAM INFOKOM Nomor 11/PERLAM/MA/LAM-INFOKOM/X/2025, October 2025. The table layouts in `PRD.md` §8 are transcribed from this document. If the PDF is added to the repo, place it at `docs/reference/instrumen-aps-s1-lkps-2.1.pdf`.

## Conventions used in these documents

- `[CONFIRM]` marks an assumption the prodi has not confirmed. The build proceeds with the assumption; it is isolated so it can change in one place.
- FR-xx = functional requirement, V-xx = validation rule, D-xx = product decision, A-xx = assumption, OI-xx = open item.
- Table codes follow the instrument: `1.A.4`, `3.C.2`, and so on. In file names the dots are dropped: `1a4`, `3c2`.
- Dates are `YYYY-MM-DD`. Times are 24-hour, WIB (UTC+7).
