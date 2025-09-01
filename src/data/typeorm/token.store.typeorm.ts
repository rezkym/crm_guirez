/**
 * TypeORM implementation TokenStore
 */

import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { DataSource, QueryRunner } from 'typeorm';
import { TokenStore } from '../../domain/auth/ports';
import { TokenRecord, TokenType, TokenVerificationResult, TokenVerificationStatus } from '../../domain/auth/types';
import { AuthTokenEntity } from '../../models/auth-token.entity';
import { TokenService } from '../../core/security';

export class TokenStoreTypeORM implements TokenStore {
  constructor(private dataSource: DataSource) {}

  async issueAccess(sessionId: string, userId: string, expiresAt: Date): Promise<string> {
    const token = TokenService.generateAccessToken();
    const tokenHash = this.hashTokenToBuffer(token);
    const tokenId = uuidv4();

    const tokenEntity = new AuthTokenEntity();
    tokenEntity.tokenId = tokenId;
    tokenEntity.sessionId = sessionId;
    tokenEntity.userId = parseInt(userId);
    tokenEntity.type = 'access';
    tokenEntity.tokenHash = tokenHash;
    tokenEntity.issuedAt = new Date();
    tokenEntity.expiresAt = expiresAt;
    tokenEntity.revokedAt = null;
    tokenEntity.rotatedFrom = null;

    const tokenRepo = this.dataSource.getRepository(AuthTokenEntity);
    await tokenRepo.save(tokenEntity);

    return token;
  }

  async issueRefresh(sessionId: string, userId: string, expiresAt: Date): Promise<string> {
    const token = TokenService.generateRefreshToken();
    const tokenHash = this.hashTokenToBuffer(token);
    const tokenId = uuidv4();

    const tokenEntity = new AuthTokenEntity();
    tokenEntity.tokenId = tokenId;
    tokenEntity.sessionId = sessionId;
    tokenEntity.userId = parseInt(userId);
    tokenEntity.type = 'refresh';
    tokenEntity.tokenHash = tokenHash;
    tokenEntity.issuedAt = new Date();
    tokenEntity.expiresAt = expiresAt;
    tokenEntity.revokedAt = null;
    tokenEntity.rotatedFrom = null;

    const tokenRepo = this.dataSource.getRepository(AuthTokenEntity);
    await tokenRepo.save(tokenEntity);

    return token;
  }

  async verifyAccess(token: string): Promise<TokenRecord | null> {
    const tokenHash = this.hashTokenToBuffer(token);
    const tokenRepo = this.dataSource.getRepository(AuthTokenEntity);
    
    const tokenEntity = await tokenRepo.findOne({
      where: { 
        tokenHash,
        type: 'access'
      }
    });

    if (!tokenEntity) {
      return null;
    }

    // Check if expired
    if (tokenEntity.expiresAt < new Date()) {
      return null;
    }

    // Check if revoked
    if (tokenEntity.revokedAt) {
      return null;
    }

    return this.entityToTokenRecord(tokenEntity);
  }

  async verifyRefresh(token: string): Promise<TokenVerificationResult> {
    const tokenHash = this.hashTokenToBuffer(token);
    const tokenRepo = this.dataSource.getRepository(AuthTokenEntity);
    
    const tokenEntity = await tokenRepo.findOne({
      where: { 
        tokenHash,
        type: 'refresh'
      }
    });

    // Token tidak ditemukan
    if (!tokenEntity) {
      return { status: TokenVerificationStatus.INVALID };
    }

    // Token sudah di-revoke atau di-rotate (reuse detection)
    if (tokenEntity.revokedAt || tokenEntity.rotatedFrom) {
      return { 
        status: TokenVerificationStatus.REVOKED_ROTATED,
        tokenRecord: this.entityToTokenRecord(tokenEntity)
      };
    }

    // Token expired
    if (tokenEntity.expiresAt < new Date()) {
      return { status: TokenVerificationStatus.INVALID };
    }

    // Token valid
    return { 
      status: TokenVerificationStatus.VALID,
      tokenRecord: this.entityToTokenRecord(tokenEntity)
    };
  }

  async rotateRefresh(oldToken: string): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verify old token (harus VALID)
      const verificationResult = await this.verifyRefreshWithRunner(oldToken, queryRunner);
      
      if (verificationResult.status !== TokenVerificationStatus.VALID) {
        throw new Error('Invalid refresh token for rotation');
      }

      const oldTokenRecord = verificationResult.tokenRecord!;

      // 2. Generate new refresh token
      const newToken = TokenService.generateRefreshToken();
      const newTokenHash = this.hashTokenToBuffer(newToken);
      const newTokenId = uuidv4();

      // 3. Insert new token dengan rotated_from reference
      const newTokenEntity = new AuthTokenEntity();
      newTokenEntity.tokenId = newTokenId;
      newTokenEntity.sessionId = oldTokenRecord.sessionId;
      newTokenEntity.userId = parseInt(oldTokenRecord.userId);
      newTokenEntity.type = 'refresh';
      newTokenEntity.tokenHash = newTokenHash;
      newTokenEntity.issuedAt = new Date();
      newTokenEntity.expiresAt = oldTokenRecord.expiresAt; // Inherit expiry dari token lama
      newTokenEntity.revokedAt = null;
      newTokenEntity.rotatedFrom = oldTokenRecord.tokenId;

      await queryRunner.manager.save(AuthTokenEntity, newTokenEntity);

      // 4. Revoke old token
      await queryRunner.manager.update(AuthTokenEntity, 
        { tokenId: oldTokenRecord.tokenId },
        { revokedAt: new Date() }
      );

      await queryRunner.commitTransaction();
      return newToken;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async revokeToken(tokenId: string, reason: string): Promise<void> {
    const tokenRepo = this.dataSource.getRepository(AuthTokenEntity);
    
    await tokenRepo.update(
      { tokenId },
      { revokedAt: new Date() }
    );
  }

  async markReuseDetected(tokenId: string): Promise<void> {
    // Untuk sekarang, cukup revoke token
    // Bisa ditambahkan kolom/flag tambahan jika diperlukan audit yang lebih detail
    await this.revokeToken(tokenId, 'reuse_detected');
  }

  async cleanupExpired(): Promise<number> {
    const tokenRepo = this.dataSource.getRepository(AuthTokenEntity);
    
    // Hanya hapus token yang expired DAN tidak pernah di-revoke/rotate
    // Ini penting untuk mempertahankan jejak audit untuk reuse detection
    const result = await tokenRepo
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .andWhere('revoked_at IS NULL')
      .andWhere('rotated_from IS NULL')
      .execute();

    return result.affected || 0;
  }

  /**
   * Verify refresh token dengan query runner untuk transaksi
   */
  private async verifyRefreshWithRunner(token: string, queryRunner: QueryRunner): Promise<TokenVerificationResult> {
    const tokenHash = this.hashTokenToBuffer(token);
    
    const tokenEntity = await queryRunner.manager.findOne(AuthTokenEntity, {
      where: { 
        tokenHash,
        type: 'refresh'
      }
    });

    if (!tokenEntity) {
      return { status: TokenVerificationStatus.INVALID };
    }

    if (tokenEntity.revokedAt || tokenEntity.rotatedFrom) {
      return { 
        status: TokenVerificationStatus.REVOKED_ROTATED,
        tokenRecord: this.entityToTokenRecord(tokenEntity)
      };
    }

    if (tokenEntity.expiresAt < new Date()) {
      return { status: TokenVerificationStatus.INVALID };
    }

    return { 
      status: TokenVerificationStatus.VALID,
      tokenRecord: this.entityToTokenRecord(tokenEntity)
    };
  }

  /**
   * Hash token dan convert ke Buffer untuk MySQL VARBINARY
   */
  private hashTokenToBuffer(token: string): Buffer {
    const hash = createHash('sha256').update(token).digest();
    return hash;
  }

  /**
   * Convert entity ke domain object
   */
  private entityToTokenRecord(entity: AuthTokenEntity): TokenRecord {
    return {
      tokenId: entity.tokenId,
      sessionId: entity.sessionId,
      userId: entity.userId.toString(),
      type: entity.type as TokenType,
      tokenHash: entity.tokenHash.toString('hex'), // Convert Buffer back to hex string
      issuedAt: entity.issuedAt,
      expiresAt: entity.expiresAt,
      revokedAt: entity.revokedAt || undefined,
      rotatedFrom: entity.rotatedFrom || undefined
    };
  }
}
