import AppDataSource from '../../data/typeorm-data-source';

export async function seedSampleHotelAndMembers() {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    // Data sudah dibersihkan di user seeder, jadi kita skip cleanup di sini
    console.log('ℹ️  Skipping cleanup - data sudah dibersihkan di user seeder');

    // Ambil pengguna untuk ownership dan keanggotaan
    const [ownerUser] = await queryRunner.query('SELECT id FROM users WHERE email = ?', ['owner@example.com']);
    const [managerUser] = await queryRunner.query('SELECT id FROM users WHERE email = ?', ['manager@example.com']);
    const [marketingUser] = await queryRunner.query('SELECT id FROM users WHERE email = ?', ['marketing@example.com']);
    const [regularUser] = await queryRunner.query('SELECT id FROM users WHERE email = ?', ['user@example.com']);

    if (!ownerUser || !managerUser || !marketingUser || !regularUser) {
      throw new Error('Required users not found. Please run user seeder first.');
    }

    // Insert sample hotel
    await queryRunner.query(
      'INSERT INTO hotels (owner_user_id, name, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [ownerUser.id, 'Hotel Contoh', 'active']
    );

    const [hotel] = await queryRunner.query('SELECT id FROM hotels WHERE name = ?', ['Hotel Contoh']);

    // Insert hotel_users (members)
    const hotelUsers = [
      { hotel_id: hotel.id, user_id: managerUser.id, name: 'Hotel Manager', status: 'active' },
      { hotel_id: hotel.id, user_id: marketingUser.id, name: 'Hotel Marketing', status: 'active' },
      { hotel_id: hotel.id, user_id: regularUser.id, name: 'Regular User', status: 'active' },
    ];

    for (const hotelUser of hotelUsers) {
      await queryRunner.query(
        'INSERT INTO hotel_users (hotel_id, user_id, name, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [hotelUser.hotel_id, hotelUser.user_id, hotelUser.name, hotelUser.status]
      );
    }

    // Role assignments akan dilakukan di user-roles seeder, jadi skip di sini
    console.log('ℹ️  Role assignments akan dilakukan di user-roles seeder');

    console.log(`✅ Sample hotel dan ${hotelUsers.length} members berhasil di-seed`);
  } catch (error) {
    console.error('❌ Error seeding sample hotel and members:', error);
    throw error;
  }
}
