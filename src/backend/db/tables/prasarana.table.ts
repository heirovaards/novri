import { sql } from 'drizzle-orm';
import { boolean, integer, numeric, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { workflowColumns } from '../columns/workflow-columns';
import { kepemilikanEnum } from '../enums/kepemilikan.enum';
import { lisensiEnum } from '../enums/lisensi.enum';

export const prasaranaTable = pgTable(
  'prasarana',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    nama: text('nama'),
    dayaTampung: integer('daya_tampung'),
    luasM2: numeric('luas_m2', { precision: 8, scale: 2 }),
    kepemilikan: kepemilikanEnum('kepemilikan'),
    lisensi: lisensiEnum('lisensi'),
    perangkat: text('perangkat'),
    usePenelitian: boolean('use_penelitian').notNull().default(false),
    usePkm: boolean('use_pkm').notNull().default(false),
    usePendidikan: boolean('use_pendidikan').notNull().default(false),
    ...workflowColumns(),
  },
  (table) => [
    uniqueIndex('prasarana_prodi_nama_key')
      .on(table.prodiId, sql`lower(${table.nama})`)
      .where(sql`${table.deletedAt} is null`),
  ],
);
