/**
 * Token generation and validation utilities
 */

import { randomBytes, createHash } from 'crypto';

export class TokenService {
  /**
   * Generate random token opaque
   */
  static generateToken(prefix?: string): string {
    const randomToken = randomBytes(32).toString('base64url');
    return prefix ? `${prefix}_${randomToken}` : randomToken;
  }

  /**
   * Generate access token dengan prefix
   */
  static generateAccessToken(): string {
    return this.generateToken('at');
  }

  /**
   * Generate refresh token dengan prefix  
   */
  static generateRefreshToken(): string {
    return this.generateToken('rt');
  }

  /**
   * Hash token untuk storage (SHA-256)
   */
  static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Extract token dari Authorization header
   */
  static extractBearerToken(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    return authHeader.slice(7); // Remove 'Bearer ' prefix
  }

  /**
   * Validate token format (basic check)
   */
  static isValidTokenFormat(token: string): boolean {
    if (!token || token.length < 10) return false;
    
    // Check if it's base64url format
    const base64urlRegex = /^[A-Za-z0-9_-]+$/;
    
    // Remove prefix if exists
    const tokenPart = token.includes('_') ? token.split('_')[1] : token;
    
    return base64urlRegex.test(tokenPart);
  }
}

export default TokenService;
