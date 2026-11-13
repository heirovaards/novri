import { LayoutDashboard, UserCog } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Capability } from '@shared/permissions/capability.type';
import { appRoutes } from '@shared/constants/app-routes';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  capabilities: Capability[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navItems: NavGroup[] = [
  {
    label: 'UMUM',
    items: [{ label: 'Dashboard', href: appRoutes.dashboard, icon: LayoutDashboard, capabilities: ['dashboard.full', 'dashboard.my_tasks'] }],
  },
  {
    label: 'PENGATURAN',
    items: [{ label: 'Pengguna', href: appRoutes.adminPengguna, icon: UserCog, capabilities: ['users.manage'] }],
  },
];
