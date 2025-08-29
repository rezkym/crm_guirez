import AppDataSource from '../../data/typeorm-data-source';
import { pbkdf2Sync } from 'crypto';

function hashPassword(password: string): string {
  const iterations = parseInt(process.env.PASSWORD_PBKDF2_ITERATIONS || '210000');
  const salt = 'dev-salt-for-seeding'; // Static salt untuk development
  const keyLength = 64;
  const digest = 'sha512';
  
  const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest);
  return `${salt}:${hash.toString('hex')}`;
}

export async function seedDevUsers() {
  const queryRunner = AppDataSource.createQueryRunner();
  
  const users = [
    {
      email: 'admin@example.com',
      name: 'Administrator',
      password: hashPassword('admin123'),
      status: 'active',
    },
    {
      email: 'manager@example.com',
      name: 'Manager User',
      password: hashPassword('manager123'),
      status: 'active',
    },
    {
      email: 'user@example.com',
      name: 'Regular User',
      password: hashPassword('user123'),
      status: 'active',
    },
  ];

  try {
    // Clear existing users
    await queryRunner.query('DELETE FROM users');
    
    // Insert new users
    for (const user of users) {
      await queryRunner.query(
        'INSERT INTO users (email, name, password, status, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [user.email, user.name, user.password, user.status]
      );
    }
    
    console.log(`✅ ${users.length} dev users berhasil di-seed`);
  } catch (error) {
    console.error('❌ Error seeding dev users:', error);
    throw error;
  }
}
