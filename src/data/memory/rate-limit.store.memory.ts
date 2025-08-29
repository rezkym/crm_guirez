/**
 * In-memory implementation RateLimitStore
 */

import { RateLimitStore, RateLimitRecord } from '../../domain/auth';

export class MemoryRateLimitStore implements RateLimitStore {
  private records: Map<string, RateLimitRecord> = new Map();

  async recordAttempt(key: string, success: boolean): Promise<void> {
    const now = new Date();
    const existing = this.records.get(key);

    if (existing) {
      // Jika success, reset attempts
      if (success) {
        existing.attempts = 0;
        existing.lastAttempt = now;
        existing.blockedUntil = undefined;
      } else {
        existing.attempts += 1;
        existing.lastAttempt = now;
      }
      
      this.records.set(key, existing);
    } else {
      // Record baru
      const record: RateLimitRecord = {
        key,
        attempts: success ? 0 : 1,
        lastAttempt: now
      };
      
      this.records.set(key, record);
    }
  }

  async isBlocked(key: string): Promise<boolean> {
    const record = this.records.get(key);
    
    if (!record || !record.blockedUntil) {
      return false;
    }

    // Check if block period has expired
    if (record.blockedUntil < new Date()) {
      record.blockedUntil = undefined;
      record.attempts = 0; // Reset attempts after block expires
      this.records.set(key, record);
      return false;
    }

    return true;
  }

  async getAttemptCount(key: string): Promise<number> {
    const record = this.records.get(key);
    return record ? record.attempts : 0;
  }

  async blockKey(key: string, durationMs: number): Promise<void> {
    const now = new Date();
    const blockedUntil = new Date(now.getTime() + durationMs);
    
    const existing = this.records.get(key);
    
    if (existing) {
      existing.blockedUntil = blockedUntil;
      this.records.set(key, existing);
    } else {
      const record: RateLimitRecord = {
        key,
        attempts: 0,
        lastAttempt: now,
        blockedUntil
      };
      
      this.records.set(key, record);
    }
  }

  async resetAttempts(key: string): Promise<void> {
    const record = this.records.get(key);
    
    if (record) {
      record.attempts = 0;
      record.blockedUntil = undefined;
      record.lastAttempt = new Date();
      this.records.set(key, record);
    }
  }

  async cleanupExpired(): Promise<number> {
    const now = new Date();
    let cleanedCount = 0;

    for (const [key, record] of this.records.entries()) {
      // Remove records yang sudah lama tidak digunakan (> 24 jam)
      const hoursSinceLastAttempt = (now.getTime() - record.lastAttempt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastAttempt > 24) {
        this.records.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  // Methods tambahan untuk debugging/monitoring
  getActiveRecordCount(): number {
    return this.records.size;
  }

  getBlockedKeys(): string[] {
    const now = new Date();
    const blockedKeys: string[] = [];

    for (const [key, record] of this.records.entries()) {
      if (record.blockedUntil && record.blockedUntil > now) {
        blockedKeys.push(key);
      }
    }

    return blockedKeys;
  }

  getAllRecordsForDebug(): RateLimitRecord[] {
    return Array.from(this.records.values());
  }
}
