import { DataSource, SelectQueryBuilder } from 'typeorm';
import { Hotel } from '../../domain';
import { Page } from '../base.repository';
import { HotelRepository, HotelFilter } from '../hotel.repository';

type RawHotel = {
  id: string | number;
  owner_user_id: string | number;
  name: string;
  status: Hotel['status'];
  created_at: Date | string | null;
  updated_at: Date | string | null;
  deleted_at: Date | string | null;
};

export class HotelRepositoryTypeORM implements HotelRepository {
  constructor(private readonly dataSource: DataSource) {}

  private baseSelect(): SelectQueryBuilder<any> {
    return this.dataSource
      .createQueryBuilder()
      .from('hotels', 'h')
      .select([
        'h.id as id',
        'h.owner_user_id as owner_user_id',
        'h.name as name',
        "h.status as status",
        'h.created_at as created_at',
        'h.updated_at as updated_at',
        'h.deleted_at as deleted_at',
      ])
      .where('h.deleted_at IS NULL');
  }

  private mapRaw(row: RawHotel): Hotel {
    return {
      id: BigInt(row.id as any),
      owner_user_id: BigInt(row.owner_user_id as any),
      name: row.name,
      status: row.status,
      created_at: row.created_at ? new Date(row.created_at) : undefined,
      updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
      deleted_at: row.deleted_at ? new Date(row.deleted_at) : null,
    };
  }

  private applyFilter(qb: SelectQueryBuilder<any>, filter: HotelFilter): void {
    if (!filter) return;

    if (filter.id) {
      qb.andWhere('h.id = :id', { id: filter.id.toString() });
    }

    if (filter.owner_user_id) {
      qb.andWhere('h.owner_user_id = :ownerUserId', { ownerUserId: filter.owner_user_id.toString() });
    }

    if (filter.status) {
      qb.andWhere('h.status = :status', { status: filter.status });
    }

    if (filter.name) {
      qb.andWhere('h.name = :name', { name: filter.name });
    }

    if (filter.q) {
      qb.andWhere('h.name LIKE :q', { q: `%${filter.q}%` });
    }
  }

  async findById(id: bigint): Promise<Hotel | null> {
    const row = await this.baseSelect()
      .andWhere('h.id = :id', { id: id.toString() })
      .getRawOne<RawHotel>();

    return row ? this.mapRaw(row) : null;
  }

  async findOne(filter: HotelFilter): Promise<Hotel | null> {
    const qb = this.baseSelect();
    this.applyFilter(qb, filter);
    const row = await qb.getRawOne<RawHotel>();
    return row ? this.mapRaw(row) : null;
  }

  async findMany(
    filter: HotelFilter,
    options?: { limit?: number; offset?: number; order?: Record<string, 'ASC' | 'DESC'> }
  ): Promise<Hotel[]> {
    const qb = this.baseSelect();
    this.applyFilter(qb, filter);

    if (options?.order) {
      for (const [column, direction] of Object.entries(options.order)) {
        qb.addOrderBy(`h.${column}`, direction);
      }
    } else {
      qb.addOrderBy('h.id', 'DESC');
    }

    if (options?.limit != null) {
      qb.limit(options.limit);
    }

    if (options?.offset != null) {
      qb.offset(options.offset);
    }

    const rows = await qb.getRawMany<RawHotel>();
    return rows.map(row => this.mapRaw(row));
  }

  async paginate(
    filter: HotelFilter,
    page: number,
    pageSize: number,
    order?: Record<string, 'ASC' | 'DESC'>
  ): Promise<Page<Hotel>> {
    const qb = this.baseSelect();
    this.applyFilter(qb, filter);

    if (order) {
      for (const [column, direction] of Object.entries(order)) {
        qb.addOrderBy(`h.${column}`, direction);
      }
    } else {
      qb.addOrderBy('h.id', 'DESC');
    }

    const [rows, total] = await Promise.all([
      qb.clone().limit(pageSize).offset((page - 1) * pageSize).getRawMany<RawHotel>(),
      this.count(filter),
    ]);

    return {
      data: rows.map(row => this.mapRaw(row)),
      total,
      page,
      pageSize,
    };
  }

  async create(payload: Partial<Hotel>): Promise<Hotel> {
    const result = await this.dataSource
      .createQueryBuilder()
      .insert()
      .into('hotels')
      .values({
        owner_user_id: payload.owner_user_id?.toString(),
        name: payload.name!,
        status: (payload.status ?? 'active') as any,
      })
      .execute();

    const insertedId = result.identifiers?.[0]?.id ?? result.raw?.insertId;
    return (await this.findById(BigInt(insertedId)))!;
  }

  async updateById(id: bigint, payload: Partial<Hotel>): Promise<Hotel> {
    await this.dataSource
      .createQueryBuilder()
      .update('hotels')
      .set({
        owner_user_id: payload.owner_user_id ? payload.owner_user_id.toString() : undefined,
        name: payload.name ?? undefined,
        status: (payload.status as any) ?? undefined,
        updated_at: () => 'CURRENT_TIMESTAMP',
      })
      .where('id = :id', { id: id.toString() })
      .execute();

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Hotel not found after update');
    }
    return updated;
  }

  async softDeleteById(id: bigint): Promise<void> {
    await this.dataSource
      .createQueryBuilder()
      .update('hotels')
      .set({ deleted_at: () => 'CURRENT_TIMESTAMP' })
      .where('id = :id', { id: id.toString() })
      .execute();
  }

  async count(filter: HotelFilter): Promise<number> {
    const qb = this.dataSource
      .createQueryBuilder()
      .from('hotels', 'h')
      .select('COUNT(1)', 'count')
      .where('h.deleted_at IS NULL');

    this.applyFilter(qb, filter);

    const row = await qb.getRawOne<{ count: string }>();
    return parseInt(row?.count ?? '0', 10);
  }

  async listByOwner(ownerUserId: bigint, page = 1, pageSize = 20): Promise<Page<Hotel>> {
    return this.paginate({ owner_user_id: ownerUserId }, page, pageSize, { id: 'DESC' });
  }

  async getHotelIdsForUser(userId: bigint): Promise<bigint[]> {
    const ownerRows = await this.dataSource
      .createQueryBuilder()
      .select('h.id', 'id')
      .from('hotels', 'h')
      .where('h.owner_user_id = :userId', { userId: userId.toString() })
      .andWhere('h.deleted_at IS NULL')
      .getRawMany<{ id: string }>();

    const memberRows = await this.dataSource
      .createQueryBuilder()
      .select('hu.hotel_id', 'id')
      .from('hotel_users', 'hu')
      .innerJoin('hotels', 'h', 'h.id = hu.hotel_id AND h.deleted_at IS NULL')
      .where('hu.user_id = :userId', { userId: userId.toString() })
      .andWhere('hu.deleted_at IS NULL')
      .getRawMany<{ id: string }>();

    const unique = new Set<string>();
    ownerRows.forEach(row => unique.add(row.id));
    memberRows.forEach(row => unique.add(row.id));

    return Array.from(unique).map(id => BigInt(id));
  }
}
