import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateHotelsTable1706000003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'hotels',
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
            name: 'owner_user_id',
            type: 'bigint',
            isNullable: false,
            unsigned: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '150',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'suspended', 'freeze'],
            isNullable: false,
            default: "'active'",
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

    // Foreign key ke users
    await queryRunner.createForeignKey(
      'hotels',
      new TableForeignKey({
        columnNames: ['owner_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
      })
    );

    // Index untuk owner_user_id
    await queryRunner.createIndex(
      'hotels',
      new TableIndex({
        name: 'idx_hotels_owner_user_id',
        columnNames: ['owner_user_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('hotels');
  }
}
