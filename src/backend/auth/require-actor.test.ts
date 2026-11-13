import { describe, expect, it, vi } from 'vitest';
import type { SessionUser } from '@shared/types/session-user.type';

const { getSessionUser } = vi.hoisted(() => ({ getSessionUser: vi.fn() }));
vi.mock('./get-session-user', () => ({ getSessionUser }));

const { requireActor } = await import('./require-actor');

const ACTOR: SessionUser = {
  id: 'u1',
  name: 'Test',
  email: 'test@lkps.local',
  roles: ['dosen'],
  prodiId: 'p1',
  dosenId: null,
  mustChangePassword: false,
};

describe('requireActor', () => {
  it('returns the signed-in user', async () => {
    getSessionUser.mockResolvedValueOnce(ACTOR);
    await expect(requireActor()).resolves.toEqual(ACTOR);
  });

  it('throws UNAUTHENTICATED when there is no session, without redirecting', async () => {
    getSessionUser.mockResolvedValueOnce(null);
    await expect(requireActor()).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
  });
});
