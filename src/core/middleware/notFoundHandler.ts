import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS } from '../http';

export function notFoundHandler(_req: Request, res: Response, _next: NextFunction) {
  res.status(HTTP_STATUS.NOT_FOUND).json({ error: { message: 'Not Found' } });
}