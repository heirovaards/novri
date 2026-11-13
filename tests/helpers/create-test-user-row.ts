import { randomUUID } from 'node:crypto';
import { user } from '../../src/backend/db/auth-schema';
import { getTestDb } from './get-test-db';

export async function createTestUserRow(overrides: Partial<typeof user.$inferInsert> = {}): Promise<string> {
  const db = getTestDb();
  const id = overrides.id ?? randomUUID();

  await db.insert(user).values({
    id,
    name: 'Test User',
    email: `${id}@test.local`,
    emailVerified: true,
    ...overrides,
  });

  return id;
}
