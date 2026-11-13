import { pgEnum } from 'drizzle-orm/pg-core';

export const entryStatusEnum = pgEnum('entry_status', ['draft', 'submitted', 'verified', 'returned']);
