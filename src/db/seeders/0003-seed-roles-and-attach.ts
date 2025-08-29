import AppDataSource from '../../data/typeorm-data-source';

export async function seedRolesAndAttach() {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    // Clear existing role data
    await queryRunner.query('DELETE FROM role_has_permissions');
    await queryRunner.query('DELETE FROM roles');
    
    // Insert roles
    const roles = [
      { name: 'Super Administrator', guard_name: 'api', slug: 'superadmin', hotel_id: null },
      { name: 'Manager', guard_name: 'api', slug: 'manager', hotel_id: null },
      { name: 'User', guard_name: 'api', slug: 'user', hotel_id: null },
    ];

    for (const role of roles) {
      await queryRunner.query(
        'INSERT INTO roles (name, guard_name, slug, hotel_id, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [role.name, role.guard_name, role.slug, role.hotel_id]
      );
    }

    // Get IDs untuk attach permissions
    const [superadminRole] = await queryRunner.query('SELECT id FROM roles WHERE slug = ?', ['superadmin']);
    const [managerRole] = await queryRunner.query('SELECT id FROM roles WHERE slug = ?', ['manager']);
    const [userRole] = await queryRunner.query('SELECT id FROM roles WHERE slug = ?', ['user']);

    const permissions = await queryRunner.query('SELECT id, name FROM permissions');
    const permissionMap = permissions.reduce((map: any, perm: any) => {
      map[perm.name] = perm.id;
      return map;
    }, {});

    // Attach permissions ke superadmin (semua permissions)
    for (const permission of permissions) {
      await queryRunner.query(
        'INSERT INTO role_has_permissions (role_id, permission_id) VALUES (?, ?)',
        [superadminRole.id, permission.id]
      );
    }

    // Attach permissions ke manager
    const managerPermissions = ['hotels:read', 'hotels:write', 'users:read'];
    for (const permName of managerPermissions) {
      if (permissionMap[permName]) {
        await queryRunner.query(
          'INSERT INTO role_has_permissions (role_id, permission_id) VALUES (?, ?)',
          [managerRole.id, permissionMap[permName]]
        );
      }
    }

    // Attach permissions ke user
    const userPermissions = ['hotels:read'];
    for (const permName of userPermissions) {
      if (permissionMap[permName]) {
        await queryRunner.query(
          'INSERT INTO role_has_permissions (role_id, permission_id) VALUES (?, ?)',
          [userRole.id, permissionMap[permName]]
        );
      }
    }

    console.log(`✅ ${roles.length} roles dan permissions berhasil di-attach`);
  } catch (error) {
    console.error('❌ Error seeding roles and attachments:', error);
    throw error;
  }
}
