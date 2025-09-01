import { Entity, PrimaryColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { AuthSessionEntity } from './auth-session.entity';

@Entity('auth_tokens')
@Index('uk_token_hash_type', ['tokenHash', 'type'], { unique: true })
@Index('idx_tokens_session_id', ['sessionId'])
@Index('idx_tokens_user_type', ['userId', 'type'])
@Index('idx_tokens_expires_at', ['expiresAt'])
export class AuthTokenEntity {
  @PrimaryColumn({ type: 'char', length: 36, name: 'token_id' })
  tokenId!: string;

  @Column({ type: 'char', length: 36, name: 'session_id' })
  sessionId!: string;

  @Column({ type: 'bigint', unsigned: true, name: 'user_id' })
  userId!: number;

  @Column({ type: 'enum', enum: ['access', 'refresh'] })
  type!: 'access' | 'refresh';

  @Column({ type: 'varbinary', length: 32, name: 'token_hash' })
  tokenHash!: Buffer;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'issued_at' })
  issuedAt!: Date;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'revoked_at' })
  revokedAt!: Date | null;

  @Column({ type: 'char', length: 36, nullable: true, name: 'rotated_from' })
  rotatedFrom!: string | null;

  // Relasi dengan session
  @ManyToOne(() => AuthSessionEntity, session => session.tokens)
  @JoinColumn({ name: 'session_id' })
  session!: AuthSessionEntity;
}
