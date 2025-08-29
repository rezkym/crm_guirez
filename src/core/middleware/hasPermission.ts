/**
 * HasPermission middleware - check apakah user memiliki permission tertentu
 */

import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '../http/response';
import { HTTP_STATUS } from '../http/httpStatus';

export function hasPermission(resource: string, action: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Pastikan auth context ada (dari requireAuth middleware)
    if (!req.auth) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse('Authentication required', req.id)
      );
      return;
    }

    const { permissions, roles } = req.auth;

    // Check superadmin bypass (wildcard permission)
    if (permissions.includes('*') || roles.includes('superadmin')) {
      next();
      return;
    }

    // Format permission yang dicari
    const requiredPermission = `${action}:${resource}`;

    // Check exact permission match
    if (permissions.includes(requiredPermission)) {
      next();
      return;
    }

    // Check wildcard action (e.g., *:users)
    const wildcardAction = `*:${resource}`;
    if (permissions.includes(wildcardAction)) {
      next();
      return;
    }

    // Check wildcard resource (e.g., read:*)
    const wildcardResource = `${action}:*`;
    if (permissions.includes(wildcardResource)) {
      next();
      return;
    }

    res.status(HTTP_STATUS.FORBIDDEN).json(
      createErrorResponse(
        `Requires permission: ${requiredPermission}`, 
        req.id
      )
    );
  };
}
