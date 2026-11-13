import { pgEnum } from 'drizzle-orm/pg-core';

export const lisensiEnum = pgEnum('lisensi', ['L', 'P', 'T']);
