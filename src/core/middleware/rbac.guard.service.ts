/**
 * RBAC Guard Service - helper untuk kombinasi guards dan logic RBAC
 */

import { AuthContext } from '../../domain/auth';

export class RbacGuardService {
  /**
   * Check apakah user memiliki role tertentu
   */
  static hasRole(authContext: AuthContext, requiredRoles: string[]): boolean {
    const { roles } = authContext;

    // Superadmin bypass
    if (roles.includes('superadmin')) {
      return true;
    }

    return requiredRoles.some(role => roles.includes(role));
  }

  /**
   * Check apakah user memiliki permission tertentu
   */
  static hasPermission(authContext: AuthContext, resource: string, action: string): boolean {
    const { permissions, roles } = authContext;

    // Superadmin atau wildcard permission bypass
    if (permissions.includes('*') || roles.includes('superadmin')) {
      return true;
    }

    const requiredPermission = `${resource}:${action}`;

    // Check exact, wildcard action, atau wildcard resource
    return permissions.includes(requiredPermission) ||
           permissions.includes(`*:${resource}`) ||
           permissions.includes(`${action}:*`);
  }

  /**
   * Check apakah user memiliki role ATAU permission
   */
  static hasRoleOrPermission(
    authContext: AuthContext, 
    requiredRoles: string[], 
    requiredPermissions: string[]
  ): boolean {
    return this.hasRole(authContext, requiredRoles) ||
           requiredPermissions.some(permission => {
             const [action, resource] = permission.split(':');
             return this.hasPermission(authContext, resource, action);
           });
  }

  /**
   * Get effective permissions untuk user (expand wildcards)
   */
  static getEffectivePermissions(authContext: AuthContext): string[] {
    const { permissions, roles } = authContext;

    // Jika superadmin atau punya wildcard, return semua
    if (roles.includes('superadmin') || permissions.includes('*')) {
      return ['*'];
    }

    return permissions;
  }

  /**
   * Check apakah user bisa mengakses resource milik user lain
   */
  static canAccessUserResource(
    authContext: AuthContext, 
    targetUserId: string, 
    resource: string,
    action: string
  ): boolean {
    // Jika mengakses resource sendiri, always allowed (asumsi basic read)
    if (authContext.userId === targetUserId && action === 'read') {
      return true;
    }

    // Check permission normal
    return this.hasPermission(authContext, resource, action);
  }
}
