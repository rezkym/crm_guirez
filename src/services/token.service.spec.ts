
import { TokenService } from './token.service';
import { TokenStore, SessionStore, TokenType, TokenPair, RefreshResult, TokenVerificationStatus, TokenRecord, Session } from '../domain/auth';
import * as authConfig from '../config/auth';

// Mock the config module
jest.mock('../config/auth', () => ({
  getAccessTokenExpiry: jest.fn(),
  getRefreshTokenExpiry: jest.fn(),
}));

const createTokenStoreMock = (): jest.Mocked<TokenStore> => ({
  issueAccess: jest.fn(),
  issueRefresh: jest.fn(),
  verifyAccess: jest.fn(),
  verifyRefresh: jest.fn(),
  rotateRefresh: jest.fn(),
  revokeToken: jest.fn(),
  markReuseDetected: jest.fn(),
  cleanupExpired: jest.fn(),
});

const createSessionStoreMock = (): jest.Mocked<SessionStore> => ({
  createSession: jest.fn(),
  getSessionById: jest.fn(),
  revokeSession: jest.fn(),
  listSessionsByUser: jest.fn(),
  touchSession: jest.fn(),
  updateSessionActivity: jest.fn(),
  cleanupExpired: jest.fn(),
});

describe('TokenService', () => {
  let tokenStore: jest.Mocked<TokenStore>;
  let sessionStore: jest.Mocked<SessionStore>;
  let service: TokenService;

  const mockedAuthConfig = authConfig as jest.Mocked<typeof authConfig>;

  beforeEach(() => {
    jest.clearAllMocks();
    tokenStore = createTokenStoreMock();
    sessionStore = createSessionStoreMock();
    service = new TokenService(tokenStore, sessionStore);

    // Setup default mock values for config
    mockedAuthConfig.getAccessTokenExpiry.mockReturnValue(new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes
    mockedAuthConfig.getRefreshTokenExpiry.mockReturnValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days
  });

  describe('issueTokenPair()', () => {
    it('should issue a new access and refresh token pair', async () => {
      const sessionId = 'session-123';
      const userId = 'user-456';
      const accessExpires = new Date(Date.now() + 10000);
      const refreshExpires = new Date(Date.now() + 20000);

      mockedAuthConfig.getAccessTokenExpiry.mockReturnValue(accessExpires);
      mockedAuthConfig.getRefreshTokenExpiry.mockReturnValue(refreshExpires);

      tokenStore.issueAccess.mockResolvedValue('new-access-token');
      tokenStore.issueRefresh.mockResolvedValue('new-refresh-token');

      const result = await service.issueTokenPair(sessionId, userId);

      expect(tokenStore.issueAccess).toHaveBeenCalledWith(sessionId, userId, accessExpires);
      expect(tokenStore.issueRefresh).toHaveBeenCalledWith(sessionId, userId, refreshExpires);
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        accessExpiresAt: accessExpires,
        refreshExpiresAt: refreshExpires,
      });
    });
  });

  describe('refreshTokens()', () => {
    const refreshToken = 'valid-refresh-token';
    const tokenRecord: TokenRecord = { tokenId: 'abc', sessionId: 'session-123', userId: 'user-456', type: TokenType.REFRESH, tokenHash: 'hash', issuedAt: new Date(), expiresAt: new Date(Date.now() + 10000) };
    const session: Session = { sessionId: 'session-123', userId: 'user-456', userAgent: '', ipAddress: '', createdAt: new Date(), expiresAt: new Date(Date.now() + 10000) };

    it('should successfully refresh tokens with a valid refresh token and active session', async () => {
      tokenStore.verifyRefresh.mockResolvedValue({ status: TokenVerificationStatus.VALID, tokenRecord });
      sessionStore.getSessionById.mockResolvedValue(session);
      tokenStore.rotateRefresh.mockResolvedValue('new-rotated-refresh-token');
      tokenStore.issueAccess.mockResolvedValue('new-access-token');

      const result = await service.refreshTokens(refreshToken);

      expect(tokenStore.verifyRefresh).toHaveBeenCalledWith(refreshToken);
      expect(sessionStore.getSessionById).toHaveBeenCalledWith(tokenRecord.sessionId);
      expect(tokenStore.rotateRefresh).toHaveBeenCalledWith(refreshToken);
      expect(tokenStore.issueAccess).toHaveBeenCalled();
      expect(sessionStore.touchSession).toHaveBeenCalledWith(tokenRecord.sessionId);
      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-rotated-refresh-token');
    });

    it('should throw an error for an invalid refresh token', async () => {
      tokenStore.verifyRefresh.mockResolvedValue({ status: TokenVerificationStatus.INVALID });
      await expect(service.refreshTokens('invalid-token')).rejects.toThrow('Invalid or expired refresh token');
    });

    it('should throw a special error for a reused refresh token', async () => {
      tokenStore.verifyRefresh.mockResolvedValue({ status: TokenVerificationStatus.REVOKED_ROTATED, tokenRecord });
      
      try {
        await service.refreshTokens('reused-token');
        fail('should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Refresh token reuse detected');
        expect(error.code).toBe('REFRESH_REUSE_DETECTED');
        expect(error.tokenRecord).toBe(tokenRecord);
      }
    });

    it('should throw an error if the session is not found', async () => {
      tokenStore.verifyRefresh.mockResolvedValue({ status: TokenVerificationStatus.VALID, tokenRecord });
      sessionStore.getSessionById.mockResolvedValue(null);

      await expect(service.refreshTokens(refreshToken)).rejects.toThrow('Session not found or expired');
    });
  });

  describe('verifyAccessToken()', () => {
    const accessToken = 'valid-access-token';
    const tokenRecord: TokenRecord = { tokenId: 'def', sessionId: 'session-123', userId: 'user-456', type: TokenType.ACCESS, tokenHash: 'hash', issuedAt: new Date(), expiresAt: new Date(Date.now() + 10000) };
    const session: Session = { sessionId: 'session-123', userId: 'user-456', userAgent: '', ipAddress: '', createdAt: new Date(), expiresAt: new Date(Date.now() + 10000) };

    it('should return token and session records for a valid token and active session', async () => {
      tokenStore.verifyAccess.mockResolvedValue(tokenRecord);
      sessionStore.getSessionById.mockResolvedValue(session);

      const result = await service.verifyAccessToken(accessToken);

      expect(result).toEqual({ tokenRecord, session });
    });

    it('should return null if token is invalid', async () => {
      tokenStore.verifyAccess.mockResolvedValue(null);
      const result = await service.verifyAccessToken('invalid-token');
      expect(result).toBeNull();
      expect(sessionStore.getSessionById).not.toHaveBeenCalled();
    });

    it('should return null if session is not found', async () => {
      tokenStore.verifyAccess.mockResolvedValue(tokenRecord);
      sessionStore.getSessionById.mockResolvedValue(null);

      const result = await service.verifyAccessToken(accessToken);

      expect(result).toBeNull();
    });
  });

  describe('revokeAccessToken()', () => {
    it('should revoke a token if it is valid', async () => {
      const tokenRecord: TokenRecord = { tokenId: 'xyz', sessionId: 's', userId: 'u', type: TokenType.ACCESS, tokenHash: 'hash', issuedAt: new Date(), expiresAt: new Date() };
      tokenStore.verifyAccess.mockResolvedValue(tokenRecord);

      await service.revokeAccessToken('some-token');

      expect(tokenStore.revokeToken).toHaveBeenCalledWith(tokenRecord.tokenId, 'logout');
    });

    it('should not do anything if token is invalid', async () => {
      tokenStore.verifyAccess.mockResolvedValue(null);
      await service.revokeAccessToken('invalid-token');
      expect(tokenStore.revokeToken).not.toHaveBeenCalled();
    });
  });

  describe('cleanupExpiredTokens()', () => {
    it('should call the store and return the number of cleaned tokens', async () => {
      tokenStore.cleanupExpired.mockResolvedValue(123);
      const result = await service.cleanupExpiredTokens();
      expect(tokenStore.cleanupExpired).toHaveBeenCalled();
      expect(result.tokensCleaned).toBe(123);
    });
  });
});
