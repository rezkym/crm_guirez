import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateModelHasPermissionsTable1706000007000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'model_has_permissions',
        columns: [
          {
            name: 'permission_id',
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
            name: 'hotel_id',
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

    // Composite primary key yang diperbaiki untuk konsistensi dan uniqueness
    await queryRunner.createPrimaryKey('model_has_permissions', ['permission_id', 'model_id', 'model_type', 'hotel_id']);

    // Foreign key ke permissions
    await queryRunner.createForeignKey(
      'model_has_permissions',
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'permissions',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
      })
    );

    // Foreign key ke hotels
    await queryRunner.createForeignKey(
      'model_has_permissions',
      new TableForeignKey({
        columnNames: ['hotel_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'hotels',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
      })
    );

    // Index untuk model_id dan model_type
    await queryRunner.createIndex(
      'model_has_permissions',
      new TableIndex({
        name: 'idx_mhp_model',
        columnNames: ['model_id', 'model_type'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('model_has_permissions');
  }
}
