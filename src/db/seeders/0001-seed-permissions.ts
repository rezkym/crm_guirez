import AppDataSource from '../../data/typeorm-data-source';
import { 
  loadPermissionSeeds, 
  validatePermissionSeed, 
  logSeedingInfo, 
  logSeedingError 
} from './utils/json-loader';

export async function seedPermissions() {
  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    // Load permissions dari JSON file
    console.log('📥 Memuat permission seeds dari JSON...');
    const permissions = loadPermissionSeeds();
    
    // Validasi semua permission data
    const invalidPermissions = permissions.filter(p => !validatePermissionSeed(p));
    if (invalidPermissions.length > 0) {
      console.warn('⚠️  Ada permission data yang tidak valid:', invalidPermissions);
    }
    
    const validPermissions = permissions.filter(p => validatePermissionSeed(p));
    console.log(`📊 Ditemukan ${validPermissions.length} permission valid dari ${permissions.length} total`);

    // Clear existing data in proper order to avoid FK constraints
    console.log('🧹 Menghapus data permission yang sudah ada...');
    await queryRunner.query('DELETE FROM role_has_permissions');
    await queryRunner.query('DELETE FROM model_has_permissions'); 
    await queryRunner.query('DELETE FROM permissions');
    
    // Insert new permissions
    console.log('💾 Menyimpan permissions ke database...');
    for (const permission of validPermissions) {
      await queryRunner.query(
        'INSERT INTO permissions (name, guard_name, resource, action, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [permission.name, permission.guard_name, permission.resource, permission.action]
      );
    }
    
    logSeedingInfo('permissions', validPermissions.length);
  } catch (error) {
    logSeedingError('permissions', error);
    throw error;
  }
}
