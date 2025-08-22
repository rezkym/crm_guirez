// src/domain/entity.ts

export type TimestampFields = {
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
};

export type UserStatus = 'active' | 'suspended' | 'freeze';

export type HotelStatus = 'active' | 'suspended' | 'freeze';

export interface User extends TimestampFields {
  id: bigint;
  email: string;
  name: string;
  email_verified_at?: Date | null;
  password: string;
  two_factor_secret?: string | null;
  two_factor_recovery_codes?: string | null;
  remember_token?: string | null;
  status: UserStatus;
  session?: string | null;
  profile_photo_path?: string | null;
}

export interface Hotel extends TimestampFields {
  id: bigint;
  owner_user_id: bigint;
  name: string;
  status: HotelStatus;
}

export interface HotelUser extends TimestampFields {
  id: bigint;
  hotel_id: bigint;
  user_id: bigint;
  name: string;
  status: HotelStatus;
}

// Role & Permission (mirror ERD sederhana)
export interface Permission extends TimestampFields {
  id: bigint;
  name: string;
  guard_name: string;
  resource: string; // ex: 'user', 'hotel'
  action: string;   // ex: 'create', 'read'
}

export interface Role extends TimestampFields {
  id: bigint;
  hotel_id?: bigint | null; // null/global
  name: string;
  guard_name: string;
  slug: string; // unique NN
}

export interface RoleHasPermission {
  permission_id: bigint;
  role_id: bigint;
}

export interface ModelHasRole {
  role_id: bigint;
  hotel_id?: bigint | null;
  model_id: bigint;   // user id
  model_type: 'global' | 'hotel';
}

export interface ModelHasPermission {
  permission_id: bigint;
  model_id: bigint;   // user id
  hotel_id?: bigint | null;
  model_type: string;
}