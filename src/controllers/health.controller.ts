import { Request, Response } from 'express';
import { ok } from '../core/http';
import { healthService } from '../services';

export const healthController = {
  async health(_req: Request, res: Response) {
    const status = healthService.getStatus();
    return ok(res, status);
  },
};

export default healthController;