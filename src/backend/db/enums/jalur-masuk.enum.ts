import { pgEnum } from 'drizzle-orm/pg-core';

export const jalurMasukEnum = pgEnum('jalur_masuk', ['reguler', 'rpl']);
