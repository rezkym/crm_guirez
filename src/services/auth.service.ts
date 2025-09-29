/**
 * Auth service - orkestrasi utama untuk login/logout/refresh
 */

import { 
  UserCredentialsRepository, 
  SessionStore, 
  TokenPair, 
  RefreshResult,
  SessionRevokeReason,
  UserStatus,
  AuthContext,
  AuthRole,
  AuthScope
} from '../domain/auth';
import { PasswordService } from '../core/security';
import { RateLimitService } from '../core/security';
import { TokenService } from './token.service';
import { authConfig } from '../config/auth';
import { metrics, AuthMetrics, AuthTimers, AuthEvents } from '../core/metrics';

export interface LoginRequest {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface LoginResult {
  user: {
    id: string;
    email: string;
    status: string;
    roles: string[];
    scope: AuthScope;
  };
  roleContexts: AuthRole[];
  permissions: string[];
  tokens: TokenPair;
}

export interface MeResult {
  user: {
    id: string;
    email: string;
    status: string;
    scope: AuthScope;
  };
  roles: string[];
  roleContexts: AuthRole[];
  permissions: string[];
}

export class AuthService {
  constructor(
    private userRepo: UserCredentialsRepository,
    private sessionStore: SessionStore,
    private tokenService: TokenService,
    private passwordService: PasswordService,
    private rateLimitService: RateLimitService
  ) {}

  /**
   * Login user dengan email/password
   */
  async login(request: LoginRequest): Promise<LoginResult> {
    const startTime = Date.now();
    const { email, password, userAgent, ipAddress } = request;

    // Increment attempt counter
    metrics.incrementCounter(AuthMetrics.LOGIN_ATTEMPT_TOTAL);

    // 1. Check rate limiting
    if (ipAddress) {
      const rateLimitResult = await this.rateLimitService.checkLimit(ipAddress, email);
      
      if (!rateLimitResult.allowed) {
        metrics.incrementCounter(AuthMetrics.LOGIN_LOCKOUT_TOTAL);
        metrics.logEvent(AuthEvents.LOGIN_LOCKOUT, {
          email,
          ipAddress,
          blockedUntil: rateLimitResult.blockedUntil?.toISOString()
        });
        throw new Error(`Too many login attempts. Try again after ${rateLimitResult.blockedUntil?.toISOString()}`);
      }
    }

    try {
      // 2. Find user by email
      const user = await this.userRepo.findByEmail(email);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // 3. Check user status
      if (user.status !== UserStatus.ACTIVE) {
        throw new Error('Account is not active');
      }

      // 4. Verify password dengan bcrypt
      const isValid = await this.passwordService.verifyPassword(password, user.passwordHash);

      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      // 5. Create session
      const session = await this.sessionStore.createSession(
        user.id,
        userAgent,
        ipAddress
      );

      // 6. Issue token pair
      const tokens = await this.tokenService.issueTokenPair(session.sessionId, user.id);
      metrics.incrementCounter(AuthMetrics.TOKEN_ISSUED_TOTAL, 2); // access + refresh

      // 7. Update last login
      await this.userRepo.updateLastLogin(user.id);

      // 8. Record successful attempt
      if (ipAddress) {
        await this.rateLimitService.recordAttempt(ipAddress, email, true);
      }

      // Record success metrics
      const duration = Date.now() - startTime;
      metrics.incrementCounter(AuthMetrics.LOGIN_SUCCESS_TOTAL);
      metrics.recordTimer(AuthTimers.LOGIN_DURATION, duration);
      
      metrics.logEvent(AuthEvents.LOGIN_SUCCESS, {
        userId: user.id,
        email,
        sessionId: session.sessionId,
        duration
      });

      const roleSlugs = user.roles.map(role => role.slug);

      return {
        user: {
          id: user.id,
          email: user.email,
          status: user.status,
          roles: roleSlugs,
          scope: user.scope,
        },
        roleContexts: user.roles,
        permissions: user.permissions,
        tokens
      };

    } catch (error) {
      // Record failed attempt
      if (ipAddress) {
        await this.rateLimitService.recordAttempt(ipAddress, email, false);
      }

      const duration = Date.now() - startTime;
      metrics.logEvent(AuthEvents.LOGIN_ATTEMPT, {
        email,
        ipAddress,
        success: false,
        duration,
        reason: error instanceof Error ? error.message : 'unknown'
      });
      
      throw error;
    }
  }

  /**
   * Refresh tokens
   */
  async refresh(refreshToken: string, requestId?: string, userAgent?: string, ipAddress?: string): Promise<RefreshResult> {
    const startTime = Date.now();
    
    try {
      // Verify token and get session/user info first
      const verificationResult = await this.tokenService['tokenStore'].verifyRefresh(refreshToken);
      if (verificationResult.status !== 'valid' || !verificationResult.tokenRecord) {
        throw new Error('Invalid refresh token');
      }

      // Check user status
      const user = await this.userRepo.findById(verificationResult.tokenRecord.userId);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new Error('User account is not active');
      }

      const result = await this.tokenService.refreshTokens(refreshToken);
      
      // Update session activity dengan UA/IP tracking
      await this.sessionStore.updateSessionActivity(
        verificationResult.tokenRecord.sessionId,
        userAgent,
        ipAddress
      );
      
      // Record success metrics
      const duration = Date.now() - startTime;
      metrics.incrementCounter(AuthMetrics.TOKEN_REFRESH_TOTAL);
      metrics.incrementCounter(AuthMetrics.TOKEN_ISSUED_TOTAL, 2); // new access + refresh
      metrics.recordTimer(AuthTimers.REFRESH_DURATION, duration);
      
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      // Check for refresh token reuse detection
      if (error.code === 'REFRESH_REUSE_DETECTED' && error.tokenRecord) {
        const tokenRecord = error.tokenRecord;
        
        // Revoke session untuk security
        await this.sessionStore.revokeSession(
          tokenRecord.sessionId, 
          SessionRevokeReason.REUSE_DETECTED
        );
        
        // Mark token as reuse detected
        await this.tokenService['tokenStore'].markReuseDetected(tokenRecord.tokenId);
        
        // Log reuse detection event
        metrics.logEvent(AuthEvents.REFRESH_REUSE_DETECTED, {
          requestId,
          userId: tokenRecord.userId,
          sessionId: tokenRecord.sessionId,
          tokenId: tokenRecord.tokenId,
          duration
        });
        
        // Throw specific error for controller
        const reuseError = new Error('Refresh token reuse detected; session revoked') as any;
        reuseError.code = 'REFRESH_REUSE_DETECTED';
        throw reuseError;
      }
      
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(accessToken: string): Promise<void> {
    const verification = await this.tokenService.verifyAccessToken(accessToken);
    
    if (!verification) {
      throw new Error('Invalid access token');
    }

    const { session } = verification;

    // Strategy berdasarkan config
    if (authConfig.logoutStrategy === 'revoke_session') {
      // Revoke entire session (semua tokens)
      await this.sessionStore.revokeSession(session.sessionId, SessionRevokeReason.USER_LOGOUT);
    } else {
      // Hanya revoke access token saat ini
      await this.tokenService.revokeAccessToken(accessToken);
    }
  }

  /**
   * Get user info dari access token
   */
  async me(accessToken: string): Promise<MeResult> {
    const verification = await this.tokenService.verifyAccessToken(accessToken);
    
    if (!verification) {
      throw new Error('Invalid access token');
    }

    const { session } = verification;
    
    // Get full user data
    const user = await this.userRepo.findById(session.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('User account is not active');
    }

    const roleSlugs = user.roles.map(role => role.slug);

    return {
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
        scope: user.scope,
      },
      roles: roleSlugs,
      roleContexts: user.roles,
      permissions: user.permissions,
    };
  }

  /**
   * Create auth context untuk middleware
   */
  async createAuthContext(accessToken: string): Promise<AuthContext | null> {
    const verification = await this.tokenService.verifyAccessToken(accessToken);
    
    if (!verification) {
      return null;
    }

    const { session } = verification;
    
    const user = await this.userRepo.findById(session.userId);
    
    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    return {
      userId: user.id,
      sessionId: session.sessionId,
      roles: user.roles,
      permissions: user.permissions,
      scope: user.scope,
    };
  }

  /**
   * Cleanup expired sessions dan tokens
   */
  async cleanup(): Promise<{ sessionsRevoked: number; tokensCleaned: number }> {
    const [sessionsRevoked, tokensCleaned] = await Promise.all([
      this.sessionStore.cleanupExpired(),
      this.tokenService.cleanupExpiredTokens().then(result => result.tokensCleaned)
    ]);

    return { sessionsRevoked, tokensCleaned };
  }
}
