import { Hotel } from '../../domain';
import { Page } from '../../repositories/base.repository';

export type HotelDTO = {
  id: string;
  owner_user_id: string;
  name: string;
  status: Hotel['status'];
  created_at?: Date | null;
  updated_at?: Date | null;
};

export function toHotelDTO(hotel: Hotel): HotelDTO {
  return {
    id: hotel.id?.toString?.() ?? String(hotel.id),
    owner_user_id: hotel.owner_user_id?.toString?.() ?? String(hotel.owner_user_id),
    name: hotel.name,
    status: hotel.status,
    created_at: (hotel as any).created_at ?? null,
    updated_at: (hotel as any).updated_at ?? null,
  };
}

export function toHotelPageDTO(page: Page<Hotel>): Page<HotelDTO> {
  return {
    ...page,
    data: page.data.map(toHotelDTO),
  };
}
