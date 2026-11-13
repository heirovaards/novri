import { fileURLToPath } from 'node:url';
import { basename, relative } from 'node:path';
import ts from 'typescript';
import { walkSourceFiles } from './lib/walk-source-files';

const EXEMPT_PATTERNS = [/[\\/]frontend[\\/]shared[\\/]components[\\/]ui[\\/]/, /[\\/]backend[\\/]db[\\/]auth-schema\.ts$/];

const SUFFIX_RULES: Record<string, (stem: string) => string> = {
  screen: (stem) => `${toPascalCase(stem)}Screen`,
  component: (stem) => toPascalCase(stem),
  action: (stem) => `${toCamelCase(stem)}Action`,
  query: (stem) => `${toCamelCase(stem)}Query`,
  handler: (stem) => `${toCamelCase(stem)}Handler`,
  schema: (stem) => `${toCamelCase(stem)}Schema`,
  table: (stem) => `${toCamelCase(stem)}Table`,
  enum: (stem) => `${toCamelCase(stem)}Enum`,
  compiler: (stem) => `compile${toPascalCase(stem)}`,
  rule: (stem) => `rule${toPascalCase(stem)}`,
};

function toPascalCase(stem: string): string {
  return stem
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toCamelCase(stem: string): string {
  const pascal = toPascalCase(stem);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function isExempt(filePath: string): boolean {
  if (filePath.endsWith('.test.ts') || filePath.endsWith('.test.tsx')) return true;
  if (filePath.endsWith('.type.ts')) return true;
  return EXEMPT_PATTERNS.some((pattern) => pattern.test(filePath));
}

function splitStemAndSuffix(fileName: string): { stem: string; suffix: string | null } {
  const withoutExt = fileName.replace(/\.(ts|tsx)$/, '');
  const parts = withoutExt.split('.');
  if (parts.length >= 2) {
    const suffix = parts.at(-1) ?? '';
    if (suffix in SUFFIX_RULES) {
      return { stem: parts.slice(0, -1).join('.'), suffix };
    }
  }
  return { stem: withoutExt, suffix: null };
}

type ExportedName = { name: string | undefined; isType: boolean };

function collectExportedNames(sourceFile: ts.SourceFile): ExportedName[] {
  const exported: ExportedName[] = [];

  for (const statement of sourceFile.statements) {
    const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined;
    const hasExportModifier = modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;

    if (ts.isExportDeclaration(statement)) {
      if (statement.isTypeOnly) continue;
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const spec of statement.exportClause.elements) {
          if (spec.isTypeOnly) continue;
          exported.push({ name: spec.name.text, isType: false });
        }
      }
      continue;
    }

    if (ts.isExportAssignment(statement)) {
      const expr = statement.expression;
      exported.push({ name: ts.isIdentifier(expr) ? expr.text : undefined, isType: false });
      continue;
    }

    if (!hasExportModifier) continue;

    if (ts.isTypeAliasDeclaration(statement) || ts.isInterfaceDeclaration(statement)) {
      continue; // type-only, not a runtime export
    }

    if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
      exported.push({ name: statement.name?.text, isType: false });
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) exported.push({ name: decl.name.text, isType: false });
      }
    }
  }

  return exported;
}

export function checkSingleExport(root = process.cwd()): string[] {
  const violations: string[] = [];
  const files = [...walkSourceFiles(`${root}/src`, ['.ts', '.tsx']), ...walkSourceFiles(`${root}/scripts`, ['.ts', '.tsx'])];

  for (const file of files) {
    const relPath = relative(root, file).replace(/\\/g, '/');
    if (isExempt(relPath)) continue;

    const source = ts.sys.readFile(file) ?? '';
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const exported = collectExportedNames(sourceFile);

    if (exported.length !== 1) {
      violations.push(`${relPath}: expected exactly 1 runtime export, found ${exported.length}`);
      continue;
    }

    const { stem, suffix } = splitStemAndSuffix(basename(file));
    const actualName = exported[0]?.name;

    if (suffix && suffix in SUFFIX_RULES) {
      const expected = SUFFIX_RULES[suffix]!(stem);
      if (actualName !== expected) {
        violations.push(`${relPath}: expected export named "${expected}", found "${actualName ?? '(unnamed)'}"`);
      }
      continue;
    }

    if (stem.startsWith('use-')) {
      const expected = toCamelCase(stem);
      if (actualName !== expected) {
        violations.push(`${relPath}: expected hook export named "${expected}", found "${actualName ?? '(unnamed)'}"`);
      }
      continue;
    }

    const camel = toCamelCase(stem);
    const pascal = toPascalCase(stem);
    if (actualName !== camel && actualName !== pascal) {
      violations.push(`${relPath}: expected export named "${camel}" or "${pascal}", found "${actualName ?? '(unnamed)'}"`);
    }
  }

  return violations;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const violations = checkSingleExport();
  for (const v of violations) console.error(v);
  if (violations.length > 0) process.exit(1);
}
