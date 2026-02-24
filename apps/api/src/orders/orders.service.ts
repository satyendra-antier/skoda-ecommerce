import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order, PaymentStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product, ProductStatus } from '../entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    private readonly productsService: ProductsService,
  ) {}

  private generateOrderId(): string {
    return `SKD-${Date.now()}-${uuidv4().slice(0, 8)}`;
  }

  async create(dto: CreateOrderDto): Promise<{ orderId: string; totalAmount: number }> {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.productsService.getByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    const items: { product: Product; quantity: number }[] = [];
    let totalAmount = 0;

    for (const line of dto.items) {
      const product = productMap.get(line.productId);
      if (!product) {
        throw new BadRequestException(`Product ${line.productId} not found`);
      }
      if (product.status === ProductStatus.OutOfStock || product.stockQuantity < line.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name} (requested ${line.quantity}, available ${product.stockQuantity})`,
        );
      }
      const price = parseFloat(product.price);
      totalAmount += price * line.quantity;
      items.push({ product, quantity: line.quantity });
    }

    const orderId = this.generateOrderId();
    const order = this.orderRepo.create({
      orderId,
      customerName: dto.customerName,
      mobile: dto.mobile,
      email: dto.email,
      shippingAddress: dto.shippingAddress,
      city: dto.city,
      state: dto.state,
      pincode: dto.pincode,
      totalAmount: String(totalAmount.toFixed(2)),
      paymentStatus: PaymentStatus.Pending,
    });
    await this.orderRepo.save(order);

    for (const { product, quantity } of items) {
      const orderItem = this.orderItemRepo.create({
        orderId: order.id,
        productId: product.id,
        quantity,
        priceAtPurchase: product.price,
        productName: product.name,
        productSku: product.sku,
      });
      await this.orderItemRepo.save(orderItem);
    }

    this.logger.log(`Order created: orderId=${orderId}, totalAmount=${totalAmount}`);
    return { orderId, totalAmount };
  }

  async findByOrderId(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { orderId },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    return order;
  }

  async getByOrderId(orderId: string) {
    return this.findByOrderId(orderId);
  }

  async updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<void> {
    const order = await this.orderRepo.findOne({
      where: { orderId },
      relations: ['items'],
    });
    if (!order) return;
    if (order.paymentStatus !== PaymentStatus.Pending) return;
    order.paymentStatus = status;
    await this.orderRepo.save(order);
    this.logger.log(`Payment confirmation: orderId=${orderId}, status=${status}`);
    if (status === PaymentStatus.Successful) {
      for (const item of order.items) {
        await this.productsService.deductStock(item.productId, item.quantity);
      }
    }
  }
}
