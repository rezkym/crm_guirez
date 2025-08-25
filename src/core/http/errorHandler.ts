import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from './httpStatus';

type Body = {
  error: { message: string };
  meta: { requestId?: string };
};

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = Number(err?.status) || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = typeof err?.message === 'string' ? err.message : 'Internal Server Error';

  if (!res.getHeader('X-Request-ID') && req.requestId) {
    res.setHeader('X-Request-ID', req.requestId);
  }

  const body: Body = {
    error: { message },
    meta: { requestId: req.requestId },
  };

  res.status(status).json(body);
};