import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAuthTokensTable1706000010000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'auth_tokens',
        columns: [
          {
            name: 'token_id',
            type: 'char',
            length: '36',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'session_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'bigint',
            unsigned: true,
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['access', 'refresh'],
            isNullable: false,
          },
          {
            name: 'token_hash',
            type: 'varbinary',
            length: '32', // SHA-256 digest
            isNullable: false,
          },
          {
            name: 'issued_at',
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
            name: 'rotated_from',
            type: 'char',
            length: '36',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Unique constraint untuk token_hash dan type (hindari duplikasi)
    await queryRunner.createIndex(
      'auth_tokens',
      new TableIndex({
        name: 'uk_token_hash_type',
        columnNames: ['token_hash', 'type'],
        isUnique: true,
      })
    );

    // Index untuk session_id
    await queryRunner.createIndex(
      'auth_tokens',
      new TableIndex({
        name: 'idx_tokens_session_id',
        columnNames: ['session_id'],
      })
    );

    // Index untuk user_id dan type
    await queryRunner.createIndex(
      'auth_tokens',
      new TableIndex({
        name: 'idx_tokens_user_type',
        columnNames: ['user_id', 'type'],
      })
    );

    // Index untuk expires_at
    await queryRunner.createIndex(
      'auth_tokens',
      new TableIndex({
        name: 'idx_tokens_expires_at',
        columnNames: ['expires_at'],
      })
    );

    // Foreign key ke auth_sessions
    await queryRunner.createForeignKey(
      'auth_tokens',
      new TableForeignKey({
        columnNames: ['session_id'],
        referencedTableName: 'auth_sessions',
        referencedColumnNames: ['session_id'],
        onDelete: 'CASCADE',
      })
    );

    // Foreign key ke users
    await queryRunner.createForeignKey(
      'auth_tokens',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('auth_tokens');
  }
}
