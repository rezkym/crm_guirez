/**
 * Auth domain types - definisi tipe data untuk sistem autentikasi
 */

export interface Session {
  sessionId: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  revokeReason?: SessionRevokeReason;
  lastSeenAt?: Date;
  lastUa?: string;
  lastIp?: string;
  anomalyCount?: number;
}

export interface TokenRecord {
  tokenId: string;
  sessionId: string;
  userId: string;
  type: TokenType;
  tokenHash: string;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  rotatedFrom?: string;
}

export type AuthScope = 'internal' | 'external';

export interface AuthRole {
  slug: string;
  hotelId?: string | null;
  scope: AuthScope;
}

export interface UserCredentials {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  status: UserStatus;
  roles: AuthRole[];
  permissions: string[];
  scope: AuthScope;
}

export interface AuthContext {
  userId: string;
  sessionId: string;
  roles: AuthRole[];
  permissions: string[];
  scope: AuthScope;
}

export interface RateLimitRecord {
  key: string;
  attempts: number;
  lastAttempt: Date;
  blockedUntil?: Date;
}

export interface LoginAttempt {
  email: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  timestamp: Date;
  reason?: string;
}

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh'
}

export enum SessionRevokeReason {
  USER_LOGOUT = 'user_logout',
  REUSE_DETECTED = 'reuse_detected',
  ADMIN_FORCE = 'admin_force',
  EXPIRED = 'expired',
  OTHER = 'other'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date;
}

export interface RefreshResult {
  accessToken: string;
  accessExpiresAt: Date;
  refreshToken?: string;
  refreshExpiresAt?: Date;
}

export enum TokenVerificationStatus {
  VALID = 'valid',
  REVOKED_ROTATED = 'revoked_rotated', 
  INVALID = 'invalid'
}

export interface TokenVerificationResult {
  status: TokenVerificationStatus;
  tokenRecord?: TokenRecord;
}
