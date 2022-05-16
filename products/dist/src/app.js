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
    const productRepository = index_1.AppDataSource.getRepository('Product');
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: '*' }));
    app.use(express_1.default.json());
    const queue = 'tasks';
    const conn = yield amqplib_1.default.connect('amqps://gzdmygkj:xc8e_L1GNeTcWYqyVRux_yXyLz7stV_5@hawk.rmq.cloudamqp.com/gzdmygkj');
    const ch1 = yield conn.createChannel();
    app.get('/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const products = yield productRepository.find();
        res.status(200).json(products);
    }));
    app.get('/products/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const result = yield productRepository.findOne({ where: { id } });
        res.status(200).json(result);
    }));
    app.post('/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { title, image, likes } = req.body;
        const product = productRepository.create({ title, image, likes });
        const result = yield productRepository.save(product);
        ch1.sendToQueue('product_created', Buffer.from(JSON.stringify(result)));
        res.status(200).json(result);
    }));
    app.put('/products/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { title, image, likes } = req.body;
        const product = yield productRepository.findOne({ where: { id } });
        console.log(product);
        productRepository.merge(product, {
            title,
            image,
            likes,
        });
        const result = yield productRepository.save(product);
        ch1.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)));
        res.status(200).json(result);
    }));
    app.delete('/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const result = yield productRepository.delete({ where: { id } });
        ch1.sendToQueue('product_deleted', Buffer.from(JSON.stringify(id)));
        res.status(200).json(result);
    }));
    app.post('/products/:id/like', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const product = yield productRepository.findOne({ where: { id } });
        product.likes++;
        const result = yield productRepository.save(product);
        res.status(200).json(result);
    }));
    app.listen(8000, () => {
        console.log('Server started ons port 8000');
    });
}));
