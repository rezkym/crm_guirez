import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsersTable1706000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            unsigned: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'email_verified_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'two_factor_secret',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'two_factor_recovery_codes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'remember_token',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'suspended', 'freeze'],
            isNullable: false,
            default: "'active'",
          },
          {
            name: 'session',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'profile_photo_path',
            type: 'varchar',
            length: '2048',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: true,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: true,
            default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Unique constraint untuk email
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'uk_users_email',
        columnNames: ['email'],
        isUnique: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
