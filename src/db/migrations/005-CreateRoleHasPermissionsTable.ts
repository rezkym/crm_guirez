import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRoleHasPermissionsTable1706000005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'role_has_permissions',
        columns: [
          {
            name: 'permission_id',
            type: 'bigint',
            isNullable: false,
            unsigned: true,
          },
          {
            name: 'role_id',
            type: 'bigint',
            isNullable: false,
            unsigned: true,
          },
        ],
      }),
      true
    );

    // Composite primary key
    await queryRunner.createPrimaryKey('role_has_permissions', ['permission_id', 'role_id']);

    // Foreign key ke permissions
    await queryRunner.createForeignKey(
      'role_has_permissions',
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'permissions',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
      })
    );

    // Foreign key ke roles
    await queryRunner.createForeignKey(
      'role_has_permissions',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('role_has_permissions');
  }
}
