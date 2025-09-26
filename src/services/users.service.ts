import { AuthContext } from "../domain/auth";
import { ForbiddenError, ValidationError } from "../core/http/error";
import { PasswordService } from "../core/security/password";
import { User } from "../domain";
import { UserRepository, UserFilter, UserQueryOptions } from "../repositories/user.repository";
import { HotelRepository } from "../repositories/hotel.repository";
import { isInternalRoleSlug, RoleSlug } from "../rbac";

export interface CreateUserDTO {
  email: string;
  name?: string;
  password: string;
  status?: User["status"];
  roleSlug?: string; // default 'user'
  hotelId?: bigint; // optional; if not provided, will fallback to first hotel if available
}

export interface UpdateUserDTO {
  email?: string;
  name?: string;
  password?: string;
  status?: User["status"];
  roleSlug?: string;
  hotelId?: bigint;
}

const INTERNAL_ROLE_EXCLUSIONS: string[] = [RoleSlug.SUPERADMIN, RoleSlug.ADMIN];

/**
 * Users service - handles all user management business logic
 * Provides CRUD operations, role assignment, and hotel association
 */
export class UsersService {
  private static readonly ALLOWED_STATUSES: User["status"][] = ["active", "suspended", "freeze"];
  private static readonly ALLOWED_SORT_FIELDS: (keyof User)[] = ["id", "name", "email", "created_at"];
  private static readonly DEFAULT_ROLE = RoleSlug.USER;
  private static readonly MIN_PASSWORD_LENGTH = 8;

  constructor(
    private readonly repo: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly hotelRepo?: HotelRepository
  ) {}

  /**
   * List users with pagination and filtering
   */
  async list(filter: UserFilter & { page?: number; pageSize?: number; sortBy?: keyof User; sortOrder?: "ASC" | "DESC" }, actor?: AuthContext) {
    const { page = 1, pageSize = 20, sortBy = "id", sortOrder = "DESC", ...rest } = filter || {};

    if (sortBy && !UsersService.ALLOWED_SORT_FIELDS.includes(sortBy)) {
      throw new ValidationError(`Invalid sortBy field: ${sortBy}`);
    }

    const sort = { [sortBy]: sortOrder };

    const normalizedFilter: UserFilter = { ...rest };
    if (normalizedFilter.hotel_id && typeof normalizedFilter.hotel_id !== "bigint") {
      normalizedFilter.hotel_id = BigInt(normalizedFilter.hotel_id as any);
    }

    if (this.isInternalActor(actor)) {
      return this.repo.paginateScoped(normalizedFilter, page, pageSize, sort);
    }

    if (!actor) {
      throw new ForbiddenError("Authentication required");
    }

    const actorUserId = BigInt(actor.userId);
    const accessibleHotelIds = await this.resolveAccessibleHotelIds(actorUserId);

    if (normalizedFilter.hotel_id) {
      const allowed = accessibleHotelIds.some((id) => id === normalizedFilter.hotel_id);
      if (!allowed) {
        throw new ForbiddenError("Actor does not have access to the specified hotelId");
      }
    } else if (accessibleHotelIds.length > 1) {
      throw new ForbiddenError("Specify hotelId when managing multiple hotels");
    }

    const queryOptions: UserQueryOptions = {
      excludeRoleSlugs: INTERNAL_ROLE_EXCLUSIONS,
      includeUserIds: [actorUserId],
    };

    if (accessibleHotelIds.length > 0) {
      queryOptions.hotelIds = accessibleHotelIds;
    }

    return this.repo.paginateScoped(normalizedFilter, page, pageSize, sort, queryOptions);
  }

  /**
   * Get user by ID
   */
  async getById(id: bigint, actor?: AuthContext): Promise<User | null> {
    const user = await this.repo.findById(id);
    if (!user) {
      return null;
    }

    await this.assertActorCanAccessUser(actor, id);
    return user;
  }

  /**
   * Create new user with role assignment and hotel association
   */
  async create(payload: CreateUserDTO, actor?: AuthContext): Promise<User> {
    const normalizedEmail = payload.email.trim().toLowerCase();

    // Check email uniqueness
    const existing = await this.repo.findByEmail(normalizedEmail);
    if (existing) {
      throw new Error("Email already in use");
    }

    // Validate password policy
    if (payload.password.length < UsersService.MIN_PASSWORD_LENGTH) {
      throw new ValidationError(`Password must be at least ${UsersService.MIN_PASSWORD_LENGTH} characters long`);
    }

    const normalizedRoleSlug = (payload.roleSlug || UsersService.DEFAULT_ROLE).toString().toLowerCase() as RoleSlug;

    if (!this.isInternalActor(actor) && isInternalRoleSlug(normalizedRoleSlug)) {
      throw new ForbiddenError("External actors cannot assign internal roles");
    }

    let targetHotelId = payload.hotelId;

    if (!this.isInternalActor(actor)) {
      if (!actor) {
        throw new ForbiddenError("Authentication required");
      }

      const actorUserId = BigInt(actor.userId);
      const accessibleHotelIds = await this.resolveAccessibleHotelIds(actorUserId);

      if (targetHotelId) {
        if (!accessibleHotelIds.some((id) => id === targetHotelId)) {
          throw new ForbiddenError("External actors cannot assign users to other hotels");
        }
      } else {
        if (accessibleHotelIds.length === 1) {
          targetHotelId = accessibleHotelIds[0];
        } else if (accessibleHotelIds.length === 0) {
          throw new ForbiddenError("External actors must belong to a hotel before creating users");
        } else {
          throw new ForbiddenError("Specify hotelId when managing multiple hotels");
        }
      }
    }

    // Hash password menggunakan bcrypt
    const passwordHash = await this.passwordService.createPasswordHash(payload.password);

    // Validate and normalize status
    const status = this.validateAndNormalizeStatus(payload.status);

    // Create user
    const user = await this.repo.createWithRoleAndHotel(
      {
        email: normalizedEmail,
        name: payload.name ?? "",
        password: passwordHash,
        status,
      },
      normalizedRoleSlug,
      targetHotelId
    );

    return user;
  }

  /**
   * Update user information
   */
  async update(id: bigint, payload: UpdateUserDTO, actor?: AuthContext): Promise<User> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    await this.assertActorCanAccessUser(actor, id);

    const updates: Partial<User> = {};

    if (payload.email) {
      const normalizedEmail = payload.email.trim().toLowerCase();
      const existing = await this.repo.findByEmail(normalizedEmail);
      if (existing && existing.id !== id) {
        throw new Error("Email already in use");
      }
      updates.email = normalizedEmail;
    }

    if (payload.name !== undefined) {
      updates.name = payload.name;
    }

    if (payload.status !== undefined) {
      updates.status = this.validateAndNormalizeStatus(payload.status);
    }

    if (payload.password) {
      if (payload.password.length < UsersService.MIN_PASSWORD_LENGTH) {
        throw new ValidationError(`Password must be at least ${UsersService.MIN_PASSWORD_LENGTH} characters long`);
      }
      updates.password = await this.passwordService.createPasswordHash(payload.password);
    }

    const updatedUser = await this.repo.updateById(id, updates);

    if (payload.roleSlug) {
      const normalizedRoleSlug = payload.roleSlug.toString().toLowerCase() as RoleSlug;

      if (!this.isInternalActor(actor) && isInternalRoleSlug(normalizedRoleSlug)) {
        throw new ForbiddenError("External actors cannot assign internal roles");
      }

      let targetHotelId = payload.hotelId;

      if (!this.isInternalActor(actor)) {
        if (!actor) {
          throw new ForbiddenError("Authentication required");
        }

        const actorUserId = BigInt(actor.userId);
        const accessibleHotelIds = await this.resolveAccessibleHotelIds(actorUserId);

        if (targetHotelId) {
          if (!accessibleHotelIds.some((id) => id === targetHotelId)) {
            throw new ForbiddenError("External actors cannot assign users to other hotels");
          }
        } else {
          if (accessibleHotelIds.length === 1) {
            targetHotelId = accessibleHotelIds[0];
          } else if (accessibleHotelIds.length > 1) {
            throw new ForbiddenError("Specify hotelId when managing multiple hotels");
          } else {
            // This case means actor has 0 hotels, but wants to assign a role.
            throw new ForbiddenError("External actors must belong to a hotel before reassigning roles");
          }
        }
      }

      await this.repo.updateUserRoleAndHotel(id, normalizedRoleSlug, targetHotelId);
    }

    return updatedUser;
  }

  /**
   * Soft delete user
   */
  async remove(id: bigint, actor?: AuthContext): Promise<{ success: boolean }> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    // users tidak bisa menghapus dirinya sendiri
    if (actor && BigInt(actor.userId) === id) {
      throw new ForbiddenError("Actors cannot remove themselves");
    }
    await this.assertActorCanAccessUser(actor, id);
    try {
      await this.repo.softDeleteById(id);
    } catch (error: any) {
      throw new Error(`Failed to remove user: ${error.message}`);
    }
    return { success: true };
  }

  /**
   * Validate and normalize user status
   */
  private validateAndNormalizeStatus(status?: User["status"]): User["status"] {
    if (!status) {
      return "active";
    }

    if (!UsersService.ALLOWED_STATUSES.includes(status)) {
      throw new Error("Invalid status value");
    }

    return status;
  }

  private isInternalActor(actor?: AuthContext): boolean {
    if (!actor) {
      return false;
    }

    if (actor.scope === "internal") {
      return true;
    }

    return actor.roles.some((role) => isInternalRoleSlug(role.slug));
  }

  private async assertActorCanAccessUser(actor: AuthContext | undefined, targetUserId: bigint): Promise<void> {
    if (this.isInternalActor(actor)) {
      return;
    }

    if (!actor) {
      throw new ForbiddenError("Authentication required");
    }

    const targetRoles = await this.repo.getUserRoleSlugs(targetUserId);
    if (targetRoles.some(isInternalRoleSlug)) {
      throw new ForbiddenError("External actors cannot access internal users");
    }

    const actorUserId = BigInt(actor.userId);
    if (actorUserId === targetUserId) {
      return;
    }

    const accessibleHotelIds = await this.resolveAccessibleHotelIds(actorUserId);

    if (accessibleHotelIds.length === 0) {
      throw new ForbiddenError("External actors cannot access other users");
    }

    const targetHotelIds = await this.repo.getUserHotelIds(targetUserId);
    const sharesHotel = targetHotelIds.some((targetHotelId) => accessibleHotelIds.some((accessibleId) => accessibleId === targetHotelId));

    if (!sharesHotel) {
      throw new ForbiddenError("External actors cannot access users outside their hotels");
    }
  }

  private async resolveAccessibleHotelIds(userId: bigint): Promise<bigint[]> {
    if (this.hotelRepo) {
      const hotelIds = await this.hotelRepo.getHotelIdsForUser(userId);
      if (hotelIds.length > 0) {
        return hotelIds;
      }
    }

    if (this.repo.getUserHotelIds) {
      return this.repo.getUserHotelIds(userId);
    }

    return [];
  }
}
