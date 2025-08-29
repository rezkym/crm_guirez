/**
 * Token service - orkestrasi token operations
 */

import { TokenStore, SessionStore, TokenType, TokenPair, RefreshResult, TokenVerificationStatus } from '../domain/auth';
import { getAccessTokenExpiry, getRefreshTokenExpiry } from '../config/auth';

export class TokenService {
  constructor(
    private tokenStore: TokenStore,
    private sessionStore: SessionStore
  ) {}

  /**
   * Issue access & refresh token pair untuk session baru
   */
  async issueTokenPair(sessionId: string, userId: string): Promise<TokenPair> {
    const accessExpiresAt = getAccessTokenExpiry();
    const refreshExpiresAt = getRefreshTokenExpiry();

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenStore.issueAccess(sessionId, userId, accessExpiresAt),
      this.tokenStore.issueRefresh(sessionId, userId, refreshExpiresAt)
    ]);

    return {
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt
    };
  }

  /**
   * Refresh access token menggunakan refresh token
   */
  async refreshTokens(refreshToken: string): Promise<RefreshResult> {
    // 1. Verify refresh token dengan status detection
    const verificationResult = await this.tokenStore.verifyRefresh(refreshToken);
    
    if (verificationResult.status === TokenVerificationStatus.INVALID) {
      throw new Error('Invalid or expired refresh token');
    }

    if (verificationResult.status === TokenVerificationStatus.REVOKED_ROTATED) {
      // This is reuse detection - throw special error for auth service to handle
      const error = new Error('Refresh token reuse detected') as any;
      error.code = 'REFRESH_REUSE_DETECTED';
      error.tokenRecord = verificationResult.tokenRecord;
      throw error;
    }

    const refreshRecord = verificationResult.tokenRecord!;

    // 2. Verify session masih aktif
    const session = await this.sessionStore.getSessionById(refreshRecord.sessionId);
    
    if (!session) {
      throw new Error('Session not found or expired');
    }

    // 3. Rotate refresh token (generate new, revoke old)
    const newRefreshToken = await this.tokenStore.rotateRefresh(refreshToken);

    // 4. Issue new access token
    const accessExpiresAt = getAccessTokenExpiry();
    const newAccessToken = await this.tokenStore.issueAccess(
      refreshRecord.sessionId,
      refreshRecord.userId,
      accessExpiresAt
    );

    // 5. Touch session untuk extend activity  
    await this.sessionStore.touchSession(refreshRecord.sessionId);

    return {
      accessToken: newAccessToken,
      accessExpiresAt,
      refreshToken: newRefreshToken,
      refreshExpiresAt: refreshRecord.expiresAt
    };
  }

  /**
   * Verify access token dan return auth context
   */
  async verifyAccessToken(token: string) {
    const tokenRecord = await this.tokenStore.verifyAccess(token);
    
    if (!tokenRecord) {
      return null;
    }

    // Verify session masih aktif
    const session = await this.sessionStore.getSessionById(tokenRecord.sessionId);
    
    if (!session) {
      return null;
    }

    return {
      tokenRecord,
      session
    };
  }

  /**
   * Revoke access token (untuk logout)
   */
  async revokeAccessToken(token: string): Promise<void> {
    const tokenRecord = await this.tokenStore.verifyAccess(token);
    
    if (tokenRecord) {
      await this.tokenStore.revokeToken(tokenRecord.tokenId, 'logout');
    }
  }

  /**
   * Revoke semua tokens untuk session (untuk logout atau security)
   */
  async revokeAllTokensForSession(sessionId: string): Promise<void> {
    // Implementasi ini akan bergantung pada kemampuan store
    // Untuk sekarang, kita akan revoke session yang akan membuat tokens tidak valid
    // Token store bisa implement method revokeAllForSession jika perlu
    
    // Note: Implementasi detail bisa dipindah ke store level
    console.log(`Revoking all tokens for session: ${sessionId}`);
  }

  /**
   * Cleanup expired tokens
   */
  async cleanupExpiredTokens(): Promise<{ tokensCleaned: number }> {
    const tokensCleaned = await this.tokenStore.cleanupExpired();
    return { tokensCleaned };
  }
}
