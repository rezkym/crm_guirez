import 'dotenv/config';
import AppDataSource from '../../data/typeorm-data-source';
import { seedPermissions } from './0001-seed-permissions';
import { seedDevUsers } from './0002-seed-dev-users';
import { seedRolesAndAttach } from './0003-seed-roles-and-attach';
import { seedSampleHotelAndMembers } from './0004-seed-sample-hotel-and-members';
import { seedUserRoles } from './0005-seed-user-roles';

async function runSeeders() {
  try {
    console.log('🌱 Memulai database seeding...');
    
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Koneksi database berhasil');

    // Run seeders in order
    console.log('📊 Seeding permissions...');
    await seedPermissions();
    
    console.log('👥 Seeding dev users...');
    await seedDevUsers();
    
    console.log('🏷️  Seeding roles dan attachment...');
    await seedRolesAndAttach();
    
    console.log('🏨 Seeding sample hotel dan members...');
    await seedSampleHotelAndMembers();
    
    console.log('👥 Assigning roles to users...');
    await seedUserRoles();

    console.log('🎉 Database seeding berhasil!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('💔 Koneksi database ditutup');
    }
  }
}

// Run seeders
runSeeders();
