import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkRoutingFiles } from './check-routing-files';

let root: string;

afterEach(() => {
  if (root) rmSync(root, { recursive: true, force: true });
});

describe('checkRoutingFiles', () => {
  it('passes a page.tsx with only imports, metadata, and a re-export', () => {
    root = mkdtempSync(join(tmpdir(), 'lkps-routing-pass-'));
    mkdirSync(join(root, 'app'), { recursive: true });
    writeFileSync(
      join(root, 'app', 'page.tsx'),
      "export const metadata = { title: 'x' };\nexport { FooScreen as default } from '@frontend/features/foo/screens/foo.screen';\n",
    );

    expect(checkRoutingFiles(root)).toEqual([]);
  });

  it('fails a page.tsx that renders JSX directly', () => {
    root = mkdtempSync(join(tmpdir(), 'lkps-routing-fail-'));
    mkdirSync(join(root, 'app'), { recursive: true });
    writeFileSync(join(root, 'app', 'page.tsx'), 'export default function Page() {\n  return <div>hi</div>;\n}\n');

    const violations = checkRoutingFiles(root);
    expect(violations).toHaveLength(1);
  });
});
