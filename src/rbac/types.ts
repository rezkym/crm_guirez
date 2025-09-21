// src/rbac/types.ts

import { PermissionAction, PermissionResource, RoleSlug } from './enums';

export type ActorRole = {
  slug: RoleSlug | string;
  hotel_id?: bigint | null;
  scope: 'internal' | 'external';
};

export type ActorPermission = {
  action: PermissionAction | string;
  resource: PermissionResource | string;
  hotel_id?: bigint | null;
};

export type Actor = {
  id: bigint;
  email: string;
  roles: ActorRole[];
  permissions?: ActorPermission[];
  isSuperadmin?: boolean;
  scope?: 'internal' | 'external';
};

export type AccessContext = {
  actor: Actor;
  hotelId?: bigint | null; // konteks tenant saat ini (opsional)
};
