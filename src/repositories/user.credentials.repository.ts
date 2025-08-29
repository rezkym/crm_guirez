/**
 * User credentials repository - implementasi kontrak untuk auth
 */

import { UserCredentials, UserCredentialsRepository, UserStatus } from '../domain/auth';

export class MemoryUserCredentialsRepository implements UserCredentialsRepository {
  private users: Map<string, UserCredentials> = new Map();
  private emailToId: Map<string, string> = new Map();

  constructor() {
    // Initialize dengan beberapa test users
    this.initializeTestUsers();
  }

  private initializeTestUsers(): void {
    const testUsers: UserCredentials[] = [
      {
        id: '1',
        email: 'admin@example.com',
        passwordHash: 'hyIZWdhRYMj6X6E285oUx8h4KhRmzkCRvMNBiYPJHw0=', // password: admin123
        passwordSalt: 'dGVzdFNhbHQxMjM=',
        status: UserStatus.ACTIVE,
        roles: ['superadmin'],
        permissions: ['*']
      },
      {
        id: '2', 
        email: 'user@example.com',
        passwordHash: 'G3K+ke03szcYEPYIZOYIqJn+tjGRx/YdMKNO4V0a1ik=', // password: user123
        passwordSalt: 'dGVzdFNhbHQ0NTY=',
        status: UserStatus.ACTIVE,
        roles: ['user'],
        permissions: ['read:own']
      },
      {
        id: '3',
        email: 'manager@example.com', 
        passwordHash: 'lMHeZTRMBYsNd87G0qyeqRofqimgyCODZkcidnSHx7M=', // password: manager123
        passwordSalt: 'dGVzdFNhbHQ3ODk=',
        status: UserStatus.ACTIVE,
        roles: ['manager'],
        permissions: ['read:all', 'write:team']
      }
    ];

    for (const user of testUsers) {
      this.users.set(user.id, user);
      this.emailToId.set(user.email, user.id);
    }
  }

  async findByEmail(email: string): Promise<UserCredentials | null> {
    const userId = this.emailToId.get(email);
    
    if (!userId) {
      return null;
    }

    return this.users.get(userId) || null;
  }

  async findById(userId: string): Promise<UserCredentials | null> {
    return this.users.get(userId) || null;
  }

  async updateLastLogin(userId: string): Promise<void> {
    const user = this.users.get(userId);
    
    if (user) {
      // Dalam implementasi memory ini, kita tidak simpan lastLogin
      // Bisa extend interface UserCredentials jika perlu track ini
      console.log(`Last login updated for user: ${userId} at ${new Date().toISOString()}`);
    }
  }

  // Method tambahan untuk management (bisa dipindah ke service terpisah)
  async createUser(userData: Omit<UserCredentials, 'id'>): Promise<UserCredentials> {
    const id = (this.users.size + 1).toString();
    const user: UserCredentials = {
      ...userData,
      id
    };

    this.users.set(id, user);
    this.emailToId.set(user.email, id);

    return user;
  }

  async updateUser(userId: string, updates: Partial<UserCredentials>): Promise<UserCredentials | null> {
    const user = this.users.get(userId);
    
    if (!user) {
      return null;
    }

    const updatedUser = { ...user, ...updates, id: userId };
    
    // Update email mapping jika email berubah
    if (updates.email && updates.email !== user.email) {
      this.emailToId.delete(user.email);
      this.emailToId.set(updates.email, userId);
    }

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    
    if (!user) {
      return false;
    }

    this.users.delete(userId);
    this.emailToId.delete(user.email);
    
    return true;
  }

  // Debug methods
  getAllUsersForDebug(): UserCredentials[] {
    return Array.from(this.users.values());
  }

  getUserCount(): number {
    return this.users.size;
  }
}
