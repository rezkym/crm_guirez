/**
 * Auth controller - handle HTTP requests untuk autentikasi
 */

import { Request, Response } from 'express';
import { AuthService, LoginRequest } from '../services/auth.service';
import { createSuccessResponse, createErrorResponse } from '../core/http/response';
import { HTTP_STATUS } from '../core/http/httpStatus';
import { TokenService as TokenUtil } from '../core/security';

export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/v1/auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse('Email and password are required', req.id)
        );
        return;
      }

      // Email format validation (basic)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse('Invalid email format', req.id)
        );
        return;
      }

      const loginRequest: LoginRequest = {
        email: email.toLowerCase().trim(),
        password,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection.remoteAddress
      };

      const result = await this.authService.login(loginRequest);

      res.status(HTTP_STATUS.OK).json(
        createSuccessResponse(result, req.id)
      );

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      
      // Check specific error types untuk appropriate status codes
      if (message.includes('Too many login attempts')) {
        res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
          createErrorResponse(message, req.id)
        );
      } else if (message.includes('Invalid credentials') || message.includes('not active')) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createErrorResponse('Invalid credentials', req.id)
        );
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
          createErrorResponse('Login failed', req.id)
        );
      }
    }
  };

  /**
   * POST /api/v1/auth/refresh
   */
  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse('Refresh token is required', req.id)
        );
        return;
      }

      // Basic token format validation
      if (!TokenUtil.isValidTokenFormat(refreshToken)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse('Invalid token format', req.id)
        );
        return;
      }

      const result = await this.authService.refresh(
        refreshToken, 
        req.id,
        req.get('User-Agent'),
        req.ip || req.connection.remoteAddress
      );

      res.status(HTTP_STATUS.OK).json(
        createSuccessResponse(result, req.id)
      );

    } catch (error: any) {
      // Handle refresh token reuse detection dengan response code khusus
      if (error.code === 'REFRESH_REUSE_DETECTED') {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: { 
            code: 'REFRESH_REUSE_DETECTED',
            message: 'Refresh token reuse detected; session revoked' 
          },
          meta: { requestId: req.id }
        });
        return;
      }
      
      // Semua refresh errors lainnya adalah unauthorized untuk security
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse('Invalid or expired refresh token', req.id)
      );
    }
  };

  /**
   * POST /api/v1/auth/logout
   * Requires: Authorization header dengan valid access token
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.get('Authorization');
      const accessToken = TokenUtil.extractBearerToken(authHeader);

      if (!accessToken) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createErrorResponse('Access token required', req.id)
        );
        return;
      }

      await this.authService.logout(accessToken);

      res.status(HTTP_STATUS.OK).json(
        createSuccessResponse(null, req.id)
      );

    } catch (error) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse('Invalid access token', req.id)
      );
    }
  };

  /**
   * GET /api/v1/auth/me
   * Requires: Authorization header dengan valid access token
   */
  me = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.get('Authorization');
      const accessToken = TokenUtil.extractBearerToken(authHeader);

      if (!accessToken) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          createErrorResponse('Access token required', req.id)
        );
        return;
      }

      const result = await this.authService.me(accessToken);

      res.status(HTTP_STATUS.OK).json(
        createSuccessResponse(result, req.id)
      );

    } catch (error) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        createErrorResponse('Invalid access token', req.id)
      );
    }
  };
}

// Factory function untuk dependency injection
export function createAuthController(authService: AuthService): AuthController {
  return new AuthController(authService);
}
