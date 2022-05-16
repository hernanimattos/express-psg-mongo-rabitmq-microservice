"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = require("./index");
const amqplib_1 = __importDefault(require("amqplib"));
index_1.AppDataSource.initialize().then(() => __awaiter(void 0, void 0, void 0, function* () {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: '*' }));
    app.use(express_1.default.json());
    const productRepository = index_1.AppDataSource.getMongoRepository('Product');
    const conn = yield amqplib_1.default.connect('amqps://gzdmygkj:xc8e_L1GNeTcWYqyVRux_yXyLz7stV_5@hawk.rmq.cloudamqp.com/gzdmygkj');
    const ch1 = yield conn.createChannel();
    ch1.assertQueue('product_created', { durable: true });
    ch1.assertQueue('product_updated', { durable: true });
    ch1.assertQueue('product_deleted', { durable: true });
    ch1.consume('product_created', (msg) => __awaiter(void 0, void 0, void 0, function* () {
        if (msg !== null) {
            const { id, title, image, likes } = JSON.parse(msg.content.toString());
            const product = productRepository.create({
                admin_id: id,
                title,
                image,
                likes,
            });
            yield productRepository.save(product);
        }
        else {
            console.log('Consumer cancelled by server');
        }
    }), { noAck: false });
    ch1.consume('product_updated', (msg) => __awaiter(void 0, void 0, void 0, function* () {
        if (msg !== null) {
            const { id, title, image, likes } = JSON.parse(msg.content.toString());
            const product = yield productRepository.findOne({
                where: { admin_id: id },
            });
            productRepository.merge(product, {
                title,
                image,
                likes,
            });
            const result = yield productRepository.save(product);
        }
        else {
            console.log('Consumer cancelled by server');
        }
    }), { noAck: false });
    app.listen(8001, () => {
        console.log('Server started ons port 8000');
    });
}));
