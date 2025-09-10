import { User } from '../domain';
import { UserRepository, UserFilter } from '../repositories/user.repository';
import { PasswordService } from '../core/security/password';

export interface CreateUserDTO {
  email: string;
  name?: string;
  password: string;
  status?: User['status'];
  roleSlug?: string; // default 'user'
  hotelId?: bigint;  // optional; if not provided, will fallback to first hotel if available
}

export interface UpdateUserDTO {
  email?: string;
  name?: string;
  password?: string;
  status?: User['status'];
}

/**
 * Users service - handles all user management business logic
 * Provides CRUD operations, role assignment, and hotel association
 */
export class UsersService {
  private static readonly ALLOWED_STATUSES: User['status'][] = ['active', 'suspended', 'freeze'];
  private static readonly DEFAULT_ROLE = 'user';
  
  constructor(
    private readonly repo: UserRepository, 
    private readonly passwordService: PasswordService
  ) {}

  /**
   * List users with pagination and filtering
   */
  async list(filter: UserFilter & { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20, ...rest } = filter || {};
    return this.repo.paginate(rest, page, pageSize, { id: 'DESC' });
  }

  /**
   * Get user by ID
   */
  async getById(id: bigint): Promise<User | null> {
    return this.repo.findById(id);
  }

  /**
   * Create new user with role assignment and hotel association
   */
  async create(payload: CreateUserDTO): Promise<User> {
    // Check email uniqueness
    const existing = await this.repo.findByEmail(payload.email);
    if (existing) {
      throw new Error('Email already in use');
    }

    // Hash password menggunakan bcrypt
    const passwordHash = await this.passwordService.createPasswordHash(payload.password);

    // Validate and normalize status
    const status = this.validateAndNormalizeStatus(payload.status);

    // Create user
    const user = await this.repo.create({
      email: payload.email,
      name: payload.name ?? '',
      password: passwordHash,
      status,
    });

    // Handle post-creation assignments
    await this.handlePostCreationAssignments(user.id, payload);

    return user;
  }

  /**
   * Update user information
   */
  async update(id: bigint, payload: UpdateUserDTO): Promise<User> {
    const updates: Partial<User> = {};
    
    if (payload.email) {
      updates.email = payload.email;
    }
    
    if (payload.name !== undefined) {
      updates.name = payload.name;
    }
    
    if (payload.status !== undefined) {
      updates.status = this.validateAndNormalizeStatus(payload.status);
    }
    
    if (payload.password) {
      updates.password = await this.passwordService.createPasswordHash(payload.password);
    }

    return this.repo.updateById(id, updates);
  }

  /**
   * Soft delete user
   */
  async remove(id: bigint): Promise<{ success: boolean }> {
    await this.repo.softDeleteById(id);
    return { success: true };
  }

  /**
   * Validate and normalize user status
   */
  private validateAndNormalizeStatus(status?: User['status']): User['status'] {
    if (!status) {
      return 'active';
    }

    if (!UsersService.ALLOWED_STATUSES.includes(status)) {
      throw new Error('Invalid status value');
    }

    return status;
  }

  /**
   * Handle post-creation assignments (hotel attachment and role assignment)
   */
  private async handlePostCreationAssignments(
    userId: bigint, 
    payload: CreateUserDTO
  ): Promise<void> {
    const roleToAssign = (payload.roleSlug || UsersService.DEFAULT_ROLE).toLowerCase();

    // Attach to hotel if provided
    if (payload.hotelId) {
      try {
        await this.repo.attachToHotel(userId, payload.hotelId);
        console.log(`User ${userId} successfully attached to hotel ${payload.hotelId}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Failed to attach user ${userId} to hotel ${payload.hotelId}:`, errorMessage);
        // Continue execution - hotel attachment is not critical for user creation
      }
    }

    // Assign default role
    try {
      await this.repo.assignRoleBySlug(userId, roleToAssign, payload.hotelId);
      console.log(`User ${userId} successfully assigned role '${roleToAssign}'`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`Failed to assign role '${roleToAssign}' to user ${userId}:`, errorMessage);
      // Continue execution - role can be assigned later
    }
  }
}