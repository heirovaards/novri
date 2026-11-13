import { pgEnum } from 'drizzle-orm/pg-core';

export const danaKindEnum = pgEnum('dana_kind', ['sumber', 'penggunaan']);
