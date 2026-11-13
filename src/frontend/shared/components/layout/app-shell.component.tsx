'use client';

import { useState } from 'react';
import type { SessionUser } from '@shared/types/session-user.type';
import { navItems } from '../../navigation/nav-items';
import { filterNavItems } from '../../navigation/filter-nav-items';
import { AppSidebar } from './app-sidebar.component';
import { AppTopbar } from './app-topbar.component';

export function AppShell({
  user,
  initialCollapsed,
  children,
}: {
  user: SessionUser;
  initialCollapsed: boolean;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const navGroups = filterNavItems(navItems, user);

  function toggleSidebar() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `sidebar-collapsed=${next}; path=/; max-age=31536000`;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar groups={navGroups} collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar user={user} onToggleSidebar={toggleSidebar} />
        <main className="flex-1 px-6 py-6">{children}</main>
        <footer className="border-t border-border px-6 py-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>© 2026 Program Studi Sistem Informasi · Universitas Katolik Indonesia Atma Jaya</span>
            <span>v0.1.0</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
