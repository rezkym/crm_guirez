import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateHotelUsersTable1706000008000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'hotel_users',
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
            isNullable: false,
            unsigned: true,
          },
          {
            name: 'user_id',
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

    // Foreign key ke hotels
    await queryRunner.createForeignKey(
      'hotel_users',
      new TableForeignKey({
        columnNames: ['hotel_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'hotels',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
      })
    );

    // Foreign key ke users
    await queryRunner.createForeignKey(
      'hotel_users',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
      })
    );

    // Index untuk hotel_id
    await queryRunner.createIndex(
      'hotel_users',
      new TableIndex({
        name: 'idx_hotel_users_hotel_id',
        columnNames: ['hotel_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('hotel_users');
  }
}
