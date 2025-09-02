/**
 * Dependency injection container - wire semua dependencies
 */

import { DataSource } from 'typeorm';
import { PasswordService, RateLimitService } from '../core/security';
import { securityConfig, authConfig, rateLimitConfig, validateAuthConfig } from '../config';
import { 
  MemorySessionStore, 
  MemoryTokenStore, 
  MemoryRateLimitStore 
} from '../data/memory';
import { MemoryUserCredentialsRepository } from '../repositories/user.credentials.repository';
import { SessionStoreTypeORM } from '../data/typeorm/session.store.typeorm';
import { TokenStoreTypeORM } from '../data/typeorm/token.store.typeorm';
import { UserCredentialsRepoTypeORM } from '../repositories/typeorm/user.credentials.repository.typeorm';
import AppDataSource from '../data/typeorm-data-source';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { UserRepositoryTypeORM } from '../repositories/typeorm/user.repository.typeorm';
import { UserRepository } from '../repositories/user.repository';
import { TokenService } from '../services/token.service';

export interface AppDependencies {
  authService: AuthService;
  passwordService: PasswordService;
  rateLimitService: RateLimitService;
  dataSource?: DataSource;
  usersService?: UsersService;
  userRepository?: UserRepository;
}

let dependencies: AppDependencies | null = null;

export async function initializeDependencies(): Promise<AppDependencies> {
  if (dependencies) {
    return dependencies;
  }

  // Validate configuration
  validateAuthConfig();

  // Get data backend configuration
  const dataBackend = process.env.DATA_BACKEND || 'db';
  console.log(`Initializing dependencies with DATA_BACKEND=${dataBackend}`);

  // Initialize core services
  const passwordService = new PasswordService(securityConfig.password);
  
  let sessionStore;
  let tokenStore;
  let userCredentialsRepo;
  let dataSource: DataSource | undefined;
  let userRepository: UserRepository | undefined;
  let usersService: UsersService | undefined;

  if (dataBackend === 'db') {
    // Initialize TypeORM DataSource
    dataSource = AppDataSource;
    
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      console.log('TypeORM DataSource initialized');
    }

    // Initialize TypeORM adapters
    sessionStore = new SessionStoreTypeORM(dataSource);
    tokenStore = new TokenStoreTypeORM(dataSource);
    userCredentialsRepo = new UserCredentialsRepoTypeORM(dataSource);
    userRepository = new UserRepositoryTypeORM(dataSource);
    usersService = new UsersService(userRepository, passwordService);
    
    console.log('Using TypeORM adapters for auth data');
  } else {
    // Initialize in-memory adapters (fallback for development)
    sessionStore = new MemorySessionStore();
    tokenStore = new MemoryTokenStore();
    userCredentialsRepo = new MemoryUserCredentialsRepository();
    
    console.log('Using in-memory adapters for auth data');
  }
  
  // Rate limit tetap menggunakan in-memory untuk sekarang
  const rateLimitStore = new MemoryRateLimitStore();
  
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
    rateLimitService,
    dataSource,
    usersService,
    userRepository
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
 * Cleanup dependencies dan tutup koneksi DB
 */
export async function cleanupDependencies(): Promise<void> {
  if (dependencies?.dataSource?.isInitialized) {
    await dependencies.dataSource.destroy();
    console.log('TypeORM DataSource destroyed');
  }
  dependencies = null;
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
