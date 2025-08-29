/**
 * Dependency injection container - wire semua dependencies
 */

import { PasswordService, RateLimitService } from '../core/security';
import { securityConfig, authConfig, rateLimitConfig, validateAuthConfig } from '../config';
import { 
  MemorySessionStore, 
  MemoryTokenStore, 
  MemoryRateLimitStore 
} from '../data/memory';
import { MemoryUserCredentialsRepository } from '../repositories/user.credentials.repository';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

export interface AppDependencies {
  authService: AuthService;
  passwordService: PasswordService;
  rateLimitService: RateLimitService;
}

let dependencies: AppDependencies | null = null;

export function initializeDependencies(): AppDependencies {
  if (dependencies) {
    return dependencies;
  }

  // Validate configuration
  validateAuthConfig();

  // Initialize core services
  const passwordService = new PasswordService(securityConfig.password);
  
  // Initialize stores (in-memory untuk sekarang)
  const sessionStore = new MemorySessionStore();
  const tokenStore = new MemoryTokenStore();
  const rateLimitStore = new MemoryRateLimitStore();
  
  // Initialize repositories
  const userCredentialsRepo = new MemoryUserCredentialsRepository();
  
  // Initialize services
  const rateLimitService = new RateLimitService(rateLimitConfig, rateLimitStore);
  const tokenService = new TokenService(tokenStore, sessionStore);
  const authService = new AuthService(
    userCredentialsRepo,
    sessionStore,
    tokenService,
    passwordService,
    rateLimitService
  );

  dependencies = {
    authService,
    passwordService,
    rateLimitService
  };

  // Setup cleanup interval
  setupCleanupScheduler(authService);

  return dependencies;
}

export function getDependencies(): AppDependencies {
  if (!dependencies) {
    throw new Error('Dependencies not initialized. Call initializeDependencies() first.');
  }
  return dependencies;
}

/**
 * Setup periodic cleanup untuk expired sessions/tokens
 */
function setupCleanupScheduler(authService: AuthService): void {
  const cleanupIntervalMs = authConfig.cleanupIntervalMinutes * 60 * 1000;
  
  setInterval(async () => {
    try {
      const result = await authService.cleanup();
      console.log('Auth cleanup completed:', result);
    } catch (error) {
      console.error('Auth cleanup failed:', error);
    }
  }, cleanupIntervalMs);

  console.log(`Auth cleanup scheduled every ${authConfig.cleanupIntervalMinutes} minutes`);
}
