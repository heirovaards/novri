import { pgEnum } from 'drizzle-orm/pg-core';

export const aksesSistemEnum = pgEnum('akses_sistem', ['lokal', 'internet']);
