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

export class UsersService {
  constructor(private readonly repo: UserRepository, private readonly passwordService: PasswordService) {}

  async list(filter: UserFilter & { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20, ...rest } = filter || {};
    return this.repo.paginate(rest, page, pageSize, { id: 'DESC' });
  }

  async getById(id: bigint) {
    return this.repo.findById(id);
  }

  async create(payload: CreateUserDTO) {
    const existing = await this.repo.findByEmail(payload.email);
    if (existing) {
      throw new Error('Email already in use');
    }

    const { hash, salt } = await this.passwordService.createPasswordHash(payload.password);
    const passwordStored = `${salt}:${hash}`;

    const allowedStatuses: User['status'][] = ['active', 'suspended', 'freeze'];
    const normalizedStatus = (payload.status && allowedStatuses.includes(payload.status))
      ? payload.status
      : 'active';

    const user = await this.repo.create({
      email: payload.email,
      name: payload.name ?? '',
      password: passwordStored,
      status: normalizedStatus,
    });

    // Ensure default role/permission assignment for RBAC
    const roleToAssign = (payload.roleSlug || 'user').toLowerCase();
    if (payload.hotelId) {
      try { await this.repo.attachToHotel(user.id, payload.hotelId); } catch {}
    }
    try {
      await this.repo.assignRoleBySlug(user.id, roleToAssign, payload.hotelId);
    } catch {
      // If role assignment fails (e.g., no hotel available), continue; user can be updated later
    }

    return user;
  }

  async update(id: bigint, payload: UpdateUserDTO) {
    const updates: Partial<User> = {};
    if (payload.email) {
      updates.email = payload.email;
    }
    if (payload.name !== undefined) {
      updates.name = payload.name;
    }
    if (payload.status !== undefined) {
      const allowedStatuses: User['status'][] = ['active', 'suspended', 'freeze'];
      if (!allowedStatuses.includes(payload.status)) {
        throw new Error('Invalid status value');
      }
      updates.status = payload.status;
    }
    if (payload.password) {
      const { hash, salt } = await this.passwordService.createPasswordHash(payload.password);
      updates.password = `${salt}:${hash}`;
    }

    return this.repo.updateById(id, updates);
  }

  async remove(id: bigint) {
    await this.repo.softDeleteById(id);
    return { success: true };
  }
}
