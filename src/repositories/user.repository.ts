// src/repositories/user.repository.ts

import { BaseRepository, Page } from './base.repository';
import { User } from '../domain';
import { RoleSlug } from '../rbac';

export type UserFilter = Partial<Pick<User, 'id' | 'email' | 'status'>> & {
  hotel_id?: bigint;
  q?: string; // name/email search
};

export interface UserRepository extends BaseRepository<User, UserFilter> {
  findByEmail(email: string): Promise<User | null>;
  listByHotel(
    hotelId: bigint,
    options?: { page?: number; pageSize?: number }
  ): Promise<Page<User>>;
  attachToHotel(userId: bigint, hotelId: bigint, role?: RoleSlug): Promise<void>;
  detachFromHotel(userId: bigint, hotelId: bigint): Promise<void>;
}