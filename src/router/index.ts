import { Router } from 'express';
import { asyncHandler } from '../core/http';
import { healthController } from '../controllers';
import { v1Router } from './v1';
import { appConfig } from '../config';

const rootRouter: Router = Router();

// Tetap dukung /api/health (lama)
rootRouter.get('/health', asyncHandler(healthController.health));

// Tambah versi: /api/v1/*
rootRouter.use(`/${appConfig.apiVersion}`, v1Router);

export { rootRouter };
export default rootRouter;