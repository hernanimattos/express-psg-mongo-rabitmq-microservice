import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity({ name: 'product' })
export class Product {
  @ObjectIdColumn()
  id: string;

  @Column()
  admin_id: string;

  @Column()
  title: string;

  @Column()
  image: string;

  @Column({ default: 1 })
  likes: number;
}
