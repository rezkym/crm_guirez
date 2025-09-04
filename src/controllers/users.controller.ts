import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';
import { HTTP_STATUS } from '../core/http/httpStatus';
import { createErrorResponse, createSuccessResponse } from '../core/http/response';
import { toUserDTO, toUserPageDTO } from './serializers/user.serializer';

export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  list = async (req: Request, res: Response) => {
    const page = parseInt((req.query.page as string) || '1', 10);
    const pageSize = parseInt((req.query.pageSize as string) || '20', 10);
    const q = (req.query.q as string) || undefined;
    const status = (req.query.status as any) || undefined;

    const result = await this.usersService.list({ page, pageSize, q, status });
    res.status(HTTP_STATUS.OK).json(createSuccessResponse(toUserPageDTO(result), req.id));
  };

  get = async (req: Request, res: Response) => {
    const id = BigInt(req.params.id);
    const user = await this.usersService.getById(id);
    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json(createErrorResponse('User not found', req.id));
      return;
    }
    res.status(HTTP_STATUS.OK).json(createSuccessResponse(toUserDTO(user), req.id));
  };

  create = async (req: Request, res: Response) => {
    const { email, name, password, status, role, roleSlug, hotel_id, hotelId } = req.body || {};
    if (!email || !password) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(createErrorResponse('email and password are required', req.id));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(createErrorResponse('invalid email format', req.id));
      return;
    }
    if (status !== undefined) {
      const allowed = ['active', 'suspended', 'freeze'];
      const normalized = typeof status === 'string' ? status.toLowerCase().trim() : status;
      if (!allowed.includes(normalized)) {
        res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json(createErrorResponse('invalid status value', req.id));
        return;
      }
      (req.body as any).status = normalized;
    }
    try {
      const roleValue = (roleSlug || role)?.toString()?.toLowerCase()?.trim();
      const hid = hotelId ?? hotel_id;
      const user = await this.usersService.create({ email, name, password, status, roleSlug: roleValue, hotelId: hid ? BigInt(hid) : undefined });
      res.status(HTTP_STATUS.CREATED).json(createSuccessResponse(toUserDTO(user), req.id));
    } catch (e: any) {
      const msg = e?.message || 'failed to create user';
      const code = msg.includes('Email already') ? HTTP_STATUS.CONFLICT : HTTP_STATUS.UNPROCESSABLE_ENTITY;
      res.status(code).json(createErrorResponse(msg, req.id));
    }
  };

  update = async (req: Request, res: Response) => {
    const id = BigInt(req.params.id);
    const { email, name, password, status } = req.body || {};
    if (status !== undefined) {
      const allowed = ['active', 'suspended', 'freeze'];
      const normalized = typeof status === 'string' ? status.toLowerCase().trim() : status;
      if (!allowed.includes(normalized)) {
        res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json(createErrorResponse('invalid status value', req.id));
        return;
      }
      (req.body as any).status = normalized;
    }
    try {
      const updated = await this.usersService.update(id, { email, name, password, status });
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(toUserDTO(updated), req.id));
    } catch (e: any) {
      const msg = e?.message || 'failed to update user';
      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json(createErrorResponse(msg, req.id));
    }
  };

  remove = async (req: Request, res: Response) => {
    const id = BigInt(req.params.id);
    await this.usersService.remove(id);
    res.status(HTTP_STATUS.OK).json(createSuccessResponse(null, req.id));
  };
}

export function createUsersController(service: UsersService) {
  return new UsersController(service);
}
