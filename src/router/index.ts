import { Router, Request, Response } from 'express';

/**
 * Router utama (entry point)
 * - Hanya route /health untuk verifikasi server hidup
 * - Route bisnis/fitur akan ditambahkan kemudian
 */
const rootRouter: Router = Router();

rootRouter.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime_seconds: Math.round(process.uptime()),
  });
});

export { rootRouter };
export default rootRouter;