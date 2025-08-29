import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateRolesTable1706000004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roles',
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
            name: 'hotel_id',
            type: 'bigint',
            isNullable: true, // NULL = role global
            unsigned: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'guard_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
            default: "'api'",
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
            isNullable: false,
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

    // Foreign key ke hotels (nullable)
    await queryRunner.createForeignKey(
      'roles',
      new TableForeignKey({
        columnNames: ['hotel_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'hotels',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
      })
    );

    // Unique constraints
    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'uk_roles_slug',
        columnNames: ['slug'],
        isUnique: true,
      })
    );

    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'uk_roles_name_guard',
        columnNames: ['name', 'guard_name'],
        isUnique: true,
      })
    );

    // Index untuk hotel_id
    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'idx_roles_hotel_id',
        columnNames: ['hotel_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('roles');
  }
}
