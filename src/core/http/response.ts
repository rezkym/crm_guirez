import { Response } from 'express';
import { HTTP_STATUS } from './httpStatus';

const metaOf = (res: Response, extra?: Record<string, unknown>) => ({
  requestId: res.locals.requestId,
  ...(extra ?? {}),
});

export const ok = (res: Response, data: unknown, meta?: Record<string, unknown>) =>
  res.status(HTTP_STATUS.OK).json({ data, meta: metaOf(res, meta) });

export const created = (res: Response, data: unknown, meta?: Record<string, unknown>) =>
  res.status(HTTP_STATUS.CREATED).json({ data, meta: metaOf(res, meta) });

// Catatan: untuk konsistensi kontrak, kembalikan 200 dengan body kosong standar
export const noContent = (res: Response, meta?: Record<string, unknown>) =>
  res.status(HTTP_STATUS.OK).json({ data: null, meta: metaOf(res, meta) });