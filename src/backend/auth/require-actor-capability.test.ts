import { describe, expect, it, vi } from 'vitest';
import type { SessionUser } from '@shared/types/session-user.type';

const { getSessionUser } = vi.hoisted(() => ({ getSessionUser: vi.fn() }));
vi.mock('./get-session-user', () => ({ getSessionUser }));

const { requireActorCapability } = await import('./require-actor-capability');

const DOSEN: SessionUser = {
  id: 'u1',
  name: 'Dosen',
  email: 'dosen@lkps.local',
  roles: ['dosen'],
  prodiId: 'p1',
  dosenId: null,
  mustChangePassword: false,
};

const ADMIN_SISTEM: SessionUser = { ...DOSEN, id: 'u2', roles: ['admin_sistem'] };

describe('requireActorCapability', () => {
  it('returns the actor when they hold the capability', async () => {
    getSessionUser.mockResolvedValueOnce(ADMIN_SISTEM);
    await expect(requireActorCapability('users.manage')).resolves.toEqual(ADMIN_SISTEM);
  });

  it('throws FORBIDDEN (not a redirect) when the actor lacks the capability', async () => {
    getSessionUser.mockResolvedValueOnce(DOSEN);
    await expect(requireActorCapability('users.manage')).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('throws UNAUTHENTICATED when there is no session', async () => {
    getSessionUser.mockResolvedValueOnce(null);
    await expect(requireActorCapability('users.manage')).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
  });
});
