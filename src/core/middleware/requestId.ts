import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

export function requestId() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Allow incoming request-id if provided, otherwise generate
    const incoming = req.get('X-Request-ID') || req.get('X-Request-Id');
    const id = (incoming && typeof incoming === 'string' && incoming.trim()) || randomUUID();
    res.setHeader('X-Request-ID', id);
    // Keep both properties for backward compatibility
    req.id = id;
    req.requestId = id;
    res.locals.requestId = id;
    next();
  };
}
