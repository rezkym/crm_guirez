import { Request, Response } from 'express';
import { HotelsService, CreateHotelDTO, UpdateHotelDTO } from '../services/hotels.service';
import { HTTP_STATUS } from '../core/http/httpStatus';
import { createErrorResponse, createSuccessResponse } from '../core/http/response';
import { toHotelDTO, toHotelPageDTO } from './serializers/hotel.serializer';
import { ForbiddenError } from '../core/http/error';

export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt((req.query.page as string) || '1', 10);
      const pageSize = parseInt((req.query.pageSize as string) || '20', 10);
      const status = (req.query.status as any) || undefined;
      const q = (req.query.q as string) || undefined;
      const ownerIdRaw = (req.query.ownerUserId as string) || (req.query.owner_user_id as string) || undefined;

      let owner_user_id: bigint | undefined;
      if (ownerIdRaw) {
        owner_user_id = BigInt(ownerIdRaw);
      }

      const result = await this.hotelsService.list({ page, pageSize, status, q, owner_user_id }, req.auth);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(toHotelPageDTO(result), req.id));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to list hotels';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(createErrorResponse(errorMessage, req.id));
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const id = BigInt(req.params.id);
      const hotel = await this.hotelsService.getById(id, req.auth);

      if (!hotel) {
        res.status(HTTP_STATUS.NOT_FOUND).json(createErrorResponse('Hotel not found', req.id));
        return;
      }

      res.status(HTTP_STATUS.OK).json(createSuccessResponse(toHotelDTO(hotel), req.id));
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(HTTP_STATUS.FORBIDDEN).json(createErrorResponse(error.message, req.id));
        return;
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to get hotel';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(createErrorResponse(errorMessage, req.id));
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, status } = req.body || {};
      const ownerIdRaw = req.body?.ownerUserId ?? req.body?.owner_user_id;
      const ownerUserId = ownerIdRaw != null && ownerIdRaw !== '' ? BigInt(ownerIdRaw) : undefined;

      if (!name) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(createErrorResponse('name is required', req.id));
        return;
      }

      const payload: CreateHotelDTO = {
        name,
        status,
        ownerUserId,
      };

      const hotel = await this.hotelsService.create(payload, req.auth);
      res.status(HTTP_STATUS.CREATED).json(createSuccessResponse(toHotelDTO(hotel), req.id));
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(HTTP_STATUS.FORBIDDEN).json(createErrorResponse(error.message, req.id));
        return;
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to create hotel';
      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json(createErrorResponse(errorMessage, req.id));
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = BigInt(req.params.id);
      const { name, status } = req.body || {};
      const ownerIdRaw = req.body?.ownerUserId ?? req.body?.owner_user_id;
      const ownerUserId = ownerIdRaw != null && ownerIdRaw !== '' ? BigInt(ownerIdRaw) : undefined;

      const payload: UpdateHotelDTO = {
        name,
        status,
        ownerUserId,
      };

      const hotel = await this.hotelsService.update(id, payload, req.auth);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(toHotelDTO(hotel), req.id));
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(HTTP_STATUS.FORBIDDEN).json(createErrorResponse(error.message, req.id));
        return;
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to update hotel';
      res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json(createErrorResponse(errorMessage, req.id));
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = BigInt(req.params.id);
      await this.hotelsService.remove(id, req.auth);
      res.status(HTTP_STATUS.OK).json(createSuccessResponse(null, req.id));
    } catch (error) {
      if (error instanceof ForbiddenError) {
        res.status(HTTP_STATUS.FORBIDDEN).json(createErrorResponse(error.message, req.id));
        return;
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete hotel';
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(createErrorResponse(errorMessage, req.id));
    }
  }
}

export function createHotelsController(service: HotelsService): HotelsController {
  return new HotelsController(service);
}
