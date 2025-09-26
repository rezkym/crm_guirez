import { AuthContext } from '../domain/auth';
import { Hotel } from '../domain';
import { ForbiddenError, ValidationError } from '../core/http/error';
import { HotelRepository, HotelFilter } from '../repositories/hotel.repository';
import { isInternalRoleSlug } from '../rbac';

export interface CreateHotelDTO {
  name: string;
  status?: Hotel['status'];
  ownerUserId?: bigint;
}

export interface UpdateHotelDTO {
  name?: string;
  status?: Hotel['status'];
  ownerUserId?: bigint;
}

const ALLOWED_STATUSES: Hotel['status'][] = ['active', 'suspended', 'freeze'];
const ALLOWED_SORT_FIELDS: (keyof Hotel)[] = ['id', 'name', 'created_at'];

export class HotelsService {
  constructor(private readonly repo: HotelRepository) {}

  async list(filter: HotelFilter & { page?: number; pageSize?: number, sortBy?: keyof Hotel, sortOrder?: 'ASC' | 'DESC' }, actor?: AuthContext) {
    const { page = 1, pageSize = 20, sortBy = 'id', sortOrder = 'DESC', ...rest } = filter || {};

    if (sortBy && !ALLOWED_SORT_FIELDS.includes(sortBy)) {
      throw new ValidationError(`Invalid sortBy field: ${sortBy}`);
    }

    const sort = { [sortBy]: sortOrder };

    const normalizedFilter: HotelFilter = { ...rest };

    if (normalizedFilter.owner_user_id && typeof normalizedFilter.owner_user_id !== 'bigint') {
      normalizedFilter.owner_user_id = BigInt(normalizedFilter.owner_user_id as any);
    }

    if (!this.isInternalActor(actor)) {
      if (!actor) {
        throw new ForbiddenError('Authentication context required');
      }
      normalizedFilter.owner_user_id = BigInt(actor.userId);
    }

    return this.repo.paginate(normalizedFilter, page, pageSize, sort);
  }

  async getById(id: bigint, actor?: AuthContext): Promise<Hotel | null> {
    const hotel = await this.repo.findById(id);
    if (!hotel) {
      return null;
    }

    this.assertActorCanAccessHotel(actor, hotel);
    return hotel;
  }

  async create(payload: CreateHotelDTO, actor?: AuthContext): Promise<Hotel> {
    if (!payload.name) {
      throw new Error('name is required');
    }

    const ownerUserId = this.resolveOwnerUserId(payload.ownerUserId, actor);
    const status = this.validateStatus(payload.status);

    const hotel = await this.repo.create({
      name: payload.name,
      status,
      owner_user_id: ownerUserId,
    });

    this.assertActorCanAccessHotel(actor, hotel);
    return hotel;
  }

  async update(id: bigint, payload: UpdateHotelDTO, actor?: AuthContext): Promise<Hotel> {
    const hotel = await this.repo.findById(id);
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    this.assertActorCanAccessHotel(actor, hotel);

    const updates: Partial<Hotel> = {};

    if (payload.name !== undefined) {
      updates.name = payload.name;
    }

    if (payload.status !== undefined) {
      updates.status = this.validateStatus(payload.status);
    }

    if (payload.ownerUserId !== undefined) {
      if (!this.isInternalActor(actor)) {
        throw new ForbiddenError('Only internal actors can reassign hotel ownership');
      }
      updates.owner_user_id = payload.ownerUserId;
    }

    return this.repo.updateById(id, updates);
  }

  async remove(id: bigint, actor?: AuthContext): Promise<{ success: boolean }> {
    const hotel = await this.repo.findById(id);
    if (!hotel) {
      throw new Error('Hotel not found');
    }

    this.assertActorCanAccessHotel(actor, hotel);
    try {
      await this.repo.softDeleteById(id);
    } catch (error: any) {
      throw new Error(`Failed to remove hotel: ${error.message}`);
    }
    return { success: true };
  }

  private validateStatus(status?: Hotel['status']): Hotel['status'] {
    if (!status) {
      return 'active';
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      throw new Error('Invalid status value');
    }

    return status;
  }

  private resolveOwnerUserId(ownerUserId: bigint | undefined, actor?: AuthContext): bigint {
    if (this.isInternalActor(actor)) {
      if (!ownerUserId) {
        throw new Error('ownerUserId is required for internal actors');
      }
      return ownerUserId;
    }

    if (!actor) {
      throw new ForbiddenError('Authentication context required');
    }

    if (ownerUserId && ownerUserId !== BigInt(actor.userId)) {
      throw new ForbiddenError('External actors cannot assign hotels to other owners');
    }

    return BigInt(actor.userId);
  }

  private isInternalActor(actor?: AuthContext): boolean {
    if (!actor) {
      return false;
    }

    if (actor.scope === 'internal') {
      return true;
    }

    return actor.roles.some(role => isInternalRoleSlug(role.slug));
  }

  private assertActorCanAccessHotel(actor: AuthContext | undefined, hotel: Hotel): void {
    if (this.isInternalActor(actor)) {
      return;
    }

    if (!actor) {
      throw new ForbiddenError('Access denied');
    }

    const actorUserId = BigInt(actor.userId);
    if (hotel.owner_user_id !== actorUserId) {
      throw new ForbiddenError('External actors can only access their own hotels');
    }
  }
}
