import { User } from '../../domain';
import { Page } from '../../repositories/base.repository';

export type UserDTO = {
  id: string;
  email: string;
  name: string;
  status: User['status'];
  email_verified_at?: Date | null;
  profile_photo_path?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;
};

export function toUserDTO(u: User): UserDTO {
  return {
    id: u.id?.toString?.() ?? String(u.id),
    email: u.email,
    name: u.name,
    status: u.status,
    email_verified_at: u.email_verified_at ?? null,
    profile_photo_path: u.profile_photo_path ?? null,
    created_at: (u as any).created_at ?? null,
    updated_at: (u as any).updated_at ?? null,
  };
}

export function toUserPageDTO(page: Page<User>): Page<UserDTO> {
  return {
    ...page,
    data: page.data.map(toUserDTO),
  };
}

