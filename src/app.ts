import express from 'express';
import { rootRouter } from './router';
import { requestId, notFoundHandler } from './core/middleware';
import { errorHandler } from './core/http';
import { appConfig } from './config';
import { initializeDependencies } from './config/dependencies';

const app: express.Application = express();

// Initialize auth dependencies sebelum setup routes
try {
  initializeDependencies();
  console.log('Auth system initialized successfully');
  
  // Setup auth routes setelah dependencies ready
  const { setupAuthRoutes } = require('./router/v1');
  setupAuthRoutes();
} catch (error) {
  console.error('Failed to initialize auth system:', error);
  // App tetap bisa jalan tanpa auth untuk development
}

app.use(express.json());
app.use(requestId());
app.use(appConfig.apiPrefix, rootRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export { app };
export default app;