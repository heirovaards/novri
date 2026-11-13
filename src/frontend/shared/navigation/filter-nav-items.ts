import { canPerform } from '@shared/permissions/can-perform';
import type { SessionUser } from '@shared/types/session-user.type';
import type { NavGroup } from './nav-items';

export function filterNavItems(groups: NavGroup[], user: Pick<SessionUser, 'roles'>): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.capabilities.some((capability) => canPerform(user, capability))),
    }))
    .filter((group) => group.items.length > 0);
}
