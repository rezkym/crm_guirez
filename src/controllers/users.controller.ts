import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';
import { HTTP_STATUS } from '../core/http/httpStatus';
import { createErrorResponse, createSuccessResponse } from '../core/http/response';
import { toUserDTO, toUserPageDTO } from './serializers/user.serializer';

/**
 * Users controller - handles HTTP requests for user management
 * Delegates business logic to UsersService
 */
export class UsersController {
  constructor(private readonly usersService: UsersService) {
    console.log('UsersController constructor called');
    console.log('usersService in constructor:', !!usersService);
    console.log('this.usersService in constructor:', !!this.usersService);
  }

  /**
   * List users with pagination and filtering
   * GET /api/v1/users?page=1&pageSize=20&q=search&status=active
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      console.log('UsersController.list called');
      console.log('usersService:', !!this.usersService);
      
      const page = parseInt((req.query.page as string) || '1', 10);
      const pageSize = parseInt((req.query.pageSize as string) || '20', 10);
      const q = (req.query.q as string) || undefined;
      const status = (req.query.status as any) || undefined;

      console.log('About to call usersService.list with:', { page, pageSize, q, status });
      const result = await this.usersService.list({ page, pageSize, q, status });
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(toUserPageDTO(result), req.id));
    } catch (error) {
      console.error('Error in UsersController.list:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to list users';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(createErrorResponse(errorMessage, req.id));
    }
  }

  /**
   * Get user by ID
   * GET /api/v1/users/:id
   */
  async get(req: Request, res: Response): Promise<void> {
    try {
      const id = BigInt(req.params.id);
      const user = await this.usersService.getById(id);
      
      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND).json(createErrorResponse('User not found', req.id));
        return;
      }
      
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(toUserDTO(user), req.id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(createErrorResponse(errorMessage, req.id));
    }
  }

  /**
   * Create new user
   * POST /api/v1/users
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, password, status, role, roleSlug, hotel_id, hotelId } = req.body || {};
      
      // Basic validation
      if (!email || !password) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(createErrorResponse('email and password are required', req.id));
        return;
      }

      // Email format validation
      if (!this.isValidEmail(email)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(createErrorResponse('invalid email format', req.id));
        return;
      }

      // Normalize input
      const normalizedRoleSlug = (roleSlug || role)?.toString()?.toLowerCase()?.trim();
      const normalizedHotelId = hotelId ?? hotel_id;

      // Scope protection: only superadmin may assign internal scope
      const providedUserScope = (req.body?.userScope || req.body?.user_scope)?.toString()?.toLowerCase()?.trim();
      const isSuperadmin = Array.isArray(req.auth?.roles) && req.auth!.roles.includes('superadmin');

      if (providedUserScope && !['internal', 'external'].includes(providedUserScope)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(createErrorResponse('invalid userScope value', req.id));
        return;
      }

      if (providedUserScope === 'internal' && !isSuperadmin) {
        res.status(HTTP_STATUS.FORBIDDEN).json(createErrorResponse('only superadmin may assign internal user scope', req.id));
        return;
      }

      // Determine final user scope (focus internal first):
      // If creator is superadmin, enforce 'internal' (ignore payload to keep consistent policy now)
      // Else default to 'external'
      const userScope: 'internal' | 'external' = isSuperadmin ? 'internal' : 'external';

      const createPayload = {
        email,
        name,
        password,
        status,
        roleSlug: normalizedRoleSlug,
        hotelId: normalizedHotelId ? BigInt(normalizedHotelId) : undefined,
        userScope,
      };

      const user = await this.usersService.create(createPayload);
      res.status(HTTP_STATUS.CREATED).json(createSuccessResponse(toUserDTO(user), req.id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      const statusCode = errorMessage.includes('Email already') 
        ? HTTP_STATUS.CONFLICT 
        : HTTP_STATUS.UNPROCESSABLE_ENTITY;
      res.status(statusCode).json(createErrorResponse(errorMessage, req.id));
    }
  }

  /**
   * Update user
   * PUT/PATCH /api/v1/users/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = BigInt(req.params.id);
      const { email, name, password, status } = req.body || {};

      const updatePayload = {
        email,
        name,
        password,
        status,
      };

      const updated = await this.usersService.update(id, updatePayload);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(toUserDTO(updated), req.id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json(createErrorResponse(errorMessage, req.id));
    }
  }

  /**
   * Delete user (soft delete)
   * DELETE /api/v1/users/:id
   */
  async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = BigInt(req.params.id);
      await this.usersService.remove(id);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(null, req.id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(createErrorResponse(errorMessage, req.id));
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * Factory function to create users controller
 */
export function createUsersController(service: UsersService): UsersController {
  console.log('createUsersController called with service:', !!service);
  console.log('service type:', typeof service);
  const controller = new UsersController(service);
  console.log('controller created, usersService available:', !!controller['usersService']);
  return controller;
}
