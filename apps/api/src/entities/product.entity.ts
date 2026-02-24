import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeUpdate,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum ProductStatus {
  Active = 'Active',
  OutOfStock = 'OutOfStock',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  shortDescription: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  category: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  badge: string | null;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'varchar', length: 128, nullable: true })
  collection: string | null;

  @Column({ type: 'simple-json', nullable: true })
  specifications: Record<string, string> | null;

  @Column({ type: 'simple-json', default: '[]' })
  imageUrls: string[];

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: string;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'varchar', length: 20, default: ProductStatus.Active })
  status: ProductStatus;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date();
  }
}
