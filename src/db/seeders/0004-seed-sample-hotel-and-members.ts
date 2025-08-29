import AppDataSource from '../../data/typeorm-data-source';

export async function seedSampleHotelAndMembers() {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    // Clear existing data
    await queryRunner.query('DELETE FROM model_has_roles');
    await queryRunner.query('DELETE FROM hotel_users');
    await queryRunner.query('DELETE FROM hotels');

    // Get admin user untuk ownership
    const [adminUser] = await queryRunner.query('SELECT id FROM users WHERE email = ?', ['admin@example.com']);
    const [managerUser] = await queryRunner.query('SELECT id FROM users WHERE email = ?', ['manager@example.com']);
    const [regularUser] = await queryRunner.query('SELECT id FROM users WHERE email = ?', ['user@example.com']);

    if (!adminUser || !managerUser || !regularUser) {
      throw new Error('Required users not found. Please run user seeder first.');
    }

    // Insert sample hotel
    await queryRunner.query(
      'INSERT INTO hotels (owner_user_id, name, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [adminUser.id, 'Hotel Contoh', 'active']
    );

    const [hotel] = await queryRunner.query('SELECT id FROM hotels WHERE name = ?', ['Hotel Contoh']);

    // Insert hotel_users (members)
    const hotelUsers = [
      { hotel_id: hotel.id, user_id: managerUser.id, name: 'Manager User', status: 'active' },
      { hotel_id: hotel.id, user_id: regularUser.id, name: 'Regular User', status: 'active' },
    ];

    for (const hotelUser of hotelUsers) {
      await queryRunner.query(
        'INSERT INTO hotel_users (hotel_id, user_id, name, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [hotelUser.hotel_id, hotelUser.user_id, hotelUser.name, hotelUser.status]
      );
    }

    // Get role IDs
    const [managerRole] = await queryRunner.query('SELECT id FROM roles WHERE slug = ?', ['manager']);
    const [userRole] = await queryRunner.query('SELECT id FROM roles WHERE slug = ?', ['user']);

    // Assign roles ke users dalam hotel (model_has_roles)
    const roleAssignments = [
      { role_id: managerRole.id, hotel_id: hotel.id, model_id: managerUser.id, model_type: 'user' },
      { role_id: userRole.id, hotel_id: hotel.id, model_id: regularUser.id, model_type: 'user' },
    ];

    for (const assignment of roleAssignments) {
      await queryRunner.query(
        'INSERT INTO model_has_roles (role_id, hotel_id, model_id, model_type) VALUES (?, ?, ?, ?)',
        [assignment.role_id, assignment.hotel_id, assignment.model_id, assignment.model_type]
      );
    }

    console.log(`✅ Sample hotel dan ${hotelUsers.length} members berhasil di-seed`);
  } catch (error) {
    console.error('❌ Error seeding sample hotel and members:', error);
    throw error;
  }
}
