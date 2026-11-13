import { StatusBadge } from '../lkps/status-badge.component';
import type { StatusKey } from '../lkps/status-badge.component';

export function PageHeader({
  breadcrumb,
  title,
  status,
  actions,
}: {
  breadcrumb?: string;
  title: string;
  status?: StatusKey;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 pb-4">
      {breadcrumb ? <p className="text-[13px] leading-[19px] text-muted-foreground">{breadcrumb}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-bold leading-[30px]">{title}</h1>
          {status ? <StatusBadge status={status} /> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
