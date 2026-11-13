import type { Capability } from '@shared/permissions/capability.type';
import type { SessionUser } from '@shared/types/session-user.type';
import { canPerform } from '@shared/permissions/can-perform';
import { DomainError } from '../shared/domain-error';
import { requireActor } from './require-actor';

export async function requireActorCapability(capability: Capability): Promise<SessionUser> {
  const actor = await requireActor();
  if (!canPerform(actor, capability)) throw new DomainError('FORBIDDEN', 'Anda tidak memiliki akses untuk tindakan ini.');
  return actor;
}
