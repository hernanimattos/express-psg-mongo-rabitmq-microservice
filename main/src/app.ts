import express, { Request, Response } from 'express';
import cors from 'cors';
import { AppDataSource } from './index';
import ampq from 'amqplib';

AppDataSource.initialize().then(async () => {
  const app = express();
  app.use(cors({ origin: '*' }));
  app.use(express.json());

  const productRepository = AppDataSource.getMongoRepository('Product');

  const conn = await ampq.connect(
    'amqps://gzdmygkj:xc8e_L1GNeTcWYqyVRux_yXyLz7stV_5@hawk.rmq.cloudamqp.com/gzdmygkj'
  );
  const ch1 = await conn.createChannel();

  ch1.assertQueue('product_created', { durable: true });
  ch1.assertQueue('product_updated', { durable: true });
  ch1.assertQueue('product_deleted', { durable: true });

  ch1.consume(
    'product_created',
    async (msg) => {
      if (msg !== null) {
        const { id, title, image, likes } = JSON.parse(msg.content.toString());

        const product = productRepository.create({
          admin_id: id,
          title,
          image,
          likes,
        });

        await productRepository.save(product);
      } else {
        console.log('Consumer cancelled by server');
      }
    },
    { noAck: false }
  );
  ch1.consume(
    'product_updated',
    async (msg) => {
      if (msg !== null) {
        const { id, title, image, likes } = JSON.parse(msg.content.toString());

        const product = await productRepository.findOne({
          where: { admin_id: id },
        });
        productRepository.merge(product, {
          title,
          image,
          likes,
        });
        const result = await productRepository.save(product);
      } else {
        console.log('Consumer cancelled by server');
      }
    },
    { noAck: false }
  );

  app.listen(8001, () => {
    console.log('Server started ons port 8000');
  });
});
