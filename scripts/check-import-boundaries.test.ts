import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkImportBoundaries } from './check-import-boundaries';

let root: string;

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
});

describe('checkImportBoundaries', () => {
  it('passes when app/ imports a screen', () => {
    root = mkdtempSync(join(tmpdir(), 'lkps-boundaries-pass-'));
    mkdirSync(join(root, 'app'), { recursive: true });
    writeFileSync(
      join(root, 'app', 'page.tsx'),
      "export const metadata = { title: 'x' };\nexport { FooScreen as default } from '@frontend/features/foo/screens/foo.screen';\n",
    );

    expect(checkImportBoundaries(root)).toEqual([]);
  });

  it('fails when app/ imports src/backend/db directly', () => {
    root = mkdtempSync(join(tmpdir(), 'lkps-boundaries-fail-'));
    mkdirSync(join(root, 'app'), { recursive: true });
    writeFileSync(join(root, 'app', 'page.tsx'), "import { db } from '@backend/db/client';\n");

    const violations = checkImportBoundaries(root);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toContain('@backend/db/client');
  });

  it('ignores a type-only import of a query file from a non-screen frontend component', () => {
    root = mkdtempSync(join(tmpdir(), 'lkps-boundaries-type-only-'));
    mkdirSync(join(root, 'src', 'frontend', 'features', 'foo', 'components'), { recursive: true });
    writeFileSync(
      join(root, 'src', 'frontend', 'features', 'foo', 'components', 'foo-table.component.tsx'),
      "import type { FooRow } from '@backend/features/foo/queries/list-foo.query';\nexport function FooTable(props: { rows: FooRow[] }) { return null; }\n",
    );

    expect(checkImportBoundaries(root)).toEqual([]);
  });
});
