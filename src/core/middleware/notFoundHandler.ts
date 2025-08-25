import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../http/httpStatus';

export const notFoundHandler = (_req: Request, res: Response, _next: NextFunction) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: { message: 'Not Found' },
    meta: { requestId: res.locals.requestId },
  });
};