import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, PaymentStatus } from '../entities/order.entity';
import { Product, ProductStatus } from '../entities/product.entity';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ZohoService } from '../zoho/zoho.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly zohoService: ZohoService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async getDashboard(): Promise<{
    pending: number;
    successful: number;
    failed: number;
    productCount: number;
    recentOrders: Array<{
      id: string;
      orderId: string;
      customerName: string;
      totalAmount: string;
      paymentStatus: string;
      createdAt: Date;
    }>;
    totalRevenue: string;
  }> {
    const [pending, successful, failed, productCount, recentOrders, revenueResult] = await Promise.all([
      this.orderRepo.count({ where: { paymentStatus: PaymentStatus.Pending } }),
      this.orderRepo.count({ where: { paymentStatus: PaymentStatus.Successful } }),
      this.orderRepo.count({ where: { paymentStatus: PaymentStatus.Failed } }),
      this.productRepo.count(),
      this.orderRepo
        .createQueryBuilder('o')
        .select(['o.id', 'o.orderId', 'o.customerName', 'o.totalAmount', 'o.paymentStatus', 'o.createdAt'])
        .orderBy('o.createdAt', 'DESC')
        .take(10)
        .getMany(),
      this.orderRepo
        .createQueryBuilder('o')
        .select('SUM(o.totalAmount)', 'total')
        .where('o.paymentStatus = :status', { status: PaymentStatus.Successful })
        .getRawOne<{ total: string | null }>(),
    ]);
    const totalRevenue = revenueResult?.total ?? '0';
    return {
      pending,
      successful,
      failed,
      productCount,
      recentOrders,
      totalRevenue,
    };
  }

  async getOrders(paymentStatus?: PaymentStatus, fulfilmentStatus?: string) {
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'items')
      .orderBy('o.createdAt', 'DESC');
    if (paymentStatus) {
      qb.andWhere('o.paymentStatus = :paymentStatus', { paymentStatus });
    }
    if (fulfilmentStatus) {
      qb.andWhere('o.fulfilmentStatus = :fulfilmentStatus', { fulfilmentStatus });
    }
    return qb.getMany();
  }

  async exportOrdersCsv(paymentStatus?: string): Promise<string> {
    const qb = this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.items', 'items')
      .orderBy('o.createdAt', 'DESC');
    if (paymentStatus) {
      qb.andWhere('o.paymentStatus = :paymentStatus', { paymentStatus });
    }
    const orders = await qb.getMany();
    const headers = [
      'Order ID',
      'Customer',
      'Email',
      'Mobile',
      'Address',
      'City',
      'State',
      'Pincode',
      'Total',
      'Payment Status',
      'Created At',
      'Items',
    ];
    const rows = orders.map((o) => [
      o.orderId,
      o.customerName,
      o.email,
      o.mobile,
      `"${(o.shippingAddress || '').replace(/"/g, '""')}"`,
      o.city,
      o.state,
      o.pincode,
      o.totalAmount,
      o.paymentStatus,
      o.createdAt ? new Date(o.createdAt).toISOString() : '',
      (o.items || [])
        .map((i: { productName: string; quantity: number }) => `${i.productName} x${i.quantity}`)
        .join('; '),
    ]);
    const escape = (v: string | number) =>
      String(v).includes(',') || String(v).includes('"') || String(v).includes('\n')
        ? `"${String(v).replace(/"/g, '""')}"`
        : String(v);
    return [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
  }

  async getProducts(): Promise<Product[]> {
    return this.productRepo.find({ order: { name: 'ASC' } });
  }

  async syncOrderToZoho(orderId: string): Promise<{ success: boolean; message?: string }> {
    const order = await this.orderRepo.findOne({
      where: { orderId },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    try {
      await this.zohoService.syncOrder(order);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Zoho sync failed';
      return { success: false, message };
    }
  }

  async updateProductStock(id: string, dto: UpdateStockDto): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    if (dto.stockQuantity !== undefined) {
      product.stockQuantity = dto.stockQuantity;
      if (product.stockQuantity <= 0) {
        product.status = ProductStatus.OutOfStock;
      }
    }
    if (dto.status !== undefined) {
      product.status = dto.status;
    }
    await this.productRepo.save(product);
    this.eventsGateway.emitProductUpdated(product.id);
    return product;
  }
}
