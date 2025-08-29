/**
 * Security configuration
 */

import { PasswordConfig } from '../core/security';

export const securityConfig = {
  password: {
    iterations: parseInt(process.env.PASSWORD_PBKDF2_ITERATIONS || '210000'),
    keyLength: 32,
    algorithm: 'sha256',
    saltLength: 16
  } as PasswordConfig,

  session: {
    cookieName: process.env.SESSION_COOKIE_NAME || 'session_id',
    cookieSecure: process.env.NODE_ENV === 'production',
    cookieHttpOnly: true,
    cookieSameSite: 'strict' as const
  },

  cors: {
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  },

  headers: {
    contentSecurityPolicy: "default-src 'self'",
    strictTransportSecurity: 'max-age=31536000; includeSubDomains',
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff'
  }
};

export default securityConfig;
