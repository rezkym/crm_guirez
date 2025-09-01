import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAuthSessionsTable1706000009000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'auth_sessions',
        columns: [
          {
            name: 'session_id',
            type: 'char',
            length: '36',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'bigint',
            unsigned: true,
            isNullable: false,
          },
          {
            name: 'ua',
            type: 'varchar',
            length: '512',
            isNullable: true,
          },
          {
            name: 'ip',
            type: 'varchar',
            length: '45', // IPv6-ready
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'revoked_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'reason',
            type: 'enum',
            enum: ['user_logout', 'reuse_detected', 'admin_force', 'other'],
            isNullable: true,
          },
          {
            name: 'last_seen_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_ua',
            type: 'varchar',
            length: '512',
            isNullable: true,
          },
          {
            name: 'last_ip',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'anomaly_count',
            type: 'int',
            unsigned: true,
            isNullable: false,
            default: 0,
          },
        ],
      }),
      true
    );

    // Index untuk user_id
    await queryRunner.createIndex(
      'auth_sessions',
      new TableIndex({
        name: 'idx_sessions_user_id',
        columnNames: ['user_id'],
      })
    );

    // Index untuk expires_at
    await queryRunner.createIndex(
      'auth_sessions',
      new TableIndex({
        name: 'idx_sessions_expires_at',
        columnNames: ['expires_at'],
      })
    );

    // Index untuk revoked_at
    await queryRunner.createIndex(
      'auth_sessions',
      new TableIndex({
        name: 'idx_sessions_revoked_at',
        columnNames: ['revoked_at'],
      })
    );

    // Foreign key ke users table
    await queryRunner.createForeignKey(
      'auth_sessions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('auth_sessions');
  }
}
