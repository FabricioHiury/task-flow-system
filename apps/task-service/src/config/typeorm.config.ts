import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Carrega as variáveis de ambiente
config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://taskflow:taskflow123@localhost:5432/taskflow',
  entities: [path.join(__dirname, '/../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '/../migrations/*{.ts,.js}')],
  synchronize: false, // Sempre false para migrations
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});