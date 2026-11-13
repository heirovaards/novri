import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { academicYearTable } from '../tables/academic-year.table';
import { formatAcademicYear } from '@shared/format/format-academic-year';

export async function seedAcademicYears(db: NodePgDatabase): Promise<void> {
  const rows = [];
  for (let startYear = 2018; startYear <= 2035; startYear += 1) {
    rows.push({ startYear, label: formatAcademicYear(startYear) });
  }

  await db.insert(academicYearTable).values(rows).onConflictDoNothing({ target: academicYearTable.startYear });
}
