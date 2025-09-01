import { Entity, PrimaryColumn, Column, Index, OneToMany } from "typeorm";
import { AuthTokenEntity } from "./auth-token.entity";

@Entity("auth_sessions")
@Index("idx_sessions_user_id", ["userId"])
@Index("idx_sessions_expires_at", ["expiresAt"])
@Index("idx_sessions_revoked_at", ["revokedAt"])
export class AuthSessionEntity {
    @PrimaryColumn({ type: "char", length: 36, name: "session_id" })
    sessionId!: string;

    @Column({ type: "bigint", unsigned: true, name: "user_id" })
    userId!: number;

    @Column({ type: "varchar", length: 512, nullable: true })
    ua!: string | null;

    @Column({ type: "varchar", length: 45, nullable: true })
    ip!: string | null;

    @Column({
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        name: "created_at",
    })
    createdAt!: Date;

    @Column({ type: "timestamp", name: "expires_at" })
    expiresAt!: Date;

    @Column({ type: "timestamp", nullable: true, name: "revoked_at" })
    revokedAt!: Date | null;

    @Column({
        type: "enum",
        enum: ["user_logout", "reuse_detected", "admin_force", "other"],
        nullable: true,
    })
    reason!: "user_logout" | "reuse_detected" | "admin_force" | "other" | null;

    @Column({ type: "timestamp", nullable: true, name: "last_seen_at" })
    lastSeenAt!: Date | null;

    @Column({ type: "varchar", length: 512, nullable: true, name: "last_ua" })
    lastUa!: string | null;

    @Column({ type: "varchar", length: 45, nullable: true, name: "last_ip" })
    lastIp!: string | null;

    @Column({ type: "int", unsigned: true, default: 0, name: "anomaly_count" })
    anomalyCount!: number;

    // Relasi dengan tokens
    @OneToMany(() => AuthTokenEntity, (token) => token.session)
    tokens!: AuthTokenEntity[];
}
