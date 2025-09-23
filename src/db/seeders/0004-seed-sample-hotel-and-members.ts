import AppDataSource from '../../data/typeorm-data-source';

export async function seedSampleHotelAndMembers() {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    console.log('ℹ️  Skipping cleanup - data sudah dibersihkan di user seeder');

    const [ownerA] = await queryRunner.query('SELECT id FROM users WHERE email = ?', ['owner@example.com']);
    const [ownerB] = await queryRunner.query('SELECT id FROM users WHERE email = ?', ['owner2@example.com']);
    const [managerUser] = await queryRunner.query('SELECT id FROM users WHERE email = ?', ['manager@example.com']);
    const [marketingUser] = await queryRunner.query('SELECT id FROM users WHERE email = ?', ['marketing@example.com']);
    const [regularUser] = await queryRunner.query('SELECT id FROM users WHERE email = ?', ['user@example.com']);

    if (!ownerA || !ownerB || !managerUser || !marketingUser || !regularUser) {
      throw new Error('Required users not found. Please run user seeder first.');
    }

    await queryRunner.query(
      'INSERT INTO hotels (owner_user_id, name, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [ownerA.id, 'Hotel Alpha', 'active']
    );

    await queryRunner.query(
      'INSERT INTO hotels (owner_user_id, name, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [ownerB.id, 'Hotel Beta', 'active']
    );

    const [hotelAlpha] = await queryRunner.query('SELECT id FROM hotels WHERE name = ?', ['Hotel Alpha']);
    const [hotelBeta] = await queryRunner.query('SELECT id FROM hotels WHERE name = ?', ['Hotel Beta']);

    const hotelAlphaMembers = [
      { hotel_id: hotelAlpha.id, user_id: ownerA.id, name: 'Hotel Owner', status: 'active' },
      { hotel_id: hotelAlpha.id, user_id: marketingUser.id, name: 'Hotel Marketing', status: 'active' },
      { hotel_id: hotelAlpha.id, user_id: regularUser.id, name: 'Regular User', status: 'active' },
    ];

    const hotelBetaMembers = [
      { hotel_id: hotelBeta.id, user_id: ownerB.id, name: 'Hotel Owner', status: 'active' },
      { hotel_id: hotelBeta.id, user_id: managerUser.id, name: 'Hotel Manager', status: 'active' },
    ];

    const allMembers = [...hotelAlphaMembers, ...hotelBetaMembers];

    for (const member of allMembers) {
      await queryRunner.query(
        'INSERT INTO hotel_users (hotel_id, user_id, name, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [member.hotel_id, member.user_id, member.name, member.status]
      );
    }

    console.log(`✅ Sample hotels dan ${allMembers.length} members berhasil di-seed`);
  } catch (error) {
    console.error('❌ Error seeding sample hotel and members:', error);
    throw error;
  }
}
