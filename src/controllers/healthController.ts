import { Request, Response } from 'express';
import { ok } from '../core/http';
import { healthService } from '../services';
import { appConfig } from '../config';
import { asyncHandler } from '../core/http';

export const healthController = {
  async health(_req: Request, res: Response) {
    const status = healthService.getStatus();
    return ok(res, status);
  },
};

export const healthV1 = asyncHandler(async (_req, res) => {
  // asumsi getStatus() sudah ada dan dipakai oleh handler legacy
  const status = healthService.getStatus();
  return ok(res, { ...status, version: appConfig.apiVersion });
});

export default healthController;