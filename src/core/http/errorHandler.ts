import { NextFunction, Request, Response } from 'express';
import { HttpError } from './error';
import { HTTP_STATUS } from './httpStatus';

type Body = { error:{ message:string; details?:unknown; stack?:string }; requestId?:string };

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const isHttp = err instanceof HttpError;

  const status = isHttp ? err.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;

  const body: Body = { error: { message: isHttp ? err.message : 'Internal Server Error' }, requestId: (req as any).requestId };

  if (isHttp && (err as HttpError).details) body.error.details = (err as HttpError).details;

  if (process.env.NODE_ENV === 'development' && err instanceof Error) body.error.stack = err.stack;
  
  res.status(status).json(body);
}