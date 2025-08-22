import { Router } from 'express';
import { asyncHandler } from '../../core/http';
import { healthController, healthV1 } from '../../controllers';

const v1Router: Router = Router();

v1Router.get('/health', healthV1);

export { v1Router };
export default v1Router;