import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeUpdate,
  CreateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum PaymentStatus {
  Pending = 'Pending',
  Successful = 'Successful',
  Failed = 'Failed',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderId: string;

  @Column()
  customerName: string;

  @Column()
  mobile: string;

  @Column()
  email: string;

  @Column({ type: 'text' })
  shippingAddress: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  pincode: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: PaymentStatus.Pending,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fulfilmentStatus: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  zohoRecordId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date();
  }
}
