import AppDataSource from '../../data/typeorm-data-source';
import { 
  loadRoleSeeds, 
  loadRolePermissionAttachments,
  validateRoleSeed, 
  logSeedingInfo, 
  logSeedingError 
} from './utils/json-loader';

export async function seedRolesAndAttach() {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    // Load roles dan role-permission mappings dari JSON file
    console.log('📥 Memuat role seeds dari JSON...');
    const roles = loadRoleSeeds();
    const rolePermissionMappings = loadRolePermissionAttachments();
    
    // Validasi role data
    const invalidRoles = roles.filter(r => !validateRoleSeed(r));
    if (invalidRoles.length > 0) {
      console.warn('⚠️  Ada role data yang tidak valid:', invalidRoles);
    }
    
    const validRoles = roles.filter(r => validateRoleSeed(r));
    console.log(`📊 Ditemukan ${validRoles.length} role valid dari ${roles.length} total`);

    // Clear existing role data
    console.log('🧹 Menghapus data role yang sudah ada...');
    await queryRunner.query('DELETE FROM role_has_permissions');
    await queryRunner.query('DELETE FROM roles');
    
    // Insert roles
    console.log('💾 Menyimpan roles ke database...');
    for (const role of validRoles) {
      await queryRunner.query(
        'INSERT INTO roles (name, guard_name, slug, hotel_id, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [role.name, role.guard_name, role.slug, role.hotel_id]
      );
    }

    // Get all roles and permissions for mapping
    console.log('🔗 Menyiapkan role-permission mappings...');
    const dbRoles = await queryRunner.query('SELECT id, slug FROM roles');
    const dbPermissions = await queryRunner.query('SELECT id, name FROM permissions');
    
    // Create permission lookup map
    const permissionMap: { [name: string]: number } = dbPermissions.reduce((map: any, perm: any) => {
      map[perm.name] = perm.id;
      return map;
    }, {});
    
    // Create role lookup map
    const roleMap: { [slug: string]: number } = dbRoles.reduce((map: any, role: any) => {
      map[role.slug] = role.id;
      return map;
    }, {});

    // Attach permissions berdasarkan JSON mapping
    let totalAttachments = 0;
    for (const [roleSlug, permissionNames] of Object.entries(rolePermissionMappings)) {
      const roleId = roleMap[roleSlug];
      
      if (!roleId) {
        console.warn(`⚠️  Role dengan slug '${roleSlug}' tidak ditemukan di database`);
        continue;
      }
      
      console.log(`🔗 Mengattach ${permissionNames.length} permissions ke role '${roleSlug}'...`);
      
      for (const permissionName of permissionNames) {
        const permissionId = permissionMap[permissionName];
        
        if (!permissionId) {
          console.warn(`⚠️  Permission '${permissionName}' tidak ditemukan untuk role '${roleSlug}'`);
          continue;
        }
        
        await queryRunner.query(
          'INSERT INTO role_has_permissions (role_id, permission_id) VALUES (?, ?)',
          [roleId, permissionId]
        );
        
        totalAttachments++;
      }
    }

    logSeedingInfo('roles', validRoles.length);
    console.log(`✅ ${totalAttachments} role-permission attachments berhasil dibuat`);
  } catch (error) {
    logSeedingError('roles and attachments', error);
    throw error;
  }
}
