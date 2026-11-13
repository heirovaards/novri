import type { TableStatus } from '../types/table-status.type';

export const tableStatusLabels: Record<TableStatus, string> = {
  not_started: 'Belum mulai',
  incomplete: 'Belum lengkap',
  awaiting_verification: 'Menunggu verifikasi',
  complete: 'Lengkap',
};
