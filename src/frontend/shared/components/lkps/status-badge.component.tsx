import { cva } from 'class-variance-authority';
import { Circle, CircleAlert, CircleCheck, CircleSlash, Clock, FilePen, Lock, LockOpen, Send, Undo2, UserCheck, UserX } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { EntryStatus } from '@shared/types/entry-status.type';
import type { TableStatus } from '@shared/types/table-status.type';

export type StatusKey = EntryStatus | TableStatus | 'open' | 'locked' | 'active' | 'inactive';

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const tone = cva('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap', {
  variants: {
    tone: {
      neutral: 'bg-neutral-soft text-neutral-soft-fg',
      info: 'bg-info-soft text-info-soft-fg',
      success: 'bg-success-soft text-success-soft-fg',
      warning: 'bg-warning-soft text-warning-soft-fg',
      danger: 'bg-danger-soft text-danger-soft-fg',
    },
  },
});

const STATUS_MAP: Record<StatusKey, { tone: Tone; label: string; Icon: LucideIcon }> = {
  draft: { tone: 'neutral', label: 'Draf', Icon: FilePen },
  submitted: { tone: 'info', label: 'Diajukan', Icon: Send },
  verified: { tone: 'success', label: 'Terverifikasi', Icon: CircleCheck },
  returned: { tone: 'danger', label: 'Dikembalikan', Icon: Undo2 },
  not_started: { tone: 'neutral', label: 'Belum mulai', Icon: Circle },
  incomplete: { tone: 'danger', label: 'Belum lengkap', Icon: CircleAlert },
  awaiting_verification: { tone: 'warning', label: 'Menunggu verifikasi', Icon: Clock },
  complete: { tone: 'success', label: 'Lengkap', Icon: CircleCheck },
  open: { tone: 'info', label: 'Terbuka', Icon: LockOpen },
  locked: { tone: 'neutral', label: 'Terkunci', Icon: Lock },
  active: { tone: 'success', label: 'Aktif', Icon: UserCheck },
  inactive: { tone: 'neutral', label: 'Nonaktif', Icon: UserX },
};

export function StatusBadge({ status, nihil }: { status: StatusKey; nihil?: boolean }) {
  const isCompleteNihil = status === 'complete' && nihil;
  const { tone: statusTone, label, Icon } = STATUS_MAP[status];

  return (
    <span className={tone({ tone: statusTone })}>
      {isCompleteNihil ? <CircleSlash aria-hidden className="size-3.5" /> : <Icon aria-hidden className="size-3.5" />}
      {isCompleteNihil ? 'Lengkap · Nihil' : label}
    </span>
  );
}
