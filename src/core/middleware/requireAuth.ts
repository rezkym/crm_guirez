/**
 * RequireAuth middleware - validasi access token dan set auth context
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../core/security';
import { createErrorResponse } from '../http/response';
import { HTTP_STATUS } from '../http/httpStatus';

export function requireAuth(authService: AuthService) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract bearer token dari Authorization header
      const authHeader = req.get('Authorization');
      const accessToken = TokenService.extractBearerToken(authHeader);

      if (!accessToken) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createErrorResponse('Access token required', req.id)
        );
        return;
      }

      // Validate token format
      if (!TokenService.isValidTokenFormat(accessToken)) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createErrorResponse('Invalid token format', req.id)
        );
        return;
      }

      // Create auth context dari token
      const authContext = await authService.createAuthContext(accessToken);

      if (!authContext) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createErrorResponse('Invalid or expired token', req.id)
        );
        return;
      }

      // Set auth context ke request
      req.auth = authContext;

      next();

    } catch (error) {
      console.error('Auth middleware error:', error);
      
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse('Authentication failed', req.id)
      );
    }
  };
}
