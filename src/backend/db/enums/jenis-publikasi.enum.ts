import { pgEnum } from 'drizzle-orm/pg-core';

export const jenisPublikasiEnum = pgEnum('jenis_publikasi', ['IB', 'I', 'S1', 'S2', 'S3', 'S4', 'T']);
