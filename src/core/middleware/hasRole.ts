/**
 * HasRole middleware - check apakah user memiliki role tertentu
 */

import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '../http/response';
import { HTTP_STATUS } from '../http/httpStatus';

export function hasRole(...requiredRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Pastikan auth context ada (dari requireAuth middleware)
    if (!req.auth) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse('Authentication required', req.id)
      );
      return;
    }

    const { roles } = req.auth;

    // Check superadmin bypass (jika ada)
    if (roles.includes('superadmin')) {
      next();
      return;
    }

    // Check apakah user memiliki salah satu role yang diperlukan
    const hasRequiredRole = requiredRoles.some(role => roles.includes(role));

    if (!hasRequiredRole) {
      res.status(HTTP_STATUS.FORBIDDEN).json(
        createErrorResponse(
          `Requires one of these roles: ${requiredRoles.join(', ')}`, 
          req.id
        )
      );
      return;
    }

    next();
  };
}
