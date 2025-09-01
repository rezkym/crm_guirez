import { DataSource } from 'typeorm';
import 'dotenv/config';
import { AuthSessionEntity, AuthTokenEntity } from '../models';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'mindi_crm',
  synchronize: false, // Jangan gunakan synchronize di production
  logging: process.env.DB_LOGGING === '1',
  entities: [
    AuthSessionEntity,
    AuthTokenEntity
  ], // Auth entities untuk runtime recognition
  migrations: ['src/db/migrations/*.ts'],
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
});

export default AppDataSource;
