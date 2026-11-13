import type { SessionUser } from '@shared/types/session-user.type';
import { DomainError } from '../shared/domain-error';
import { getSessionUser } from './get-session-user';

export async function requireActor(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new DomainError('UNAUTHENTICATED', 'Sesi Anda berakhir. Silakan masuk kembali.');
  return user;
}
