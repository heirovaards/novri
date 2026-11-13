import type { EntryStatus } from './entry-status.type';

export type ListFilters = {
  q?: string;
  status?: EntryStatus;
  yearId?: string;
  page: number;
  pageSize: 25 | 50 | 100;
  entri?: string;
};

export type ListResult<T> = { rows: T[]; total: number; countsByStatus: Record<EntryStatus, number> };
