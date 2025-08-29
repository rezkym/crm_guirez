import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateModelHasRolesTable1706000006000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'model_has_roles',
        columns: [
          {
            name: 'role_id',
            type: 'bigint',
            isNullable: false,
            unsigned: true,
          },
          {
            name: 'hotel_id',
            type: 'bigint',
            isNullable: false,
            unsigned: true,
          },
          {
            name: 'model_id',
            type: 'bigint',
            isNullable: false,
            unsigned: true,
          },
          {
            name: 'model_type',
            type: 'varchar',
            length: '255',
            isNullable: false,
            default: "'user'",
          },
        ],
      }),
      true
    );

    // Composite primary key sesuai ERD
    await queryRunner.createPrimaryKey('model_has_roles', ['role_id', 'model_id', 'model_type']);

    // Foreign key ke roles
    await queryRunner.createForeignKey(
      'model_has_roles',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
      })
    );

    // Foreign key ke hotels
    await queryRunner.createForeignKey(
      'model_has_roles',
      new TableForeignKey({
        columnNames: ['hotel_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'hotels',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
      })
    );

    // Index untuk hotel_id sesuai ERD
    await queryRunner.createIndex(
      'model_has_roles',
      new TableIndex({
        name: 'idx_mhr_hotel_id',
        columnNames: ['hotel_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('model_has_roles');
  }
}
