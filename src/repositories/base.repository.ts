/**
 * Kontrak dasar Repository (pola Repository–Service).
 * Implementasi spesifik (mis. TypeORM) akan ditambahkan kemudian.
 * T tidak diasumsikan sebagai bentuk entity tertentu karena ERD belum tersedia.
 */

export type Page<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export interface BaseRepository<T, F = Partial<T>> {
  findById(id: bigint): Promise<T | null>;
  findOne(filter: F): Promise<T | null>;
  findMany(filter: F, options?: { limit?: number; offset?: number; order?: Record<string, 'ASC' | 'DESC'> }): Promise<T[]>;
  paginate(filter: F, page: number, pageSize: number, order?: Record<string, 'ASC' | 'DESC'>): Promise<Page<T>>;
  create(payload: Partial<T>): Promise<T>;
  updateById(id: bigint, payload: Partial<T>): Promise<T>;
  softDeleteById(id: bigint): Promise<void>;
  count(filter: F): Promise<number>;
  
  // Legacy methods for backward compatibility
  findAll?(params?: Record<string, unknown>): Promise<T[]>;
  update?(id: string | number, data: Partial<T>): Promise<T>;
  delete?(id: string | number): Promise<void>;
}