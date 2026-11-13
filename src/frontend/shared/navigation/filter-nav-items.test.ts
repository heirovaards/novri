import { describe, expect, it } from 'vitest';
import { filterNavItems } from './filter-nav-items';
import { navItems } from './nav-items';
import type { Role } from '@shared/permissions/capability.type';

function labelsFor(role: Role): string[] {
  return filterNavItems(navItems, { roles: [role] }).flatMap((group) => group.items.map((item) => item.label));
}

describe('filterNavItems', () => {
  it('shows Dashboard and Pengguna to admin_sistem', () => {
    expect(labelsFor('admin_sistem')).toEqual(['Pengguna']);
  });

  it('shows only Dashboard to kaprodi', () => {
    expect(labelsFor('kaprodi')).toEqual(['Dashboard']);
  });

  it('shows only Dashboard to admin_prodi', () => {
    expect(labelsFor('admin_prodi')).toEqual(['Dashboard']);
  });

  it('shows only Dashboard to dtpr', () => {
    expect(labelsFor('dtpr')).toEqual(['Dashboard']);
  });

  it('shows only Dashboard to dosen', () => {
    expect(labelsFor('dosen')).toEqual(['Dashboard']);
  });
});
