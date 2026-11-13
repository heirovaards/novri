import { fileURLToPath } from 'node:url';
import { dirname, relative, resolve, basename } from 'node:path';
import ts from 'typescript';
import { walkSourceFiles } from './lib/walk-source-files';

type Zone = 'app' | 'frontend' | 'backend' | 'shared' | 'external';
type Target = { zone: Zone; path: string };

function toPosix(path: string): string {
  return path.replace(/\\/g, '/');
}

function classifyTarget(root: string, fromFile: string, specifier: string): Target {
  if (specifier.startsWith('@frontend/')) return { zone: 'frontend', path: specifier.slice('@frontend/'.length) };
  if (specifier.startsWith('@backend/')) return { zone: 'backend', path: specifier.slice('@backend/'.length) };
  if (specifier.startsWith('@shared/')) return { zone: 'shared', path: specifier.slice('@shared/'.length) };

  if (specifier.startsWith('.')) {
    const abs = resolve(dirname(fromFile), specifier);
    const rel = toPosix(relative(root, abs));
    if (rel.startsWith('src/frontend/')) return { zone: 'frontend', path: rel.slice('src/frontend/'.length) };
    if (rel.startsWith('src/backend/')) return { zone: 'backend', path: rel.slice('src/backend/'.length) };
    if (rel.startsWith('src/shared/')) return { zone: 'shared', path: rel.slice('src/shared/'.length) };
    if (rel.startsWith('app/')) return { zone: 'app', path: rel.slice('app/'.length) };
    return { zone: 'external', path: rel };
  }

  return { zone: 'external', path: specifier };
}

function classifyFromFile(root: string, file: string): { zone: Zone; path: string } {
  const rel = toPosix(relative(root, file));
  if (rel.startsWith('app/')) return { zone: 'app', path: rel.slice('app/'.length) };
  if (rel.startsWith('src/frontend/')) return { zone: 'frontend', path: rel.slice('src/frontend/'.length) };
  if (rel.startsWith('src/backend/')) return { zone: 'backend', path: rel.slice('src/backend/'.length) };
  if (rel.startsWith('src/shared/')) return { zone: 'shared', path: rel.slice('src/shared/'.length) };
  return { zone: 'external', path: rel };
}

function isScreenFile(fileName: string): boolean {
  return fileName.endsWith('.screen.tsx');
}

function violationFor(fromFileName: string, from: { zone: Zone }, target: Target): string | null {
  if (target.zone === 'external') return null;

  if (from.zone === 'app') {
    if (target.zone === 'frontend') {
      if (target.path.includes('/screens/')) return null;
      if (target.path.startsWith('shared/components/layout/')) return null;
      return `app/ may only import *.screen files or shared/components/layout/*, got @frontend/${target.path}`;
    }
    if (target.zone === 'backend') {
      if (target.path.includes('/handlers/')) return null;
      if (target.path.startsWith('auth/') && fromFileName.endsWith('layout.tsx')) return null;
      return `app/ may only import *.handler files from src/backend, got @backend/${target.path}`;
    }
    if (target.zone === 'shared') {
      return `app/ must not import src/shared directly, got @shared/${target.path}`;
    }
  }

  if (from.zone === 'frontend') {
    if (target.zone === 'backend') {
      if (target.path.includes('/actions/') && target.path.endsWith('.action')) return null;
      if (target.path.includes('/queries/') && target.path.endsWith('.query')) {
        if (isScreenFile(fromFileName)) return null;
        return `src/backend queries may only be imported from *.screen.tsx files, got import in ${fromFileName}`;
      }
      if (target.path.startsWith('auth/')) {
        if (isScreenFile(fromFileName)) return null;
        return `src/backend/auth may only be imported from *.screen.tsx files, got import in ${fromFileName}`;
      }
      return `src/frontend must not import @backend/${target.path}`;
    }
  }

  if (from.zone === 'backend') {
    if (target.zone === 'frontend') return `src/backend must never import @frontend/${target.path}`;
  }

  if (from.zone === 'shared') {
    if (target.zone === 'frontend' || target.zone === 'backend') return `src/shared must not import ${target.zone} code (@${target.zone}/${target.path})`;
  }

  return null;
}

function collectSpecifiers(sourceFile: ts.SourceFile): string[] {
  const specifiers: string[] = [];
  for (const statement of sourceFile.statements) {
    // `import type { X } from '...'` / `export type { X } from '...'` are erased at compile time
    // and have no runtime boundary to enforce.
    if (ts.isImportDeclaration(statement) && !statement.importClause?.isTypeOnly && ts.isStringLiteral(statement.moduleSpecifier)) {
      specifiers.push(statement.moduleSpecifier.text);
    }
    if (ts.isExportDeclaration(statement) && !statement.isTypeOnly && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
      specifiers.push(statement.moduleSpecifier.text);
    }
  }
  return specifiers;
}

export function checkImportBoundaries(root = process.cwd()): string[] {
  const violations: string[] = [];
  const files = [
    ...walkSourceFiles(`${root}/app`, ['.ts', '.tsx']),
    ...walkSourceFiles(`${root}/src`, ['.ts', '.tsx']),
  ];

  for (const file of files) {
    const relPath = toPosix(relative(root, file));
    const from = classifyFromFile(root, file);
    const source = ts.sys.readFile(file) ?? '';
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

    for (const specifier of collectSpecifiers(sourceFile)) {
      const target = classifyTarget(root, file, specifier);
      const message = violationFor(basename(file), from, target);
      if (message) violations.push(`${relPath}: ${message}`);
    }
  }

  return violations;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const violations = checkImportBoundaries();
  for (const v of violations) console.error(v);
  if (violations.length > 0) process.exit(1);
}
