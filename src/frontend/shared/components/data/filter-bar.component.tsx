'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

export function FilterBar({
  search,
  onSearchChange,
  hasActiveFilters,
  onReset,
  children,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
  hasActiveFilters?: boolean;
  onReset?: () => void;
  children?: React.ReactNode;
}) {
  const [value, setValue] = useState(search ?? '');
  const [lastSearchProp, setLastSearchProp] = useState(search);

  if (search !== lastSearchProp) {
    setLastSearchProp(search);
    setValue(search ?? '');
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      if (onSearchChange && value !== (search ?? '')) onSearchChange(value);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {onSearchChange ? (
        <div className="relative min-w-[200px] flex-1">
          <Search aria-hidden className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Cari…" className="pl-8" />
        </div>
      ) : null}
      {children}
      {hasActiveFilters && onReset ? (
        <button type="button" onClick={onReset} className="text-sm text-primary underline-offset-4 hover:underline">
          Reset
        </button>
      ) : null}
    </div>
  );
}
