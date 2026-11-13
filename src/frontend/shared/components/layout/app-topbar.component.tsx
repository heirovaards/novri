import { PanelLeft } from 'lucide-react';
import type { SessionUser } from '@shared/types/session-user.type';
import { Button } from '../ui/button';
import { PeriodSwitcher } from './period-switcher.component';
import { NotificationBell } from './notification-bell.component';
import { UserMenu } from './user-menu.component';

export function AppTopbar({ user, onToggleSidebar }: { user: SessionUser; onToggleSidebar: () => void }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Buka/tutup sidebar" onClick={onToggleSidebar}>
          <PanelLeft className="size-4" />
        </Button>
        <span className="hidden text-sm text-muted-foreground md:inline">Prodi Sistem Informasi · FBTI</span>
      </div>
      <div className="flex items-center gap-3">
        <PeriodSwitcher />
        <NotificationBell />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
