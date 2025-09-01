/**
 * TypeORM implementation SessionStore
 */

import { v4 as uuidv4 } from 'uuid';
import { DataSource } from 'typeorm';
import { SessionStore } from '../../domain/auth/ports';
import { Session, SessionRevokeReason } from '../../domain/auth/types';
import { AuthSessionEntity } from '../../models/auth-session.entity';
import { getSessionExpiry } from '../../config/auth';
import { metrics, AuthEvents } from '../../core/metrics';

export class SessionStoreTypeORM implements SessionStore {
  constructor(private dataSource: DataSource) {}

  async createSession(
    userId: string, 
    userAgent?: string, 
    ipAddress?: string, 
    expiresAt?: Date
  ): Promise<Session> {
    const sessionId = uuidv4();
    const now = new Date();
    const sessionExpiry = expiresAt || getSessionExpiry();
    
    const sessionEntity = new AuthSessionEntity();
    sessionEntity.sessionId = sessionId;
    sessionEntity.userId = parseInt(userId);
    sessionEntity.ua = userAgent || null;
    sessionEntity.ip = ipAddress || null;
    sessionEntity.createdAt = now;
    sessionEntity.expiresAt = sessionExpiry;
    sessionEntity.lastSeenAt = now;
    sessionEntity.lastUa = userAgent || null;
    sessionEntity.lastIp = ipAddress || null;
    sessionEntity.anomalyCount = 0;
    sessionEntity.revokedAt = null;
    sessionEntity.reason = null;

    const sessionRepo = this.dataSource.getRepository(AuthSessionEntity);
    await sessionRepo.save(sessionEntity);

    // Log event untuk metrics
    metrics.logEvent(AuthEvents.SESSION_CREATED, { userId, sessionId });

    return this.entityToSession(sessionEntity);
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    const sessionRepo = this.dataSource.getRepository(AuthSessionEntity);
    const sessionEntity = await sessionRepo.findOne({
      where: { sessionId }
    });
    
    if (!sessionEntity) {
      return null;
    }

    // Check if expired
    if (sessionEntity.expiresAt < new Date()) {
      return null;
    }

    // Check if revoked
    if (sessionEntity.revokedAt) {
      return null;
    }

    return this.entityToSession(sessionEntity);
  }

  async revokeSession(sessionId: string, reason: SessionRevokeReason): Promise<void> {
    const sessionRepo = this.dataSource.getRepository(AuthSessionEntity);
    
    await sessionRepo.update(
      { sessionId },
      { 
        revokedAt: new Date(),
        reason: reason as any // Cast to entity enum type
      }
    );

    // Log event untuk metrics
    metrics.logEvent(AuthEvents.SESSION_REVOKED, { sessionId, reason });
  }

  async listSessionsByUser(userId: string): Promise<Session[]> {
    const sessionRepo = this.dataSource.getRepository(AuthSessionEntity);
    const sessions = await sessionRepo.find({
      where: { 
        userId: parseInt(userId),
        revokedAt: null as any // Hanya session yang belum di-revoke
      },
      order: { createdAt: 'DESC' }
    });

    const now = new Date();
    
    // Filter expired sessions
    return sessions
      .filter(session => session.expiresAt > now)
      .map(session => this.entityToSession(session));
  }

  async touchSession(sessionId: string): Promise<void> {
    const sessionRepo = this.dataSource.getRepository(AuthSessionEntity);
    
    await sessionRepo.update(
      { sessionId },
      { lastSeenAt: new Date() }
    );
  }

  async updateSessionActivity(sessionId: string, userAgent?: string, ipAddress?: string): Promise<void> {
    if (!userAgent && !ipAddress) {
      await this.touchSession(sessionId);
      return;
    }

    const sessionRepo = this.dataSource.getRepository(AuthSessionEntity);
    const session = await sessionRepo.findOne({ where: { sessionId } });
    
    if (!session) {
      return;
    }

    const updateData: Partial<AuthSessionEntity> = {
      lastSeenAt: new Date()
    };

    // Detect anomaly (UA atau IP berubah)
    let isAnomaly = false;
    
    if (userAgent && session.lastUa && userAgent !== session.lastUa) {
      isAnomaly = true;
      updateData.lastUa = userAgent;
    }
    
    if (ipAddress && session.lastIp && ipAddress !== session.lastIp) {
      isAnomaly = true;
      updateData.lastIp = ipAddress;
    }

    if (isAnomaly) {
      updateData.anomalyCount = session.anomalyCount + 1;
      
      // Log anomaly event (non-blocking)
      metrics.logEvent(AuthEvents.ANOMALY_DETECTED, { 
        sessionId, 
        oldUa: session.lastUa, 
        newUa: userAgent,
        oldIp: session.lastIp,
        newIp: ipAddress,
        anomalyCount: updateData.anomalyCount
      });
    }

    await sessionRepo.update({ sessionId }, updateData);
  }

  async cleanupExpired(): Promise<number> {
    const sessionRepo = this.dataSource.getRepository(AuthSessionEntity);
    
    const result = await sessionRepo.delete({
      expiresAt: new Date() as any // Less than now
    });

    return result.affected || 0;
  }

  /**
   * Convert entity ke domain object
   */
  private entityToSession(entity: AuthSessionEntity): Session {
    return {
      sessionId: entity.sessionId,
      userId: entity.userId.toString(),
      userAgent: entity.ua || undefined,
      ipAddress: entity.ip || undefined,
      createdAt: entity.createdAt,
      expiresAt: entity.expiresAt,
      revokedAt: entity.revokedAt || undefined,
      revokeReason: entity.reason ? (entity.reason as any) : undefined,
      lastSeenAt: entity.lastSeenAt || undefined,
      lastUa: entity.lastUa || undefined,
      lastIp: entity.lastIp || undefined,
      anomalyCount: entity.anomalyCount
    };
  }
}
