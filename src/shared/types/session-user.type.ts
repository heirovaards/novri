import type { Role } from '../permissions/capability.type';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  prodiId: string;
  dosenId: string | null;
  mustChangePassword: boolean;
};
