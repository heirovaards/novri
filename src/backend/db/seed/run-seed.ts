import { fileURLToPath } from 'node:url';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { seedOrganisation } from './seed-organisation';
import { seedAcademicYears } from './seed-academic-years';
import { seedReferenceLists } from './seed-reference-lists';
import { seedUsers } from './seed-users';
import { seedDemoData } from './seed-demo-data';

export async function runSeed(db: NodePgDatabase): Promise<void> {
  await seedOrganisation(db);
  await seedAcademicYears(db);
  await seedReferenceLists(db);
  await seedUsers(db);
  await seedDemoData(db);
}

async function runDirectly() {
  const { db } = await import('../client');
  await runSeed(db);
  console.log('Seed complete.');
  process.exit(0);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  void runDirectly();
}
