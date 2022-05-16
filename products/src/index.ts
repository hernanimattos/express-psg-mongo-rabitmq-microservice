import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'postgres',
  entities: ['./dist/src/typeorm/entity/*.js'],
  migrations: ['./dist/src/typeorm/migrations/*.js'],
  logging: true,
  synchronize: true,
});
