/**
 * RoleOrPermission middleware - check apakah user memiliki role ATAU permission
 */

import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '../http/response';
import { HTTP_STATUS } from '../http/httpStatus';
import { RoleSlug } from '../../rbac';

export function roleOrPermission(
  requiredRoles: string[], 
  requiredPermissions: string[]
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Pastikan auth context ada (dari requireAuth middleware)
    if (!req.auth) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse('Authentication required', req.id)
      );
      return;
    }

    const { roles, permissions } = req.auth;
    const roleSlugs = roles.map(role => role.slug);

    // Check superadmin bypass
    if (roleSlugs.includes(RoleSlug.SUPERADMIN) || permissions.includes('*')) {
      next();
      return;
    }

    // Check roles
    const hasRequiredRole = requiredRoles.some(role => roleSlugs.includes(role));
    
    if (hasRequiredRole) {
      next();
      return;
    }

    // Check permissions
    const hasRequiredPermission = requiredPermissions.some(permission => 
      permissions.includes(permission)
    );

    if (hasRequiredPermission) {
      next();
      return;
    }

    // Check wildcard permissions
    const hasWildcardPermission = requiredPermissions.some(permission => {
      const [action, resource] = permission.split(':');
      return permissions.includes(`*:${resource}`) || permissions.includes(`${action}:*`);
    });

    if (hasWildcardPermission) {
      next();
      return;
    }

    res.status(HTTP_STATUS.FORBIDDEN).json(
      createErrorResponse(
        `Requires one of roles: ${requiredRoles.join(', ')} OR permissions: ${requiredPermissions.join(', ')}`, 
        req.id
      )
    );
  };
}
