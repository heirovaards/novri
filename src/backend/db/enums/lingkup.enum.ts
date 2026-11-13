import { pgEnum } from 'drizzle-orm/pg-core';

export const lingkupEnum = pgEnum('lingkup', ['L', 'N', 'I']);
