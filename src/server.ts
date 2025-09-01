import './types/express-augment';
import 'dotenv/config';
import { app } from './app';
import { appConfig } from './config';
import { initializeDependencies, cleanupDependencies } from './config/dependencies';

const port: number = appConfig.port;

async function startServer() {
  try {
    // Initialize dependencies (termasuk DB connection untuk TypeORM)
    await initializeDependencies();
    console.log('Dependencies initialized successfully');
    
    // Setup auth routes setelah dependencies ready
    const { setupAuthRoutes } = require('./router/v1');
    setupAuthRoutes();
    
    // Start server
    const server = app.listen(port, () => {
      console.log(`[server] Listening on port ${port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await cleanupDependencies();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(async () => {
        await cleanupDependencies();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();