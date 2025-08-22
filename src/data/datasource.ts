// src/data/datasource.ts

import { dbConfig } from '../config';

export type DataSourceConfig = {
  type: 'mysql';
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  logging?: boolean;
};

export const dataSourceConfig: DataSourceConfig = {
  type: 'mysql',
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.name,
  logging: process.env.DB_LOGGING === '1',
};

// Placeholder adapter untuk disejajarkan dengan ORM nanti
export interface RepositoryAdapter<T = unknown> {}

export interface IDataSource {
  isInitialized: boolean;
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  getRepository<T = unknown>(name: string): RepositoryAdapter<T>;
}

class NoopDataSource implements IDataSource {
  isInitialized = false;

  async initialize() { this.isInitialized = true; }

  async destroy() { this.isInitialized = false; }

  getRepository<T>(_name: string): RepositoryAdapter<T> {
    return {} as RepositoryAdapter<T>;
  }
}

export const dataSource: IDataSource = new NoopDataSource();