/**
 * In-memory implementation SessionStore
 */

import { v4 as uuidv4 } from 'uuid';
import { SessionStore, Session, SessionRevokeReason } from '../../domain/auth';
import { getSessionExpiry } from '../../config/auth';
import { metrics, AuthEvents } from '../../core/metrics';

export class MemorySessionStore implements SessionStore {
  private sessions: Map<string, Session> = new Map();

  async createSession(
    userId: string, 
    userAgent?: string, 
    ipAddress?: string, 
    expiresAt?: Date
  ): Promise<Session> {
    const sessionId = uuidv4();
    const now = new Date();
    
    const session: Session = {
      sessionId,
      userId,
      userAgent,
      ipAddress,
      createdAt: now,
      expiresAt: expiresAt || getSessionExpiry(),
      lastSeenAt: now,
      lastUa: userAgent,
      lastIp: ipAddress,
      anomalyCount: 0
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Check if expired
    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Check if revoked
    if (session.revokedAt) {
      return null;
    }

    return session;
  }

  async revokeSession(sessionId: string, reason: SessionRevokeReason): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      session.revokedAt = new Date();
      session.revokeReason = reason;
      this.sessions.set(sessionId, session);
    }
  }

  async listSessionsByUser(userId: string): Promise<Session[]> {
    const userSessions: Session[] = [];
    const now = new Date();

    for (const session of this.sessions.values()) {
      if (session.userId === userId && 
          !session.revokedAt && 
          session.expiresAt > now) {
        userSessions.push(session);
      }
    }

    return userSessions;
  }

  async touchSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (session && !session.revokedAt) {
      session.lastSeenAt = new Date();
      this.sessions.set(sessionId, session);
    }
  }

  async updateSessionActivity(sessionId: string, userAgent?: string, ipAddress?: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    
    if (!session || session.revokedAt) {
      return;
    }

    const now = new Date();
    let anomalyDetected = false;

    // Check UA anomaly
    if (userAgent && session.lastUa && userAgent !== session.lastUa) {
      // Consider minor version changes as normal (simplified check)
      const isMinorChange = this.isMinorUaChange(session.lastUa, userAgent);
      if (!isMinorChange) {
        anomalyDetected = true;
      }
    }

    // Check IP anomaly  
    if (ipAddress && session.lastIp && ipAddress !== session.lastIp) {
      anomalyDetected = true;
    }

    if (anomalyDetected) {
      session.anomalyCount = (session.anomalyCount || 0) + 1;
      
      // Log anomaly (non-blocking)
      metrics.logEvent(AuthEvents.SESSION_ANOMALY, {
        sessionId,
        userId: session.userId,
        previousUa: session.lastUa,
        currentUa: userAgent,
        previousIp: session.lastIp,
        currentIp: ipAddress,
        anomalyCount: session.anomalyCount
      });
    }

    // Update session activity
    session.lastSeenAt = now;
    if (userAgent) session.lastUa = userAgent;
    if (ipAddress) session.lastIp = ipAddress;
    
    this.sessions.set(sessionId, session);
  }

  /**
   * Simple check untuk perubahan UA yang minor (patch version, dsb)
   */
  private isMinorUaChange(oldUa: string, newUa: string): boolean {
    // Simplified: jika base browser name sama, consider sebagai minor change
    const extractBrowser = (ua: string) => {
      if (ua.includes('Chrome/')) return 'Chrome';
      if (ua.includes('Firefox/')) return 'Firefox';
      if (ua.includes('Safari/')) return 'Safari';
      if (ua.includes('Edge/')) return 'Edge';
      return 'Other';
    };

    return extractBrowser(oldUa) === extractBrowser(newUa);
  }

  async cleanupExpired(): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  // Method tambahan untuk debugging/monitoring
  getActiveSessionCount(): number {
    const now = new Date();
    let count = 0;

    for (const session of this.sessions.values()) {
      if (!session.revokedAt && session.expiresAt > now) {
        count++;
      }
    }

    return count;
  }

  getAllSessionsForDebug(): Session[] {
    return Array.from(this.sessions.values());
  }
}
