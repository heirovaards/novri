import { fileURLToPath } from 'node:url';
import { relative } from 'node:path';
import ts from 'typescript';
import { walkSourceFiles } from './lib/walk-source-files';

function isAllowedStatement(statement: ts.Statement): boolean {
  if (ts.isImportDeclaration(statement)) return true;
  if (ts.isExportDeclaration(statement)) return true; // re-export, with or without `as default`
  if (ts.isExportAssignment(statement)) return true; // `export default identifier`

  const modifiers = ts.canHaveModifiers(statement) ? ts.getModifiers(statement) : undefined;
  const isExported = modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
  if (!isExported) return false;

  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.every((decl) => ts.isIdentifier(decl.name) && decl.name.text === 'metadata');
  }

  if (ts.isFunctionDeclaration(statement)) {
    return statement.name?.text === 'generateMetadata';
  }

  return false;
}

export function checkRoutingFiles(root = process.cwd()): string[] {
  const violations: string[] = [];
  const files = walkSourceFiles(`${root}/app`, ['.tsx', '.ts']).filter((file) => file.endsWith('page.tsx') || file.endsWith('route.ts'));

  for (const file of files) {
    const relPath = relative(root, file).replace(/\\/g, '/');
    const source = ts.sys.readFile(file) ?? '';
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

    for (const statement of sourceFile.statements) {
      if (!isAllowedStatement(statement)) {
        const line = sourceFile.getLineAndCharacterOfPosition(statement.getStart()).line + 1;
        violations.push(`${relPath}:${line}: routing files may only contain imports, re-exports, and a metadata/generateMetadata export`);
      }
    }
  }

  return violations;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const violations = checkRoutingFiles();
  for (const v of violations) console.error(v);
  if (violations.length > 0) process.exit(1);
}
