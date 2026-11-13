'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ListFilters } from '@shared/types/list-filters.type';

const PAGE_SIZES = [25, 50, 100] as const;

export function useListFilters(): [ListFilters, (next: Partial<ListFilters>) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<ListFilters>(() => {
    const page = Number(searchParams.get('page'));
    const pageSize = Number(searchParams.get('pageSize'));
    return {
      q: searchParams.get('q') ?? undefined,
      status: (searchParams.get('status') ?? undefined) as ListFilters['status'],
      yearId: searchParams.get('yearId') ?? undefined,
      page: Number.isInteger(page) && page > 0 ? page : 1,
      pageSize: (PAGE_SIZES as readonly number[]).includes(pageSize) ? (pageSize as (typeof PAGE_SIZES)[number]) : 25,
      entri: searchParams.get('entri') ?? undefined,
    };
  }, [searchParams]);

  const setFilters = useCallback(
    (next: Partial<ListFilters>) => {
      const merged = { ...filters, ...next };
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(merged)) {
        if (value !== undefined && value !== '') params.set(key, String(value));
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [filters, pathname, router],
  );

  return [filters, setFilters];
}
