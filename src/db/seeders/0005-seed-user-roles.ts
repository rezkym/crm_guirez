import AppDataSource from '../../data/typeorm-data-source';

/**
 * Assign roles to users based on email patterns
 * Clean, maintainable approach using lookups instead of hardcoded IDs
 */
export async function seedUserRoles() {
  const queryRunner = AppDataSource.createQueryRunner();

  try {
    // Clear existing user-role assignments
    console.log('🧹 Clearing existing user-role assignments...');
    await queryRunner.query('DELETE FROM model_has_roles WHERE model_type = ?', ['user']);
    
    // Define user-role mappings based on email patterns
    const userRoleMappings = [
      { emailPattern: 'admin@example.com', roleSlug: 'superadmin' },
      { emailPattern: 'manager@example.com', roleSlug: 'manager' },
      { emailPattern: 'user@example.com', roleSlug: 'user' },
    ];

    console.log('🔗 Assigning roles to users...');
    
    // Get hotel ID yang sudah dibuat sebelumnya
    const hotels = await queryRunner.query('SELECT id FROM hotels WHERE name = ?', ['Hotel Contoh']);
    if (hotels.length === 0) {
      throw new Error('Hotel not found. Please run hotel seeder first.');
    }
    const hotelId = hotels[0].id;
    
    for (const mapping of userRoleMappings) {
      // Get user by email
      const users = await queryRunner.query(
        'SELECT id, email FROM users WHERE email = ? AND deleted_at IS NULL',
        [mapping.emailPattern]
      );

      if (users.length === 0) {
        console.log(`⚠️  User ${mapping.emailPattern} not found, skipping...`);
        continue;
      }

      // Get role by slug
      const roles = await queryRunner.query(
        'SELECT id, name FROM roles WHERE slug = ?',
        [mapping.roleSlug]
      );

      if (roles.length === 0) {
        console.log(`⚠️  Role ${mapping.roleSlug} not found, skipping...`);
        continue;
      }

      const user = users[0];
      const role = roles[0];

      // Insert user-role assignment dengan hotel_id
      await queryRunner.query(
        'INSERT INTO model_has_roles (role_id, hotel_id, model_id, model_type) VALUES (?, ?, ?, ?)',
        [role.id, hotelId, user.id, 'user']
      );

      console.log(`✅ Assigned role "${role.name}" to user "${user.email}"`);
    }

    // Verify assignments
    const assignments = await queryRunner.query(`
      SELECT 
        u.email as user_email,
        r.name as role_name,
        r.slug as role_slug,
        h.name as hotel_name
      FROM model_has_roles mhr
      JOIN users u ON mhr.model_id = u.id AND mhr.model_type = 'user'
      JOIN roles r ON mhr.role_id = r.id
      JOIN hotels h ON mhr.hotel_id = h.id
      ORDER BY u.email
    `);

    console.log('📋 Final user-role assignments:');
    assignments.forEach((assignment: any) => {
      console.log(`  - ${assignment.user_email} → ${assignment.role_name} (${assignment.role_slug})`);
    });

    console.log(`✅ User roles seeding completed! ${assignments.length} assignments created.`);

  } catch (error) {
    console.error('❌ Error seeding user roles:', error);
    throw error;
  }
}
