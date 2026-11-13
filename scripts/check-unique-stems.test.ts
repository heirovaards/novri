import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkUniqueStems } from './check-unique-stems';

let root: string;

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
});

describe('checkUniqueStems', () => {
  it('passes when every file stem is unique', () => {
    root = mkdtempSync(join(tmpdir(), 'lkps-unique-stems-pass-'));
    mkdirSync(join(root, 'src', 'a'), { recursive: true });
    mkdirSync(join(root, 'src', 'b'), { recursive: true });
    writeFileSync(join(root, 'src', 'a', 'list-dosen.query.ts'), 'export function listDosenQuery() {}\n');
    writeFileSync(join(root, 'src', 'b', 'list-mahasiswa.query.ts'), 'export function listMahasiswaQuery() {}\n');

    expect(checkUniqueStems(root)).toEqual([]);
  });

  it('fails when two files share the same stem in different directories', () => {
    root = mkdtempSync(join(tmpdir(), 'lkps-unique-stems-fail-'));
    mkdirSync(join(root, 'src', 'a'), { recursive: true });
    mkdirSync(join(root, 'src', 'b'), { recursive: true });
    writeFileSync(join(root, 'src', 'a', 'list-dosen.query.ts'), 'export function listDosenQuery() {}\n');
    writeFileSync(join(root, 'src', 'b', 'list-dosen.query.ts'), 'export function listDosenQuery() {}\n');

    const violations = checkUniqueStems(root);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('list-dosen.query');
  });
});
