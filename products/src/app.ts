import express, { Request, Response } from 'express';
import cors from 'cors';
import { AppDataSource } from './index';
import ampq from 'amqplib';

AppDataSource.initialize().then(async () => {
  const productRepository = AppDataSource.getRepository('Product');
  const app = express();

  app.use(cors({ origin: '*' }));

  app.use(express.json());

  const queue = 'tasks';
  const conn = await ampq.connect(
    'amqps://gzdmygkj:xc8e_L1GNeTcWYqyVRux_yXyLz7stV_5@hawk.rmq.cloudamqp.com/gzdmygkj'
  );
  const ch1 = await conn.createChannel();

  app.get('/products', async (req: Request, res: Response) => {
    const products = await productRepository.find();

    res.status(200).json(products);
  });
  app.get('/products/:id', async (req: Request, res: Response) => {
    const { id }: any = req.params;

    const result = await productRepository.findOne({ where: { id } });
    res.status(200).json(result);
  });

  app.post('/products', async (req: Request, res: Response) => {
    const { title, image, likes } = req.body;
    const product = productRepository.create({ title, image, likes });
    const result = await productRepository.save(product);

    ch1.sendToQueue('product_created', Buffer.from(JSON.stringify(result)));

    res.status(200).json(result);
  });

  app.put('/products/:id', async (req: Request, res: Response) => {
    const { id }: any = req.params;
    const { title, image, likes } = req.body;
    const product = await productRepository.findOne({ where: { id } });

    console.log(product);
    productRepository.merge(product, {
      title,
      image,
      likes,
    });
    const result = await productRepository.save(product);
    ch1.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)));

    res.status(200).json(result);
  });
  app.delete('/products', async (req: Request, res: Response) => {
    const { id }: any = req.params;

    const result = await productRepository.delete({ where: { id } });
    ch1.sendToQueue('product_deleted', Buffer.from(JSON.stringify(id)));

    res.status(200).json(result);
  });
  app.post('/products/:id/like', async (req: Request, res: Response) => {
    const { id }: any = req.params;

    const product: any = await productRepository.findOne({ where: { id } });
    product.likes++;
    const result = await productRepository.save(product);

    res.status(200).json(result);
  });

  app.listen(8000, () => {
    console.log('Server started ons port 8000');
  });
});
