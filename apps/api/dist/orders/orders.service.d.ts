import { Repository } from 'typeorm';
import { Order, PaymentStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';
export declare class OrdersService {
    private readonly orderRepo;
    private readonly orderItemRepo;
    private readonly productsService;
    private readonly logger;
    constructor(orderRepo: Repository<Order>, orderItemRepo: Repository<OrderItem>, productsService: ProductsService);
    private generateOrderId;
    create(dto: CreateOrderDto): Promise<{
        orderId: string;
        totalAmount: number;
    }>;
    findByOrderId(orderId: string): Promise<Order>;
    getByOrderId(orderId: string): Promise<Order>;
    updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<void>;
}
