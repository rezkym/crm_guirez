import AppDataSource from '../../data/typeorm-data-source';

export async function seedPermissions() {
  const queryRunner = AppDataSource.createQueryRunner();
  
  const permissions = [
    { name: 'read:users', guard_name: 'api', resource: 'users', action: 'read' },
    { name: 'write:users', guard_name: 'api', resource: 'users', action: 'write' },
    { name: 'read:hotels', guard_name: 'api', resource: 'hotels', action: 'read' },
    { name: 'write:hotels', guard_name: 'api', resource: 'hotels', action: 'write' },
    { name: 'manage:roles', guard_name: 'api', resource: 'roles', action: 'manage' },
    { name: 'manage:permissions', guard_name: 'api', resource: 'permissions', action: 'manage' },
    { name: 'read:settings', guard_name: 'api', resource: 'settings', action: 'read' },
    { name: 'write:actions', guard_name: 'api', resource: 'actions', action: 'write' },
  ];

  try {
    // Clear existing data in proper order to avoid FK constraints
    console.log('🧹 Clearing existing permission data...');
    await queryRunner.query('DELETE FROM role_has_permissions');
    await queryRunner.query('DELETE FROM model_has_permissions'); 
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
