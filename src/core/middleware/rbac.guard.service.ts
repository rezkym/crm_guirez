/**
 * RBAC Guard Service - helper untuk kombinasi guards dan logic RBAC
 */

import { AuthContext } from '../../domain/auth';
import { RoleSlug, isInternalRoleSlug } from '../../rbac';

export class RbacGuardService {
  static getRoleSlugs(authContext: AuthContext): string[] {
    return authContext.roles.map(role => role.slug);
  }

  static isInternalActor(authContext: AuthContext): boolean {
    if (authContext.scope === 'internal') {
      return true;
    }

    return authContext.roles.some(role => isInternalRoleSlug(role.slug));
  }

  /**
   * Check apakah user memiliki role tertentu
   */
  static hasRole(authContext: AuthContext, requiredRoles: string[]): boolean {
    const roleSlugs = this.getRoleSlugs(authContext);

    // Superadmin bypass
    if (roleSlugs.includes(RoleSlug.SUPERADMIN)) {
      return true;
    }

    return requiredRoles.some(role => roleSlugs.includes(role));
  }

  /**
   * Check apakah user memiliki permission tertentu
   */
  static hasPermission(authContext: AuthContext, resource: string, action: string): boolean {
    const { permissions } = authContext;
    const roleSlugs = this.getRoleSlugs(authContext);

    // Superadmin atau wildcard permission bypass
    if (permissions.includes('*') || roleSlugs.includes(RoleSlug.SUPERADMIN)) {
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
    const { permissions } = authContext;
    const roleSlugs = this.getRoleSlugs(authContext);

    // Jika superadmin atau punya wildcard, return semua
    if (roleSlugs.includes(RoleSlug.SUPERADMIN) || permissions.includes('*')) {
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
