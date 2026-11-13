import { fileURLToPath } from 'node:url';
import { basename, relative } from 'node:path';
import { walkSourceFiles } from './lib/walk-source-files';

export function checkUniqueStems(root = process.cwd()): string[] {
  const violations: string[] = [];
  const files = [...walkSourceFiles(`${root}/src`, ['.ts', '.tsx']), ...walkSourceFiles(`${root}/scripts`, ['.ts', '.tsx'])].filter(
    (file) => !file.endsWith('.test.ts') && !file.endsWith('.test.tsx'),
  );

  const byStem = new Map<string, string[]>();
  for (const file of files) {
    const stem = basename(file).replace(/\.(ts|tsx)$/, '');
    const relPath = relative(root, file).replace(/\\/g, '/');
    const existing = byStem.get(stem);
    if (existing) existing.push(relPath);
    else byStem.set(stem, [relPath]);
  }

  for (const [stem, paths] of byStem) {
    if (paths.length > 1) {
      violations.push(`Duplicate stem "${stem}" in: ${paths.join(', ')}`);
    }
  }

  return violations;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const violations = checkUniqueStems();
  for (const v of violations) console.error(v);
  if (violations.length > 0) process.exit(1);
}
