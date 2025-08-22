// src/repositories/hotel.repository.ts

import { BaseRepository, Page } from './base.repository';
import { Hotel } from '../domain';

export type HotelFilter = Partial<Pick<Hotel, 'id' | 'status' | 'name'>> & {
  owner_user_id?: bigint;
  q?: string;
};

export interface HotelRepository extends BaseRepository<Hotel, HotelFilter> {
  listByOwner(
    ownerUserId: bigint,
    page?: number,
    pageSize?: number
  ): Promise<Page<Hotel>>;
}