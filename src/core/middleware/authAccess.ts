import { Request, Response, NextFunction } from 'express';
import { AppError } from '../http/error';

/**
 * Middleware placeholder untuk verifikasi Bearer access token (non-JWT)
 * TODO: Implementasi validasi opaque token di tahap berikutnya
 */
export const authAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new AppError('Invalid access token format', 401);
    }

    // TODO: Validasi opaque token dengan database/cache
    // Untuk sementara, placeholder validation
    if (token === 'invalid') {
      throw new AppError('Invalid or expired access token', 401);
    }

    // TODO: Set user data ke req.user setelah validasi token
    // req.user = userData;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware optional auth - tidak throw error jika tidak ada token
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // TODO: Validasi token jika ada
      // req.user = userData;
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};