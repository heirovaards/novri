import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const IGNORED_DIRS = new Set(['node_modules', '.next', '.git']);

export function walkSourceFiles(root: string, extensions: readonly string[]): string[] {
  const results: string[] = [];
  const stack = [root];

  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir) continue;

    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry)) continue;
      const full = join(dir, entry);
      const info = statSync(full);
      if (info.isDirectory()) {
        stack.push(full);
      } else if (extensions.some((ext) => entry.endsWith(ext))) {
        results.push(full);
      }
    }
  }

  return results;
}
