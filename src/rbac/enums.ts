// src/rbac/enums.ts

export enum RoleSlug {
  SUPERADMIN = 'superadmin',
  ASSESSOR = 'assessor',
  MARKETING = 'marketing',
  OWNER = 'owner',
  MANAGER = 'manager',
  USER = 'user',
  ADMIN = 'admin',
}

export const INTERNAL_ROLE_SLUGS: ReadonlySet<string> = new Set([
  RoleSlug.SUPERADMIN,
  RoleSlug.ADMIN,
]);

export const EXTERNAL_ROLE_SLUGS: ReadonlySet<string> = new Set([
  RoleSlug.OWNER,
  RoleSlug.MANAGER,
  RoleSlug.MARKETING,
  RoleSlug.ASSESSOR,
  RoleSlug.USER,
]);

export function isInternalRoleSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return INTERNAL_ROLE_SLUGS.has(slug.toLowerCase());
}

export function isExternalRoleSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return EXTERNAL_ROLE_SLUGS.has(slug.toLowerCase());
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  INVITE = 'invite',
  ASSIGN_ROLE = 'assign_role',
}

export enum PermissionResource {
  USER = 'user',
  HOTEL = 'hotel',
  ROLE = 'role',
  PERMISSION = 'permission',
}
