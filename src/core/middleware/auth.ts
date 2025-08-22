// src/core/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';

export interface AuthContext {
  token?: string;
  actorId?: bigint; // akan diisi saat verifikasi token di tahap selanjutnya
}

export function authParse(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization') ?? req.header('Authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : undefined;
  (req as any).auth = { token };
  next();
}