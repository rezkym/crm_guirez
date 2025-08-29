import AppDataSource from '../../data/typeorm-data-source';

export async function seedPermissions() {
  const queryRunner = AppDataSource.createQueryRunner();
  
  const permissions = [
    { name: 'users:read', guard_name: 'api', resource: 'users', action: 'read' },
    { name: 'users:write', guard_name: 'api', resource: 'users', action: 'write' },
    { name: 'hotels:read', guard_name: 'api', resource: 'hotels', action: 'read' },
    { name: 'hotels:write', guard_name: 'api', resource: 'hotels', action: 'write' },
    { name: 'roles:manage', guard_name: 'api', resource: 'roles', action: 'manage' },
    { name: 'permissions:manage', guard_name: 'api', resource: 'permissions', action: 'manage' },
  ];

  try {
    // Clear existing permissions
    await queryRunner.query('DELETE FROM permissions');
    
    // Insert new permissions
    for (const permission of permissions) {
      await queryRunner.query(
        'INSERT INTO permissions (name, guard_name, resource, action, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [permission.name, permission.guard_name, permission.resource, permission.action]
      );
    }
    
    console.log(`✅ ${permissions.length} permissions berhasil di-seed`);
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  }
}
