import { sql } from 'drizzle-orm';
import { db } from '../db/client';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function withActor<T>(userId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select set_config('app.user_id', ${userId}, true)`);
    return fn(tx);
  });
}
