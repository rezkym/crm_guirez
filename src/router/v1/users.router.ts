import { Router } from 'express';
import { asyncHandler } from '../../core/http/asyncHandler';
import { requireAuth } from '../../core/middleware/requireAuth';
import { UsersService } from '../../services/users.service';
import { createUsersController } from '../../controllers/users.controller';
import { hasPermission } from '../../core/middleware/hasPermission';

export function createUsersRouter(usersService: UsersService, authService: any): Router {
  const router = Router();
  const controller = createUsersController(usersService);

  router.use(requireAuth(authService));

  // Read users: require permission read:users
  router.get('/', hasPermission('users', 'read'), asyncHandler(controller.list.bind(controller)));
  router.get('/:id', hasPermission('users', 'read'), asyncHandler(controller.get.bind(controller)));

  // Create/Update/Delete users: require permission write:users
  router.post('/', hasPermission('users', 'write'), asyncHandler(controller.create.bind(controller)));
  router.put('/:id', hasPermission('users', 'write'), asyncHandler(controller.update.bind(controller)));
  router.patch('/:id', hasPermission('users', 'write'), asyncHandler(controller.update.bind(controller)));
  router.delete('/:id', hasPermission('users', 'write'), asyncHandler(controller.remove.bind(controller)));

  return router;
}

export default createUsersRouter;
