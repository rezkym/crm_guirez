/**
 * Password security utilities menggunakan PBKDF2
 */

import { randomBytes, pbkdf2 } from 'crypto';
import { promisify } from 'util';

const pbkdf2Async = promisify(pbkdf2);

export interface PasswordConfig {
  iterations: number;
  keyLength: number;
  algorithm: string;
  saltLength: number;
}

export class PasswordService {
  private config: PasswordConfig;

  constructor(config: PasswordConfig) {
    this.config = config;
  }

  /**
   * Generate salt random untuk password
   */
  async generateSalt(): Promise<string> {
    const salt = randomBytes(this.config.saltLength);
    return salt.toString('base64');
  }

  /**
   * Hash password menggunakan PBKDF2
   */
  async hashPassword(password: string, salt: string): Promise<string> {
    const saltBuffer = Buffer.from(salt, 'base64');
    const derivedKey = await pbkdf2Async(
      password,
      saltBuffer,
      this.config.iterations,
      this.config.keyLength,
      this.config.algorithm
    );
    return derivedKey.toString('base64');
  }

  /**
   * Verify password dengan hash yang tersimpan
   */
  async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    try {
      const computedHash = await this.hashPassword(password, salt);
      return computedHash === hash;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate hash dan salt sekaligus untuk password baru
   */
  async createPasswordHash(password: string): Promise<{ hash: string; salt: string }> {
    const salt = await this.generateSalt();
    const hash = await this.hashPassword(password, salt);
    return { hash, salt };
  }
}

// Default configuration
export const defaultPasswordConfig: PasswordConfig = {
  iterations: 210000,
  keyLength: 32,
  algorithm: 'sha256',
  saltLength: 16
};
