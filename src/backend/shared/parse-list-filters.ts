import type { ListFilters } from '@shared/types/list-filters.type';
import type { EntryStatus } from '@shared/types/entry-status.type';

const PAGE_SIZES = [25, 50, 100] as const;

export function parseListFilters(searchParams: Record<string, string | string[] | undefined>): ListFilters {
  const get = (key: string): string | undefined => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const page = Number(get('page'));
  const pageSize = Number(get('pageSize'));

  return {
    q: get('q') || undefined,
    status: get('status') as EntryStatus | undefined,
    yearId: get('yearId') || undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: (PAGE_SIZES as readonly number[]).includes(pageSize) ? (pageSize as (typeof PAGE_SIZES)[number]) : 25,
    entri: get('entri') || undefined,
  };
}
