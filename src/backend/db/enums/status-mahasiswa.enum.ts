import { pgEnum } from 'drizzle-orm/pg-core';

export const statusMahasiswaEnum = pgEnum('status_mahasiswa', ['aktif', 'lulus', 'cuti', 'mengundurkan_diri', 'do']);
