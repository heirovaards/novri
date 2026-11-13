import { pgEnum } from 'drizzle-orm/pg-core';

export const asalMahasiswaEnum = pgEnum('asal_mahasiswa', [
  'kota_sama',
  'kota_lain',
  'provinsi_lain',
  'negara_lain',
  'afirmasi',
  'kebutuhan_khusus',
]);
