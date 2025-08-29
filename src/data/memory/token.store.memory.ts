/**
 * In-memory implementation TokenStore
 */

import { v4 as uuidv4 } from 'uuid';
import { TokenStore, TokenRecord, TokenType, TokenVerificationResult, TokenVerificationStatus } from '../../domain/auth';
import { TokenService } from '../../core/security';

export class MemoryTokenStore implements TokenStore {
  private tokens: Map<string, TokenRecord> = new Map();
  private hashToTokenId: Map<string, string> = new Map();

  async issueAccess(sessionId: string, userId: string, expiresAt: Date): Promise<string> {
    const token = TokenService.generateAccessToken();
    const tokenHash = TokenService.hashToken(token);
    const tokenId = uuidv4();

    const tokenRecord: TokenRecord = {
      tokenId,
      sessionId,
      userId,
      type: TokenType.ACCESS,
      tokenHash,
      issuedAt: new Date(),
      expiresAt
    };

    this.tokens.set(tokenId, tokenRecord);
    this.hashToTokenId.set(tokenHash, tokenId);

    return token;
  }

  async issueRefresh(sessionId: string, userId: string, expiresAt: Date): Promise<string> {
    const token = TokenService.generateRefreshToken();
    const tokenHash = TokenService.hashToken(token);
    const tokenId = uuidv4();

    const tokenRecord: TokenRecord = {
      tokenId,
      sessionId,
      userId,
      type: TokenType.REFRESH,
      tokenHash,
      issuedAt: new Date(),
      expiresAt
    };

    this.tokens.set(tokenId, tokenRecord);
    this.hashToTokenId.set(tokenHash, tokenId);

    return token;
  }

  async verifyAccess(token: string): Promise<TokenRecord | null> {
    return this.verifyToken(token, TokenType.ACCESS);
  }

  async verifyRefresh(token: string): Promise<TokenVerificationResult> {
    const tokenHash = TokenService.hashToken(token);
    const tokenId = this.hashToTokenId.get(tokenHash);

    if (!tokenId) {
      return { status: TokenVerificationStatus.INVALID };
    }

    const tokenRecord = this.tokens.get(tokenId);

    if (!tokenRecord) {
      return { status: TokenVerificationStatus.INVALID };
    }

    // Check type
    if (tokenRecord.type !== TokenType.REFRESH) {
      return { status: TokenVerificationStatus.INVALID };
    }

    // CRITICAL: Check if revoked or rotated FIRST - THIS IS REUSE DETECTION
    // Reuse detection takes priority over expiry check
    if (tokenRecord.revokedAt || tokenRecord.rotatedFrom) {
      return { 
        status: TokenVerificationStatus.REVOKED_ROTATED, 
        tokenRecord 
      };
    }

    // Check expiry after reuse detection
    if (tokenRecord.expiresAt < new Date()) {
      return { status: TokenVerificationStatus.INVALID };
    }

    return { 
      status: TokenVerificationStatus.VALID, 
      tokenRecord 
    };
  }

  private async verifyToken(token: string, expectedType: TokenType): Promise<TokenRecord | null> {
    const tokenHash = TokenService.hashToken(token);
    const tokenId = this.hashToTokenId.get(tokenHash);

    if (!tokenId) {
      return null;
    }

    const tokenRecord = this.tokens.get(tokenId);

    if (!tokenRecord) {
      return null;
    }

    // Check type
    if (tokenRecord.type !== expectedType) {
      return null;
    }

    // Check expiry
    if (tokenRecord.expiresAt < new Date()) {
      return null;
    }

    // Check if revoked
    if (tokenRecord.revokedAt) {
      return null;
    }

    return tokenRecord;
  }

  async rotateRefresh(oldToken: string): Promise<string> {
    const verificationResult = await this.verifyRefresh(oldToken);

    if (verificationResult.status !== TokenVerificationStatus.VALID || !verificationResult.tokenRecord) {
      throw new Error('Invalid refresh token');
    }

    const oldTokenRecord = verificationResult.tokenRecord;

    // Generate new refresh token
    const newToken = TokenService.generateRefreshToken();
    const newTokenHash = TokenService.hashToken(newToken);
    const newTokenId = uuidv4();

    const newTokenRecord: TokenRecord = {
      tokenId: newTokenId,
      sessionId: oldTokenRecord.sessionId,
      userId: oldTokenRecord.userId,
      type: TokenType.REFRESH,
      tokenHash: newTokenHash,
      issuedAt: new Date(),
      expiresAt: oldTokenRecord.expiresAt, // Keep same expiry
      rotatedFrom: oldTokenRecord.tokenId
    };

    // Save new token
    this.tokens.set(newTokenId, newTokenRecord);
    this.hashToTokenId.set(newTokenHash, newTokenId);

    // Revoke old token BUT KEEP ITS HASH MAPPING for reuse detection
    await this.revokeToken(oldTokenRecord.tokenId, 'rotated');

    return newToken;
  }

  async revokeToken(tokenId: string, reason: string): Promise<void> {
    const tokenRecord = this.tokens.get(tokenId);

    if (tokenRecord) {
      tokenRecord.revokedAt = new Date();
      this.tokens.set(tokenId, tokenRecord);
      
      // NOTE: We KEEP the hash mapping so that reuse detection can still find the revoked token
      // DO NOT DELETE from hashToTokenId - this is crucial for reuse detection
    }
  }

  async markReuseDetected(tokenId: string): Promise<void> {
    const tokenRecord = this.tokens.get(tokenId);

    if (tokenRecord) {
      tokenRecord.revokedAt = new Date();
      this.tokens.set(tokenId, tokenRecord);
      
      // Log reuse detection untuk audit
      console.warn(`Token reuse detected: ${tokenId}`, {
        sessionId: tokenRecord.sessionId,
        userId: tokenRecord.userId,
        type: tokenRecord.type
      });
    }
  }

  async cleanupExpired(): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;

    for (const [tokenId, tokenRecord] of this.tokens.entries()) {
      const expired = tokenRecord.expiresAt < now;
      const isRevokedOrRotated = !!tokenRecord.revokedAt || !!tokenRecord.rotatedFrom;

      // Hanya bersihkan token yang expired & TIDAK revoked/rotated
      // Token revoked/rotated perlu dipertahankan untuk reuse detection
      if (expired && !isRevokedOrRotated) {
        this.tokens.delete(tokenId);
        this.hashToTokenId.delete(tokenRecord.tokenHash);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  // Methods tambahan untuk debugging/monitoring
  getActiveTokenCount(): number {
    const now = new Date();
    let count = 0;

    for (const tokenRecord of this.tokens.values()) {
      if (!tokenRecord.revokedAt && tokenRecord.expiresAt > now) {
        count++;
      }
    }

    return count;
  }

  getTokensBySession(sessionId: string): TokenRecord[] {
    const sessionTokens: TokenRecord[] = [];

    for (const tokenRecord of this.tokens.values()) {
      if (tokenRecord.sessionId === sessionId) {
        sessionTokens.push(tokenRecord);
      }
    }

    return sessionTokens;
  }

  getAllTokensForDebug(): TokenRecord[] {
    return Array.from(this.tokens.values());
  }
}
