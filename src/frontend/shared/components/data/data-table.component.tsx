'use client';

import { createColumnHelper, tableFeatures, useTable } from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';

const features = tableFeatures({});

export type DataTableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  align?: 'left' | 'right';
  sortable?: boolean;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  total,
  page,
  pageSize,
  sort,
  sortDir,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onRowClick,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  total: number;
  page: number;
  pageSize: 25 | 50 | 100;
  sort?: string;
  sortDir?: 'asc' | 'desc';
  onSortChange?: (key: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: 25 | 50 | 100) => void;
  onRowClick?: (row: T) => void;
}) {
  const helper = createColumnHelper<typeof features, T>();
  const tanstackColumns = columns.map((column) => helper.display({ id: column.key, header: column.header, cell: (ctx) => column.cell(ctx.row.original) }));
  const table = useTable({ features, columns: tanstackColumns, data: rows, getRowId: (row) => row.id });

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="bg-table-agg">
              {group.headers.map((header, index) => {
                const column = columns[index];
                return (
                  <TableHead key={header.id} className={column?.align === 'right' ? 'text-right' : undefined}>
                    {column?.sortable && onSortChange ? (
                      <button type="button" onClick={() => onSortChange(column.key)} className="inline-flex items-center gap-1 font-[inherit]">
                        {column.header}
                        {sort === column.key ? sortDir === 'desc' ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" /> : null}
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              className={onRowClick ? 'h-11 cursor-pointer hover:bg-brand-50' : 'h-11'}
            >
              {row.getAllCells().map((cell, index) => (
                <TableCell key={cell.id} className={columns[index]?.align === 'right' ? 'text-right tabular-nums' : undefined}>
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between border-t border-border px-4 py-2 text-sm text-muted-foreground">
        <span>{total === 0 ? '0 dari 0' : `${from}–${to} dari ${total}`}</span>
        <div className="flex items-center gap-2">
          <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value) as 25 | 50 | 100)}>
            <SelectTrigger className="w-[90px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[25, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Sebelumnya
          </Button>
          <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
