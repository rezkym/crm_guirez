/**
 * Authentication configuration
 */

export interface AuthConfig {
  accessTokenTtlDays: number;
  refreshTokenTtlDays: number;
  logoutStrategy: 'access_only' | 'revoke_session';
  cleanupIntervalMinutes: number;
}

export interface RateLimitConfig {
  windowMinutes: number;
  maxAttempts: number;
  lockoutMinutes: number;
}

// Load from environment variables with defaults
export const authConfig: AuthConfig = {
  accessTokenTtlDays: parseInt(process.env.AUTH_ACCESS_TTL_DAYS || '7'),
  refreshTokenTtlDays: parseInt(process.env.AUTH_REFRESH_TTL_DAYS || '30'),
  logoutStrategy: (process.env.AUTH_LOGOUT_STRATEGY as AuthConfig['logoutStrategy']) || 'revoke_session',
  cleanupIntervalMinutes: parseInt(process.env.AUTH_CLEANUP_INTERVAL_MINUTES || '60')
};

export const rateLimitConfig: RateLimitConfig = {
  windowMinutes: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15'),
  maxAttempts: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '5'),
  lockoutMinutes: parseInt(process.env.RATE_LIMIT_LOCKOUT_MINUTES || '15')
};

// Validate environment variables
export const validateAuthConfig = () => {
  const requiredEnvVars = [
    'AUTH_ACCESS_TTL_DAYS',
    'AUTH_REFRESH_TTL_DAYS', 
    'RATE_LIMIT_WINDOW_MINUTES',
    'RATE_LIMIT_MAX_ATTEMPTS',
    'RATE_LIMIT_LOCKOUT_MINUTES',
    'BCRYPT_ROUNDS',
    'AUTH_LOGOUT_STRATEGY'
  ];

  const missingVars = requiredEnvVars.filter(env => !process.env[env]);
  
  if (missingVars.length > 0) {
    console.warn(`Using default values for missing ENV variables: ${missingVars.join(', ')}`);
  }

  console.log('Auth configuration loaded:', {
    authConfig,
    rateLimitConfig,
    bcryptRounds: process.env.BCRYPT_ROUNDS || '12'
  });
};

/**
 * Helper untuk menghitung expiry date
 */
export function getAccessTokenExpiry(): Date {
  return new Date(Date.now() + authConfig.accessTokenTtlDays * 24 * 60 * 60 * 1000);
}

export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + authConfig.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
}

export function getSessionExpiry(): Date {
  // Session expires sama dengan refresh token
  return getRefreshTokenExpiry();
}
