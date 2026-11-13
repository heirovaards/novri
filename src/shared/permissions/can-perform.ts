import type { Capability } from './capability.type';
import type { SessionUser } from '../types/session-user.type';
import { permissionMatrix } from './permission-matrix';

export function canPerform(user: Pick<SessionUser, 'roles'>, capability: Capability): boolean {
  return permissionMatrix[capability].some((role) => user.roles.includes(role));
}
