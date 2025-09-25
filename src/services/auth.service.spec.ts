import { AuthService, LoginRequest, MeResult } from './auth.service';
import {
  UserCredentialsRepository,
  SessionStore,
  UserStatus,
  AuthScope,
  AuthRole,
  SessionRevokeReason,
} from '../domain/auth';
import { TokenService } from './token.service';
import { PasswordService, RateLimitService } from '../core/security';
import { authConfig } from '../config/auth';
import { metrics } from '../core/metrics';

// Mock all dependencies
jest.mock('../core/metrics');

const createUserRepoMock = (): jest.Mocked<UserCredentialsRepository> =>
  ({
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updateLastLogin: jest.fn(),
    updatePassword: jest.fn(),
  } as any);

const createSessionStoreMock = (): jest.Mocked<SessionStore> =>
  ({
    createSession: jest.fn(),
    getSessionById: jest.fn(),
    revokeSession: jest.fn(),
    listSessionsByUser: jest.fn(),
    touchSession: jest.fn(),
    updateSessionActivity: jest.fn(),
    cleanupExpired: jest.fn(),
  } as any);

const createTokenServiceMock = (): jest.Mocked<TokenService> =>
  ({
    issueTokenPair: jest.fn(),
    refreshTokens: jest.fn(),
    verifyAccessToken: jest.fn(),
    revokeAccessToken: jest.fn(),
    revokeAllTokensForSession: jest.fn(),
    cleanupExpiredTokens: jest.fn(),
    tokenStore: {
      verifyRefresh: jest.fn(),
      markReuseDetected: jest.fn(),
    },
  } as any);

const createPasswordServiceMock = (): jest.Mocked<PasswordService> =>
  ({
    hashPassword: jest.fn(),
    verifyPassword: jest.fn(),
    createPasswordHash: jest.fn(),
  } as any);

const createRateLimitServiceMock = (): jest.Mocked<RateLimitService> =>
  ({
    checkLimit: jest.fn(),
    recordAttempt: jest.fn(),
    resetAttempts: jest.fn(),
  } as any);

const createUser = (overrides: Partial<{ id: string; status: UserStatus; roles: AuthRole[] }>) =>
  ({
    id: '1',
    email: 'user@example.com',
    passwordHash: 'hashed',
    status: UserStatus.ACTIVE,
    roles: [{ slug: 'user', scope: 'external', hotelId: '100' }],
    permissions: ['read:own'],
    scope: 'external',
    ...overrides,
  } as any);

describe('AuthService', () => {
  let userRepo: jest.Mocked<UserCredentialsRepository>;
  let sessionStore: jest.Mocked<SessionStore>;
  let tokenService: jest.Mocked<TokenService>;
  let passwordService: jest.Mocked<PasswordService>;
  let rateLimit: jest.Mocked<RateLimitService>;
  let service: AuthService;
  const originalLogoutStrategy = authConfig.logoutStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepo = createUserRepoMock();
    sessionStore = createSessionStoreMock();
    tokenService = createTokenServiceMock();
    passwordService = createPasswordServiceMock();
    rateLimit = createRateLimitServiceMock();

    service = new AuthService(userRepo, sessionStore, tokenService, passwordService, rateLimit);

    // Default allow rate limit
    rateLimit.checkLimit.mockResolvedValue({ allowed: true, remainingAttempts: 5 });
  });

  afterEach(() => {
    authConfig.logoutStrategy = originalLogoutStrategy;
  });

  describe('login()', () => {
    const req: LoginRequest = {
      email: 'user@example.com',
      password: 'secret',
      ipAddress: '127.0.0.1',
      userAgent: 'jest',
    };
    const user = createUser({});
    const session = { sessionId: 'sess-1', userId: user.id };
    const tokens = { accessToken: 'access', refreshToken: 'refresh' };

    beforeEach(() => {
      userRepo.findByEmail.mockResolvedValue(user);
      passwordService.verifyPassword.mockResolvedValue(true);
      sessionStore.createSession.mockResolvedValue(session as any);
      tokenService.issueTokenPair.mockResolvedValue(tokens as any);
    });

    it('should login active user and return comprehensive result', async () => {
      const result = await service.login(req);

      expect(result.user).toEqual({ id: '1', email: 'user@example.com', status: 'active', roles: ['user'], scope: 'external' });
      expect(result.roleContexts).toEqual(user.roles);
      expect(result.permissions).toEqual(user.permissions);
      expect(result.tokens).toEqual(tokens);
    });

    it('should call dependencies with correct arguments on success', async () => {
      await service.login(req);

      expect(rateLimit.checkLimit).toHaveBeenCalledWith(req.ipAddress, req.email);
      expect(userRepo.findByEmail).toHaveBeenCalledWith(req.email);
      expect(passwordService.verifyPassword).toHaveBeenCalledWith(req.password, user.passwordHash);
      expect(sessionStore.createSession).toHaveBeenCalledWith(user.id, req.userAgent, req.ipAddress);
      expect(tokenService.issueTokenPair).toHaveBeenCalledWith(session.sessionId, user.id);
      expect(userRepo.updateLastLogin).toHaveBeenCalledWith(user.id);
      expect(rateLimit.recordAttempt).toHaveBeenCalledWith(req.ipAddress, req.email, true);
    });

    it('should record success metrics', async () => {
      await service.login(req);
      expect(metrics.incrementCounter).toHaveBeenCalledWith('auth_login_success_total');
      expect(metrics.recordTimer).toHaveBeenCalledWith('auth_login_duration_ms', expect.any(Number));
      expect(metrics.logEvent).toHaveBeenCalledWith('auth_login_success', expect.any(Object));
    });

    it.each([
      [UserStatus.SUSPENDED, 'Account is not active'],
      [UserStatus.INACTIVE, 'Account is not active'],
    ])('should throw for user with status %s', async (status, expectedError) => {
      userRepo.findByEmail.mockResolvedValue(createUser({ status }));
      await expect(service.login(req)).rejects.toThrow(expectedError);
    });

    it('should throw and record failed attempt for unknown user', async () => {
      userRepo.findByEmail.mockResolvedValue(null);
      await expect(service.login(req)).rejects.toThrow('Invalid credentials');
      expect(rateLimit.recordAttempt).toHaveBeenCalledWith(req.ipAddress, req.email, false);
      expect(metrics.logEvent).toHaveBeenCalledWith('auth_login_attempt', expect.objectContaining({ success: false, reason: 'Invalid credentials' }));
    });

    it('should throw and record failed attempt for password mismatch', async () => {
      passwordService.verifyPassword.mockResolvedValue(false);
      await expect(service.login(req)).rejects.toThrow('Invalid credentials');
      expect(rateLimit.recordAttempt).toHaveBeenCalledWith(req.ipAddress, req.email, false);
    });

    it('should throw when rate limited', async () => {
      rateLimit.checkLimit.mockResolvedValue({ allowed: false, remainingAttempts: 0, blockedUntil: new Date() });
      await expect(service.login(req)).rejects.toThrow(/Too many login attempts/);
      expect(metrics.logEvent).toHaveBeenCalledWith('auth_login_lockout', expect.any(Object));
    });

    it('should throw if session creation fails', async () => {
      sessionStore.createSession.mockRejectedValue(new Error('DB error'));
      await expect(service.login(req)).rejects.toThrow('DB error');
    });

    it('should throw if token generation fails', async () => {
      tokenService.issueTokenPair.mockRejectedValue(new Error('Token signing failed'));
      await expect(service.login(req)).rejects.toThrow('Token signing failed');
    });
  });

  describe('refresh()', () => {
    beforeEach(() => {
      tokenService.refreshTokens.mockResolvedValue({ accessToken: 'new-access', refreshToken: 'new-refresh' } as any);
      (tokenService as any).tokenStore.verifyRefresh.mockResolvedValue({ status: 'valid', tokenRecord: { sessionId: 'sess-1', userId: '1' } });
      userRepo.findById.mockResolvedValue(createUser({}));
    });

    it('should return new token pair and update session activity', async () => {
      const result = await service.refresh('refresh-token', 'req-1', 'UA', '127.0.0.1');
      expect(result.accessToken).toBe('new-access');
      expect(sessionStore.updateSessionActivity).toHaveBeenCalledWith('sess-1', 'UA', '127.0.0.1');
      expect(metrics.incrementCounter).toHaveBeenCalledWith('auth_token_refresh_total');
    });

    it('should reject if user is no longer active', async () => {
      userRepo.findById.mockResolvedValue(createUser({ status: UserStatus.INACTIVE }));
      await expect(service.refresh('refresh-token')).rejects.toThrow('User account is not active');
    });

    it('should reject if session is not found', async () => {
      (tokenService as any).tokenStore.verifyRefresh.mockResolvedValue({ status: 'invalid' });
      await expect(service.refresh('refresh-token')).rejects.toThrow('Invalid refresh token');
    });

    it('should handle and log token reuse detection', async () => {
      const reuseError: any = new Error('Reuse detected');
      reuseError.code = 'REFRESH_REUSE_DETECTED';
      reuseError.tokenRecord = { sessionId: 'sess-1', userId: '1', tokenId: 'token-123' };
      tokenService.refreshTokens.mockRejectedValue(reuseError);

      await expect(service.refresh('used-token')).rejects.toThrow(/Refresh token reuse detected/);
      expect(sessionStore.revokeSession).toHaveBeenCalledWith('sess-1', SessionRevokeReason.REUSE_DETECTED);
      expect((tokenService as any).tokenStore.markReuseDetected).toHaveBeenCalledWith('token-123');
      expect(metrics.logEvent).toHaveBeenCalledWith('auth_refresh_reuse_detected', expect.any(Object));
    });
  });

  describe('logout()', () => {
    beforeEach(() => {
      tokenService.verifyAccessToken.mockResolvedValue({ session: { sessionId: 'sess-1' } } as any);
    });

    it('should revoke session for strategy "revoke_session"', async () => {
      authConfig.logoutStrategy = 'revoke_session';
      await service.logout('access-token');
      expect(sessionStore.revokeSession).toHaveBeenCalledWith('sess-1', SessionRevokeReason.USER_LOGOUT);
    });

    it('should revoke only token for strategy "access_only"', async () => {
      authConfig.logoutStrategy = 'access_only';
      await service.logout('access-token');
      expect(tokenService.revokeAccessToken).toHaveBeenCalledWith('access-token');
    });

    it('should throw for invalid token', async () => {
      tokenService.verifyAccessToken.mockResolvedValue(null);
      await expect(service.logout('invalid')).rejects.toThrow('Invalid access token');
    });

    it('should handle logout for an already invalid token gracefully', async () => {
      tokenService.verifyAccessToken.mockResolvedValue(null);
      await expect(service.logout('expired-token')).rejects.toThrow('Invalid access token');
    });
  });

  describe('me()', () => {
    beforeEach(() => {
      tokenService.verifyAccessToken.mockResolvedValue({ session: { userId: '1' } } as any);
    });

    it('should return full user profile for valid token', async () => {
      userRepo.findById.mockResolvedValue(createUser({}));
      const result = await service.me('token');
      expect(result.user.id).toBe('1');
      expect(result.roles).toEqual(['user']);
    });

    it('should throw if user not found in repository', async () => {
      userRepo.findById.mockResolvedValue(null);
      await expect(service.me('token')).rejects.toThrow('User not found');
    });

    it('should throw if user is no longer active', async () => {
      userRepo.findById.mockResolvedValue(createUser({ status: UserStatus.SUSPENDED }));
      await expect(service.me('token')).rejects.toThrow('User account is not active');
    });
  });

  describe('createAuthContext()', () => {
    beforeEach(() => {
      tokenService.verifyAccessToken.mockResolvedValue({ session: { userId: '1', sessionId: 'sess-1' } } as any);
    });

    it('should return full auth context for valid token', async () => {
      userRepo.findById.mockResolvedValue(createUser({}));
      const context = await service.createAuthContext('token');
      expect(context?.userId).toBe('1');
      expect(context?.scope).toBe('external');
    });

    it('should return null if user not found', async () => {
      userRepo.findById.mockResolvedValue(null);
      const context = await service.createAuthContext('token');
      expect(context).toBeNull();
    });

    it('should return null if user is not active', async () => {
      userRepo.findById.mockResolvedValue(createUser({ status: UserStatus.INACTIVE }));
      const context = await service.createAuthContext('token');
      expect(context).toBeNull();
    });

    it('should return null for invalid token', async () => {
      tokenService.verifyAccessToken.mockResolvedValue(null);
      const context = await service.createAuthContext('bad-token');
      expect(context).toBeNull();
    });
  });

  describe('cleanup()', () => {
    it('should call cleanup on stores and return counts', async () => {
      sessionStore.cleanupExpired.mockResolvedValue(5);
      tokenService.cleanupExpiredTokens.mockResolvedValue({ tokensCleaned: 10 } as any);

      const result = await service.cleanup();

      expect(sessionStore.cleanupExpired).toHaveBeenCalled();
      expect(tokenService.cleanupExpiredTokens).toHaveBeenCalled();
      expect(result).toEqual({ sessionsRevoked: 5, tokensCleaned: 10 });
    });

    it('should propagate errors from cleanup tasks', async () => {
      sessionStore.cleanupExpired.mockRejectedValue(new Error('Cleanup failed'));
      tokenService.cleanupExpiredTokens.mockResolvedValue({ tokensCleaned: 0 } as any);

      await expect(service.cleanup()).rejects.toThrow('Cleanup failed');
    });
  });
});