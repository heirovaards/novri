'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';
import type { NavGroup } from '../../navigation/nav-items';

export function AppSidebar({ groups, collapsed }: { groups: NavGroup[]; collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <aside className={cn('flex shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-all', collapsed ? 'w-16' : 'w-[250px]')}>
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-500 text-sm font-bold text-white">LK</span>
        {collapsed ? null : (
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold text-white">LKPS</span>
            <span className="text-xs text-sidebar-muted">Atma Jaya</span>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {groups.map((group) => (
          <div key={group.label} className="mb-2">
            {collapsed ? null : <p className="px-4 py-1 text-[12px] font-semibold tracking-wide text-sidebar-muted uppercase">{group.label}</p>}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-[38px] items-center gap-3 px-4 text-sm hover:bg-sidebar-accent',
                    active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground',
                  )}
                >
                  <Icon aria-hidden className="size-[18px] shrink-0" />
                  {collapsed ? null : <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
