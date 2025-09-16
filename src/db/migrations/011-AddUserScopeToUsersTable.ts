import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserScopeToUsersTable1706000011000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tambah kolom user_scope
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'user_scope',
        type: 'enum',
        enum: ['internal', 'external'],
        isNullable: false,
        default: "'external'",
      })
    );

    // Posisikan kolom setelah 'status' (tidak di akhir setelah deleted_at)
    // TypeORM belum mendukung 'AFTER' langsung, jadi gunakan raw SQL MySQL
    await queryRunner.query(
      "ALTER TABLE `users` MODIFY COLUMN `user_scope` ENUM('internal','external') NOT NULL DEFAULT 'external' AFTER `status`"
    );

    // Optional: mark seeded superadmin as internal if exists already
    await queryRunner.query(
      "UPDATE users SET user_scope = 'internal' WHERE email = 'admin@example.com' AND deleted_at IS NULL"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the column; need to drop enum type in MySQL by altering column back
    await queryRunner.dropColumn('users', 'user_scope');
  }
}
