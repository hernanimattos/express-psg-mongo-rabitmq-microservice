"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
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
