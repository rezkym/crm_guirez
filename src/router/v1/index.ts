import { Router } from 'express';
import { asyncHandler } from '../../core/http';
import { healthController } from '../../controllers';

const v1Router: Router = Router();

v1Router.get('/health', asyncHandler(healthController.health));

export { v1Router };
export default v1Router;