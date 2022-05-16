import 'reflect-metadata';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mongodb',
  host: 'localhost',
  port: 27017,
  username: 'admin',
  password: '',
  database: 'mongo-microservice',
  entities: ['./dist/src/typeorm/entity/*.js'],

  migrations: ['./dist/src/typeorm/migrations/*.js'],
  logging: true,
  synchronize: true,
  monitorCommands: true,
});
