import { Router } from 'express';
import { asyncHandler } from '../../core/http';
import { healthController, healthV1 } from '../../controllers';
import { createAuthRouter } from './auth.router';
import { createMeRouter } from './me.router';
import { createUsersRouter } from './users.router';
import { getDependencies } from '../../config/dependencies';

const v1Router: Router = Router();

// Health check (public)
v1Router.get('/health', healthV1);

// Setup auth routes - akan dipanggil dari app.ts setelah dependencies ready
export const setupAuthRoutes = () => {
  try {
    const dependencies = getDependencies();
    console.log('Dependencies:', Object.keys(dependencies));
    console.log('usersService available:', !!dependencies.usersService);
    
    const { authService, usersService } = dependencies;
    
    // Auth routes
    v1Router.use('/auth', createAuthRouter(authService));
    
    // Protected example routes
    v1Router.use('/me', createMeRouter(authService));

    // Users CRUD (protected)
    if (usersService) {
      console.log('Setting up users routes with usersService');
      v1Router.use('/users', createUsersRouter(usersService, authService));
    } else {
      console.log('usersService not available, skipping users routes');
    }
    
    console.log('Auth routes setup successfully');
  } catch (error) {
    console.error('Failed to setup auth routes:', error);
    // Routes bisa tetap berjalan tanpa auth untuk development
  }
};

export { v1Router };
export default v1Router;
