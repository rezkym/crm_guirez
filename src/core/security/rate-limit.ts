/**
 * Rate limiting & lockout service untuk keamanan auth
 */

import { RateLimitStore } from '../../domain/auth';

export interface RateLimitConfig {
  windowMinutes: number;
  maxAttempts: number;
  lockoutMinutes: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime?: Date;
  blockedUntil?: Date;
}

export class RateLimitService {
  private config: RateLimitConfig;
  private store: RateLimitStore;

  constructor(config: RateLimitConfig, store: RateLimitStore) {
    this.config = config;
    this.store = store;
  }

  /**
   * Generate key untuk rate limiting berdasarkan IP + email
   */
  private generateKey(ipAddress: string, email: string): string {
    return `ratelimit:${ipAddress}:${email}`;
  }

  /**
   * Check apakah request diperbolehkan
   */
  async checkLimit(ipAddress: string, email: string): Promise<RateLimitResult> {
    const key = this.generateKey(ipAddress, email);

    // Check apakah sedang di-block
    const isBlocked = await this.store.isBlocked(key);
    if (isBlocked) {
      const blockUntil = new Date(Date.now() + this.config.lockoutMinutes * 60 * 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        blockedUntil: blockUntil
      };
    }

    // Check attempt count
    const attemptCount = await this.store.getAttemptCount(key);
    const remainingAttempts = Math.max(0, this.config.maxAttempts - attemptCount);

    if (attemptCount >= this.config.maxAttempts) {
      // Block user
      await this.store.blockKey(key, this.config.lockoutMinutes * 60 * 1000);
      const blockUntil = new Date(Date.now() + this.config.lockoutMinutes * 60 * 1000);
      
      return {
        allowed: false,
        remainingAttempts: 0,
        blockedUntil: blockUntil
      };
    }

    const resetTime = new Date(Date.now() + this.config.windowMinutes * 60 * 1000);
    
    return {
      allowed: true,
      remainingAttempts,
      resetTime
    };
  }

  /**
   * Record login attempt (success atau failed)
   */
  async recordAttempt(ipAddress: string, email: string, success: boolean): Promise<void> {
    const key = this.generateKey(ipAddress, email);
    
    await this.store.recordAttempt(key, success);
    
    // Jika sukses, reset attempts
    if (success) {
      await this.store.resetAttempts(key);
    }
  }

  /**
   * Reset attempts untuk key tertentu (misal: manual unlock oleh admin)
   */
  async resetAttempts(ipAddress: string, email: string): Promise<void> {
    const key = this.generateKey(ipAddress, email);
    await this.store.resetAttempts(key);
  }
}

// Default configuration
export const defaultRateLimitConfig: RateLimitConfig = {
  windowMinutes: 15,
  maxAttempts: 5,
  lockoutMinutes: 15
};
