import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface untuk Permission seed data
 */
export interface PermissionSeed {
  name: string;
  guard_name: string;
  resource: string;
  action: string;
  description?: string;
}

/**
 * Interface untuk Role seed data
 */
export interface RoleSeed {
  name: string;
  guard_name: string;
  slug: string;
  hotel_id: number | null;
  description?: string;
}

/**
 * Interface untuk Permission Seeds JSON
 */
export interface PermissionSeedsJson {
  permissions: PermissionSeed[];
}

/**
 * Interface untuk Role Seeds JSON
 */
export interface RoleSeedsJson {
  roles: RoleSeed[];
}

/**
 * Interface untuk Role-Permission Attachment JSON
 */
export interface RolePermissionAttachJson {
  role_permissions: { [roleSlug: string]: string[] };
}

/**
 * Membaca file JSON dari seeds-data directory
 */
function readJsonSeedFile<T>(filename: string): T {
  const filePath = path.join(__dirname, '../../seeds-data', filename);
  
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData) as T;
  } catch (error) {
    console.error(`❌ Error membaca file ${filename}:`, error);
    throw new Error(`Gagal membaca file seed: ${filename}`);
  }
}

/**
 * Membaca permission seeds dari JSON
 */
export function loadPermissionSeeds(): PermissionSeed[] {
  const data = readJsonSeedFile<PermissionSeedsJson>('permission_seeds.json');
  return data.permissions;
}

/**
 * Membaca role seeds dari JSON
 */
export function loadRoleSeeds(): RoleSeed[] {
  const data = readJsonSeedFile<RoleSeedsJson>('role_seeds.json');
  return data.roles;
}

/**
 * Membaca role-permission attachment dari JSON
 */
export function loadRolePermissionAttachments(): { [roleSlug: string]: string[] } {
  const data = readJsonSeedFile<RolePermissionAttachJson>('attach_role_permission.json');
  return data.role_permissions;
}

/**
 * Validasi permission seed data
 */
export function validatePermissionSeed(permission: PermissionSeed): boolean {
  return !!(
    permission.name &&
    permission.guard_name &&
    permission.resource &&
    permission.action
  );
}

/**
 * Validasi role seed data
 */
export function validateRoleSeed(role: RoleSeed): boolean {
  return !!(
    role.name &&
    role.guard_name &&
    role.slug
  );
}

/**
 * Log informasi seeding
 */
export function logSeedingInfo(type: string, count: number, source: string = 'JSON') {
  console.log(`✅ ${count} ${type} berhasil di-seed dari ${source}`);
}

/**
 * Log error seeding
 */
export function logSeedingError(type: string, error: any) {
  console.error(`❌ Error seeding ${type}:`, error);
}
