import { pgEnum } from 'drizzle-orm/pg-core';

export const periodStatusEnum = pgEnum('period_status', ['open', 'locked']);
