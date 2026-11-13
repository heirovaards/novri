import { checkSingleExport } from './check-single-export';
import { checkUniqueStems } from './check-unique-stems';
import { checkImportBoundaries } from './check-import-boundaries';
import { checkRoutingFiles } from './check-routing-files';

export function runConventionChecks(): boolean {
  const checks: Array<[string, () => string[]]> = [
    ['single export', checkSingleExport],
    ['unique stems', checkUniqueStems],
    ['import boundaries', checkImportBoundaries],
    ['routing files', checkRoutingFiles],
  ];

  let hasViolations = false;

  for (const [name, check] of checks) {
    const violations = check();
    if (violations.length > 0) {
      hasViolations = true;
      console.error(`\n✗ ${name} (${violations.length})`);
      for (const violation of violations) console.error(`  ${violation}`);
    } else {
      console.log(`✓ ${name}`);
    }
  }

  return !hasViolations;
}

const ok = runConventionChecks();
if (!ok) process.exit(1);
