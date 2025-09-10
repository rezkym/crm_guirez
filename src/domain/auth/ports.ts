/**
 * Auth domain ports - interfaces kontrak untuk adapters
 */

import { Session, TokenRecord, UserCredentials, TokenType, SessionRevokeReason, RateLimitRecord, LoginAttempt, TokenVerificationResult } from './types';

export interface SessionStore {
  /**
   * Buat session baru untuk user
   */
  createSession(userId: string, userAgent?: string, ipAddress?: string, expiresAt?: Date): Promise<Session>;

  /**
   * Ambil session berdasarkan ID
   */
  getSessionById(sessionId: string): Promise<Session | null>;

  /**
   * Revoke/batalkan session
   */
  revokeSession(sessionId: string, reason: SessionRevokeReason): Promise<void>;

  /**
   * Ambil semua session aktif untuk user
   */
  listSessionsByUser(userId: string): Promise<Session[]>;

  /**
   * Update last access time untuk session
   */
  touchSession(sessionId: string): Promise<void>;

  /**
   * Update session dengan UA/IP tracking dan anomaly detection
   */
  updateSessionActivity(sessionId: string, userAgent?: string, ipAddress?: string): Promise<void>;

  /**
   * Cleanup expired sessions
   */
  cleanupExpired(): Promise<number>;
}

export interface TokenStore {
  /**
   * Issue access token baru
   */
  issueAccess(sessionId: string, userId: string, expiresAt: Date): Promise<string>;

  /**
   * Issue refresh token baru
   */
  issueRefresh(sessionId: string, userId: string, expiresAt: Date): Promise<string>;

  /**
   * Verify access token
   */
  verifyAccess(token: string): Promise<TokenRecord | null>;

  /**
   * Verify refresh token dengan status detection
   */
  verifyRefresh(token: string): Promise<TokenVerificationResult>;

  /**
   * Rotasi refresh token - buat baru dan revoke yang lama
   */
  rotateRefresh(oldToken: string): Promise<string>;

  /**
   * Revoke token
   */
  revokeToken(tokenId: string, reason: string): Promise<void>;

  /**
   * Mark token sebagai reuse detected
   */
  markReuseDetected(tokenId: string): Promise<void>;

  /**
   * Cleanup expired tokens
   */
  cleanupExpired(): Promise<number>;
}

export interface UserCredentialsRepository {
  /**
   * Cari user berdasarkan email
   */
  findByEmail(email: string): Promise<UserCredentials | null>;

  /**
   * Cari user berdasarkan ID
   */
  findById(userId: string): Promise<UserCredentials | null>;

  /**
   * Update last login time
   */
  updateLastLogin(userId: string): Promise<void>;

  /**
   * Update password hash (untuk password migration)
   */
  updatePassword(userId: string, passwordHash: string, passwordSalt: string): Promise<void>;
}

export interface RateLimitStore {
  /**
   * Record login attempt
   */
  recordAttempt(key: string, success: boolean): Promise<void>;

  /**
   * Check apakah key sudah di-block
   */
  isBlocked(key: string): Promise<boolean>;

  /**
   * Get attempt count dalam window
   */
  getAttemptCount(key: string): Promise<number>;

  /**
   * Block key untuk durasi tertentu
   */
  blockKey(key: string, duration: number): Promise<void>;

  /**
   * Reset attempts untuk key
   */
  resetAttempts(key: string): Promise<void>;

  /**
   * Cleanup expired records
   */
  cleanupExpired(): Promise<number>;
}

export interface AuditLogger {
  /**
   * Log login attempt
   */
  logLoginAttempt(attempt: LoginAttempt): Promise<void>;

  /**
   * Log security event
   */
  logSecurityEvent(event: string, data: any, requestId?: string): Promise<void>;
}
