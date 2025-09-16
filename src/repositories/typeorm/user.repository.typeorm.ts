import { DataSource, SelectQueryBuilder } from 'typeorm';
import { User } from '../../domain';
import { RoleSlug } from '../../rbac';
import { Page } from '../base.repository';
import { UserRepository, UserFilter } from '../user.repository';

type RawUser = {
  id: string | number;
  email: string;
  name: string | null;
  email_verified_at: Date | string | null;
  password: string;
  two_factor_secret: string | null;
  two_factor_recovery_codes: string | null;
  remember_token: string | null;
  status: User['status'];
  user_scope: 'internal' | 'external';
  session: string | null;
  profile_photo_path: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
  deleted_at: Date | string | null;
};

export class UserRepositoryTypeORM implements UserRepository {
  constructor(private readonly dataSource: DataSource) {}

  private baseSelect(): SelectQueryBuilder<any> {
    return this.dataSource
      .createQueryBuilder()
      .from('users', 'u')
      .select([
        'u.id as id',
        'u.email as email',
        'u.name as name',
        'u.email_verified_at as email_verified_at',
        'u.password as password',
        'u.two_factor_secret as two_factor_secret',
        'u.two_factor_recovery_codes as two_factor_recovery_codes',
        'u.remember_token as remember_token',
        "u.status as status",
        "u.user_scope as user_scope",
        'u.session as session',
        'u.profile_photo_path as profile_photo_path',
        'u.created_at as created_at',
        'u.updated_at as updated_at',
        'u.deleted_at as deleted_at',
      ])
      .where('u.deleted_at IS NULL');
  }

  private mapRaw(row: RawUser): User {
    return {
      id: BigInt(row.id as any),
      email: row.email,
      name: row.name ?? '',
      email_verified_at: row.email_verified_at ? new Date(row.email_verified_at) : null,
      password: row.password,
      two_factor_secret: row.two_factor_secret,
      two_factor_recovery_codes: row.two_factor_recovery_codes,
      remember_token: row.remember_token,
      status: row.status,
      user_scope: row.user_scope,
      session: row.session,
      profile_photo_path: row.profile_photo_path,
      created_at: row.created_at ? new Date(row.created_at) : undefined,
      updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
      deleted_at: row.deleted_at ? new Date(row.deleted_at) : null,
    };
  }

  private applyFilter(qb: SelectQueryBuilder<any>, filter: UserFilter): void {
    if (!filter) return;

    if (filter.id) {
      qb.andWhere('u.id = :id', { id: filter.id.toString() });
    }
    if (filter.email) {
      qb.andWhere('u.email = :email', { email: filter.email });
    }
    if (filter.status) {
      qb.andWhere('u.status = :status', { status: filter.status });
    }
    if (filter.q) {
      qb.andWhere('(u.email LIKE :q OR u.name LIKE :q)', { q: `%${filter.q}%` });
    }
    if (filter.hotel_id) {
      qb.innerJoin('hotel_users', 'hu', 'hu.user_id = u.id AND hu.deleted_at IS NULL')
        .andWhere('hu.hotel_id = :hotelId', { hotelId: filter.hotel_id.toString() });
    }
  }

  async findById(id: bigint): Promise<User | null> {
    const row = await this.baseSelect()
      .andWhere('u.id = :id', { id: id.toString() })
      .getRawOne<RawUser>();
    return row ? this.mapRaw(row) : null;
  }

  async findOne(filter: UserFilter): Promise<User | null> {
    const qb = this.baseSelect();
    this.applyFilter(qb, filter);
    const row = await qb.getRawOne<RawUser>();
    return row ? this.mapRaw(row) : null;
  }

  async findMany(
    filter: UserFilter,
    options?: { limit?: number; offset?: number; order?: Record<string, 'ASC' | 'DESC'> }
  ): Promise<User[]> {
    const qb = this.baseSelect();
    this.applyFilter(qb, filter);
    if (options?.order) {
      for (const [col, dir] of Object.entries(options.order)) {
        qb.addOrderBy(`u.${col}`, dir);
      }
    } else {
      qb.addOrderBy('u.id', 'DESC');
    }
    if (options?.limit != null) qb.limit(options.limit);
    if (options?.offset != null) qb.offset(options.offset);
    const rows = await qb.getRawMany<RawUser>();
    return rows.map((r) => this.mapRaw(r));
  }

  async paginate(
    filter: UserFilter,
    page: number,
    pageSize: number,
    order?: Record<string, 'ASC' | 'DESC'>
  ): Promise<Page<User>> {
    const qb = this.baseSelect();
    this.applyFilter(qb, filter);
    if (order) {
      for (const [col, dir] of Object.entries(order)) {
        qb.addOrderBy(`u.${col}`, dir);
      }
    } else {
      qb.addOrderBy('u.id', 'DESC');
    }

    const [rows, total] = await Promise.all([
      qb.clone().limit(pageSize).offset((page - 1) * pageSize).getRawMany<RawUser>(),
      this.count(filter),
    ]);

    return { data: rows.map((r) => this.mapRaw(r)), total, page, pageSize };
  }

  async create(payload: Partial<User>): Promise<User> {
    const result = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into('users')
      .values({
        email: payload.email!,
        name: payload.name ?? null,
        password: payload.password!,
        status: (payload.status ?? 'active') as any,
        user_scope: (payload as any).user_scope ?? 'external',
        email_verified_at: payload.email_verified_at ?? null,
        two_factor_secret: payload.two_factor_secret ?? null,
        two_factor_recovery_codes: payload.two_factor_recovery_codes ?? null,
        remember_token: payload.remember_token ?? null,
        session: payload.session ?? null,
        profile_photo_path: payload.profile_photo_path ?? null,
      })
      .execute();

    const insertedId = result.identifiers?.[0]?.id ?? result.raw?.insertId;
    return (await this.findById(BigInt(insertedId)))!;
  }

  async updateById(id: bigint, payload: Partial<User>): Promise<User> {
    await this.dataSource
      .createQueryBuilder()
      .update('users')
      .set({
        email: payload.email as any,
        name: payload.name as any,
        password: payload.password as any,
        status: (payload.status as any) ?? undefined,
        user_scope: ((payload as any).user_scope as any) ?? undefined,
        email_verified_at: (payload.email_verified_at as any) ?? undefined,
        two_factor_secret: (payload.two_factor_secret as any) ?? undefined,
        two_factor_recovery_codes: (payload.two_factor_recovery_codes as any) ?? undefined,
        remember_token: (payload.remember_token as any) ?? undefined,
        session: (payload.session as any) ?? undefined,
        profile_photo_path: (payload.profile_photo_path as any) ?? undefined,
        updated_at: () => 'CURRENT_TIMESTAMP',
      })
      .where('id = :id', { id: id.toString() })
      .execute();

    const updated = await this.findById(id);
    if (!updated) throw new Error('User not found after update');
    return updated;
  }

  async softDeleteById(id: bigint): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update('users')
      .set({ deleted_at: () => 'CURRENT_TIMESTAMP' })
      .where('id = :id', { id: id.toString() })
      .execute();
  }

  async count(filter: UserFilter): Promise<number> {
    const qb = this.dataSource
      .createQueryBuilder()
      .from('users', 'u')
      .select('COUNT(1)', 'count')
      .where('u.deleted_at IS NULL');
    this.applyFilter(qb, filter);
    const row = await qb.getRawOne<{ count: string }>();
    return parseInt(row?.count ?? '0', 10);
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.baseSelect()
      .andWhere('u.email = :email', { email })
      .getRawOne<RawUser>();
    return row ? this.mapRaw(row) : null;
  }

  async listByHotel(
    hotelId: bigint,
    options?: { page?: number; pageSize?: number }
  ): Promise<Page<User>> {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;

    const qb = this.baseSelect()
      .innerJoin('hotel_users', 'hu', 'hu.user_id = u.id AND hu.deleted_at IS NULL')
      .andWhere('hu.hotel_id = :hotelId', { hotelId: hotelId.toString() })
      .addOrderBy('u.id', 'DESC');

    const [rows, total] = await Promise.all([
      qb.clone().limit(pageSize).offset((page - 1) * pageSize).getRawMany<RawUser>(),
      this.dataSource
        .createQueryBuilder()
        .from('hotel_users', 'hu')
        .innerJoin('users', 'u', 'u.id = hu.user_id AND u.deleted_at IS NULL')
        .where('hu.hotel_id = :hotelId', { hotelId: hotelId.toString() })
        .andWhere('hu.deleted_at IS NULL')
        .select('COUNT(1)', 'count')
        .getRawOne<{ count: string }>()
        .then((r) => parseInt(r?.count ?? '0', 10)),
    ]);

    return { data: rows.map((r) => this.mapRaw(r)), total, page, pageSize };
  }

  async attachToHotel(userId: bigint, hotelId: bigint, _role?: RoleSlug): Promise<void> {
    // Try restore if soft-deleted
    const existing = await this.dataSource
      .createQueryBuilder()
      .from('hotel_users', 'hu')
      .select('hu.id', 'id')
      .where('hu.user_id = :userId AND hu.hotel_id = :hotelId', {
        userId: userId.toString(),
        hotelId: hotelId.toString(),
      })
      .getRawOne<{ id?: string }>();

    if (existing) {
      await this.dataSource
        .createQueryBuilder()
        .update('hotel_users')
        .set({ deleted_at: null, updated_at: () => 'CURRENT_TIMESTAMP' })
        .where('user_id = :userId AND hotel_id = :hotelId', {
          userId: userId.toString(),
          hotelId: hotelId.toString(),
        })
        .execute();
      return;
    }

    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into('hotel_users')
      .values({
        hotel_id: hotelId.toString(),
        user_id: userId.toString(),
        name: 'Member',
        status: 'active',
      })
      .execute();
  }

  async detachFromHotel(userId: bigint, hotelId: bigint): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update('hotel_users')
      .set({ deleted_at: () => 'CURRENT_TIMESTAMP' })
      .where('user_id = :userId AND hotel_id = :hotelId', {
        userId: userId.toString(),
        hotelId: hotelId.toString(),
      })
      .execute();
  }

  async assignRoleBySlug(userId: bigint, roleSlug: string, hotelId?: bigint): Promise<void> {
    // Find role id
    const role = await this.dataSource
      .createQueryBuilder()
      .from('roles', 'r')
      .select('r.id', 'id')
      .where('r.slug = :slug', { slug: roleSlug })
      .andWhere('r.deleted_at IS NULL')
      .getRawOne<{ id?: string }>();

    if (!role?.id) {
      throw new Error(`Role not found: ${roleSlug}`);
    }

    // Resolve hotel id
    let resolvedHotelId = hotelId;
    if (!resolvedHotelId) {
      const hotel = await this.dataSource
        .createQueryBuilder()
        .from('hotels', 'h')
        .select('h.id', 'id')
        .where('h.deleted_at IS NULL')
        .orderBy('h.id', 'ASC')
        .limit(1)
        .getRawOne<{ id?: string }>();
      if (!hotel?.id) {
        // No hotel available to attach context; skip silently
        // or throw if strict is required
        return;
      }
      resolvedHotelId = BigInt(hotel.id);
    }

    // Upsert model_has_roles
    const exists = await this.dataSource
      .createQueryBuilder()
      .from('model_has_roles', 'mhr')
      .select('1', 'v')
      .where('mhr.role_id = :roleId AND mhr.model_id = :userId AND mhr.model_type = :type AND mhr.hotel_id = :hotelId', {
        roleId: role.id,
        userId: userId.toString(),
        type: 'user',
        hotelId: resolvedHotelId.toString(),
      })
      .getRawOne<{ v?: number }>();

    if (!exists) {
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('model_has_roles')
        .values({
          role_id: role.id,
          hotel_id: resolvedHotelId.toString(),
          model_id: userId.toString(),
          model_type: 'user',
        } as any)
        .execute();
    }
  }
}
