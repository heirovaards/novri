import type { EntryStatus } from '../types/entry-status.type';

export const entryStatusLabels: Record<EntryStatus, string> = {
  draft: 'Draf',
  submitted: 'Diajukan',
  verified: 'Terverifikasi',
  returned: 'Dikembalikan',
};
