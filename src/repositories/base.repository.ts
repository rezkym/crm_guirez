/**
 * Kontrak dasar Repository (pola Repository–Service).
 * Implementasi spesifik (mis. TypeORM) akan ditambahkan kemudian.
 * T tidak diasumsikan sebagai bentuk entity tertentu karena ERD belum tersedia.
 */
export interface BaseRepository<T, K = string | number> {
  findById(id: K): Promise<T | null>;
  findAll?(params?: Record<string, unknown>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: K, data: Partial<T>): Promise<T>;
  delete(id: K): Promise<void>;
}