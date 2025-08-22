// src/rbac/enums.ts

export enum RoleSlug {
  SUPERADMIN = 'superadmin',
  ASSESSOR = 'assessor',
  MARKETING = 'marketing',
  OWNER = 'owner',
  ADMIN = 'admin',
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