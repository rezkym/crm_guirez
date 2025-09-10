/**
 * Security configuration
 */

import { PasswordConfig } from '../core/security';

export const securityConfig = {
  password: {
    // bcrypt configuration
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12')
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
