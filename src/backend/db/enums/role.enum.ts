import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin_sistem', 'kaprodi', 'admin_prodi', 'dtpr', 'dosen']);
