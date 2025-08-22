import { RequestHandler } from 'express';

export function asyncHandler<T extends RequestHandler>(handler: T): RequestHandler {
  return (async (req, res, next) => { try { await Promise.resolve(handler(req, res, next)); } catch (e) { next(e); } }) as RequestHandler;
}