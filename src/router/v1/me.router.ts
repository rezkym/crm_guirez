/**
 * Me routes - contoh rute privat dengan berbagai guards
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../core/http';
import { createSuccessResponse } from '../../core/http/response';
import { HTTP_STATUS } from '../../core/http/httpStatus';
import { requireAuth } from '../../core/middleware/requireAuth';
import { hasRole } from '../../core/middleware/hasRole';
import { hasPermission } from '../../core/middleware/hasPermission';
import { roleOrPermission } from '../../core/middleware/roleOrPermission';

export function createMeRouter(authService: any): Router {
  const meRouter = Router();

  // Semua routes di /me memerlukan authentication
  meRouter.use(requireAuth(authService));

  /**
   * GET /api/v1/me/profile - Basic profile (sudah ada di auth.router)
   */
  meRouter.get('/profile', asyncHandler(async (req: Request, res: Response) => {
    const profile = {
      userId: req.auth!.userId,
      sessionId: req.auth!.sessionId,
      roles: req.auth!.roles,
      permissions: req.auth!.permissions,
      timestamp: new Date().toISOString()
    };

    res.status(HTTP_STATUS.OK).json(
      createSuccessResponse(profile, req.id)
    );
  }));

  /**
   * GET /api/v1/me/admin - Hanya untuk admin/manager
   */
  meRouter.get('/admin', 
    hasRole('admin', 'manager'),
    asyncHandler(async (req: Request, res: Response) => {
      const adminData = {
        message: 'This is admin-only data',
        userId: req.auth!.userId,
        adminLevel: req.auth!.roles
      };

      res.status(HTTP_STATUS.OK).json(
        createSuccessResponse(adminData, req.id)
      );
    })
  );

  /**
   * GET /api/v1/me/settings - Perlu permission read:settings
   */
  meRouter.get('/settings',
    hasPermission('settings', 'read'),
    asyncHandler(async (req: Request, res: Response) => {
      const settings = {
        message: 'User settings data',
        permissions: req.auth!.permissions
      };

      res.status(HTTP_STATUS.OK).json(
        createSuccessResponse(settings, req.id)
      );
    })
  );

  /**
   * POST /api/v1/me/action - Manager ATAU permission write:actions
   */
  meRouter.post('/action',
    roleOrPermission(['manager'], ['write:actions']),
    asyncHandler(async (req: Request, res: Response) => {
      const result = {
        message: 'Action executed successfully',
        executedBy: req.auth!.userId,
        authorization: {
          roles: req.auth!.roles,
          permissions: req.auth!.permissions
        }
      };

      res.status(HTTP_STATUS.OK).json(
        createSuccessResponse(result, req.id)
      );
    })
  );

  /**
   * GET /api/v1/me/superadmin - Hanya superadmin
   */
  meRouter.get('/superadmin',
    hasRole('superadmin'),
    asyncHandler(async (req: Request, res: Response) => {
      const superAdminData = {
        message: 'Welcome, superadmin!',
        systemInfo: {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        }
      };

      res.status(HTTP_STATUS.OK).json(
        createSuccessResponse(superAdminData, req.id)
      );
    })
  );

  return meRouter;
}

export default createMeRouter;
