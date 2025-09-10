/**
 * Password security utilities using bcrypt
 */

import * as bcrypt from 'bcrypt';

export interface PasswordConfig {
  // bcrypt configuration
  bcryptRounds: number;
}

export class PasswordService {
  private config: PasswordConfig;

  constructor(config: PasswordConfig) {
    this.config = config;
  }


  /**
   * Hash password menggunakan bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.config.bcryptRounds);
  }

  /**
   * Verify password dengan bcrypt hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return bcrypt.compare(password, hash);
    } catch (error) {
      return false;
    }
  }


  /**
   * Generate hash untuk password baru (menggunakan bcrypt)
   */
  async createPasswordHash(password: string): Promise<string> {
    return this.hashPassword(password);
  }
}

// Default configuration
export const defaultPasswordConfig: PasswordConfig = {
  // bcrypt configuration
  bcryptRounds: 12
};
