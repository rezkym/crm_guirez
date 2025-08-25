import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

export function requestId() {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = randomUUID();
    res.setHeader('X-Request-ID', id);
    req.requestId = id;
    res.locals.requestId = id;
    next();
  };
}