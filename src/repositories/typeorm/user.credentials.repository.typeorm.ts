/**
 * TypeORM implementation UserCredentialsRepository
 */

import { DataSource } from 'typeorm';
import { UserCredentialsRepository } from '../../domain/auth/ports';
import { UserCredentials, UserStatus } from '../../domain/auth/types';

export class UserCredentialsRepoTypeORM implements UserCredentialsRepository {
  constructor(private dataSource: DataSource) {}

  async findByEmail(email: string): Promise<UserCredentials | null> {
    const userRepo = this.dataSource.createQueryBuilder()
      .select([
        'u.id',
        'u.email', 
        'u.password as passwordHash',
        'u.status'
      ])
      .from('users', 'u')
      .where('u.email = :email', { email })
      .andWhere('u.deleted_at IS NULL') // Exclude soft deleted users
      .getRawOne();

    const user = await userRepo;
    
    if (!user) {
      return null;
    }

    // Get user roles and permissions
    const roles = await this.getUserRoles(user.id);
    const permissions = await this.getUserPermissions(user.id);

    return {
      id: user.id.toString(),
      email: user.email,
      passwordHash: user.passwordHash,
      passwordSalt: '',
      status: this.mapUserStatus(user.status),
      roles,
      permissions
    };
  }

  async findById(userId: string): Promise<UserCredentials | null> {
    const userRepo = this.dataSource.createQueryBuilder()
      .select([
        'u.id',
        'u.email', 
        'u.password as passwordHash',
        'u.status'
      ])
      .from('users', 'u')
      .where('u.id = :userId', { userId: parseInt(userId) })
      .andWhere('u.deleted_at IS NULL') // Exclude soft deleted users
      .getRawOne();

    const user = await userRepo;
    
    if (!user) {
      return null;
    }

    // Get user roles and permissions
    const roles = await this.getUserRoles(user.id);
    const permissions = await this.getUserPermissions(user.id);

    return {
      id: user.id.toString(),
      email: user.email,
      passwordHash: user.passwordHash,
      passwordSalt: '',
      status: this.mapUserStatus(user.status),
      roles,
      permissions
    };
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.dataSource.createQueryBuilder()
      .update('users')
      .set({ 
        updated_at: () => 'CURRENT_TIMESTAMP'
      })
      .where('id = :userId', { userId: parseInt(userId) })
      .execute();
  }

  async updatePassword(userId: string, passwordHash: string, passwordSalt: string): Promise<void> {
    await this.dataSource.createQueryBuilder()
      .update('users')
      .set({ 
        password: passwordHash,
        updated_at: () => 'CURRENT_TIMESTAMP'
      })
      .where('id = :userId', { userId: parseInt(userId) })
      .execute();
  }

  /**
   * Get user roles
   */
  private async getUserRoles(userId: number): Promise<string[]> {
    const roles = await this.dataSource.createQueryBuilder()
      .select('r.slug')
      .from('roles', 'r')
      .innerJoin('model_has_roles', 'mhr', 'r.id = mhr.role_id')
      .where('mhr.model_id = :userId', { userId })
      .andWhere('mhr.model_type = :modelType', { modelType: 'user' })
      .getRawMany();

    return roles.map(role => role.slug);
  }

  /**
   * Get user permissions (direct + via roles)
   */
  private async getUserPermissions(userId: number): Promise<string[]> {
    // Direct permissions
    const directPermissions = await this.dataSource.createQueryBuilder()
      .select('p.name')
      .from('permissions', 'p')
      .innerJoin('model_has_permissions', 'mhp', 'p.id = mhp.permission_id')
      .where('mhp.model_id = :userId', { userId })
      .andWhere('mhp.model_type = :modelType', { modelType: 'user' })
      .getRawMany();

    // Permissions via roles
    const rolePermissions = await this.dataSource.createQueryBuilder()
      .select('p.name')
      .from('permissions', 'p')
      .innerJoin('role_has_permissions', 'rhp', 'p.id = rhp.permission_id')
      .innerJoin('model_has_roles', 'mhr', 'rhp.role_id = mhr.role_id')
      .where('mhr.model_id = :userId', { userId })
      .andWhere('mhr.model_type = :modelType', { modelType: 'user' })
      .getRawMany();

    // Combine dan remove duplicates
    const allPermissions = [
      ...directPermissions.map(p => p.name),
      ...rolePermissions.map(p => p.name)
    ];

    return [...new Set(allPermissions)];
  }

  /**
   * Map database status to domain enum
   */
  private mapUserStatus(dbStatus: string): UserStatus {
    switch (dbStatus) {
      case 'active':
        return UserStatus.ACTIVE;
      case 'suspended':
      case 'freeze':
        return UserStatus.SUSPENDED;
      default:
        return UserStatus.INACTIVE;
    }
  }
}
