// src/rbac/rbac.service.ts

import { AccessContext, Actor } from './types';
import { PermissionAction, PermissionResource, RoleSlug } from './enums';

export function hasRole(
  actor: Actor,
  slug: RoleSlug,
  hotelId?: bigint | null
): boolean {
  if (actor.isSuperadmin) return true;

  return actor.roles.some(r =>
    r.slug === slug && (hotelId == null || r.hotel_id == null || r.hotel_id === hotelId)
  );
}

export function hasPermission(
  actor: Actor,
  action: PermissionAction,
  resource: PermissionResource,
  hotelId?: bigint | null
): boolean {
  if (actor.isSuperadmin) return true;

  if (!actor.permissions) return false;

  return actor.permissions.some(p =>
    p.action === action &&
    p.resource === resource &&
    (hotelId == null || p.hotel_id == null || p.hotel_id === hotelId)
  );
}

export function can(
  ctx: AccessContext,
  action: PermissionAction,
  resource: PermissionResource
): boolean {
  const { actor, hotelId } = ctx;
  return hasPermission(actor, action, resource, hotelId);
}