import { Response } from 'express';
import { HTTP_STATUS } from './httpStatus';

export type Meta = Record<string, unknown> | undefined;

export const ok = <T>(res: Response, data: T, meta?: Meta) => 
    res.status(HTTP_STATUS.OK).json({ data, meta });

export const created = <T>(res: Response, data: T, meta?: Meta) => 
    res.status(HTTP_STATUS.CREATED).json({ data, meta });

export const noContent = (res: Response) => 
    res.status(HTTP_STATUS.NO_CONTENT).send();