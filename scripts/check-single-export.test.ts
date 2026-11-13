import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkSingleExport } from './check-single-export';

let root: string;

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
});

describe('checkSingleExport', () => {
  it('passes a file with exactly one correctly-named export', () => {
    root = mkdtempSync(join(tmpdir(), 'lkps-single-export-pass-'));
    mkdirSync(join(root, 'src', 'backend', 'features', 'foo', 'actions'), { recursive: true });
    writeFileSync(
      join(root, 'src', 'backend', 'features', 'foo', 'actions', 'create-foo.action.ts'),
      "export async function createFooAction() { return 1; }\n",
    );

    expect(checkSingleExport(root)).toEqual([]);
  });

  it('fails a file whose export name does not match the expected convention', () => {
    root = mkdtempSync(join(tmpdir(), 'lkps-single-export-fail-'));
    mkdirSync(join(root, 'src', 'backend', 'features', 'foo', 'actions'), { recursive: true });
    writeFileSync(
      join(root, 'src', 'backend', 'features', 'foo', 'actions', 'create-foo.action.ts'),
      "export async function doSomethingElse() { return 1; }\n",
    );

    const violations = checkSingleExport(root);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('createFooAction');
  });
});
