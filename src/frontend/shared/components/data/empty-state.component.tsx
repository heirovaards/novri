import type { LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';

export function EmptyState({
  icon: Icon,
  message,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <Icon aria-hidden className="size-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}
