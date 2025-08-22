// src/rbac/types.ts

import { PermissionAction, PermissionResource, RoleSlug } from './enums';

export type Actor = {
  id: bigint;
  email: string;
  roles: { slug: RoleSlug; hotel_id?: bigint | null }[];
  permissions?: { action: PermissionAction; resource: PermissionResource; hotel_id?: bigint | null }[];
  isSuperadmin?: boolean;
};

export type AccessContext = {
  actor: Actor;
  hotelId?: bigint | null; // konteks tenant saat ini (opsional)
};