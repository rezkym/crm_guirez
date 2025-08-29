/**
 * Auth routes - rute untuk autentikasi
 */

import { Router } from 'express';
import { asyncHandler } from '../../core/http';
import { createAuthController } from '../../controllers/auth.controller';
import { requireAuth } from '../../core/middleware/requireAuth';

// Dependency injection akan dilakukan di level app
export function createAuthRouter(authService: any): Router {
  const authRouter = Router();
  const authController = createAuthController(authService);

  // Public routes
  authRouter.post('/login', asyncHandler(authController.login));
  authRouter.post('/refresh', asyncHandler(authController.refresh));

  // Protected routes
  authRouter.post('/logout', requireAuth(authService), asyncHandler(authController.logout));
  authRouter.get('/me', requireAuth(authService), asyncHandler(authController.me));

  return authRouter;
}

export default createAuthRouter;
