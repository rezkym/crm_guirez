// src/config/database.ts

export type DatabaseConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
};

export const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  name: process.env.DB_NAME ?? 'app_db',
};