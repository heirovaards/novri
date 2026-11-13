'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { StatusBadge } from '../lkps/status-badge.component';
import type { StatusKey } from '../lkps/status-badge.component';

export function EntitySheet({
  open,
  onOpenChange,
  title,
  status,
  width = 640,
  children,
  footer,
  onBeforeClose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  status?: StatusKey;
  width?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Return false to block closing. Wired to the real unsaved-changes guard in Phase 06. */
  onBeforeClose?: () => boolean;
}) {
  function handleOpenChange(next: boolean) {
    if (!next && onBeforeClose && !onBeforeClose()) return;
    onOpenChange(next);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent style={{ maxWidth: width }} className="flex w-full flex-col gap-0 p-0 sm:max-w-none">
        <SheetHeader className="flex-row items-center gap-2 border-b border-border px-6 py-4">
          <SheetTitle>{title}</SheetTitle>
          {status ? <StatusBadge status={status} /> : null}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer ? <div className="sticky bottom-0 border-t border-border bg-card px-6 py-3">{footer}</div> : null}
      </SheetContent>
    </Sheet>
  );
}
