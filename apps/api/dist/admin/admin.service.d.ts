import { Repository } from 'typeorm';
import { Order, PaymentStatus } from '../entities/order.entity';
import { Product } from '../entities/product.entity';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ZohoService } from '../zoho/zoho.service';
import { EventsGateway } from '../events/events.gateway';
export declare class AdminService {
    private readonly orderRepo;
    private readonly productRepo;
    private readonly zohoService;
    private readonly eventsGateway;
    constructor(orderRepo: Repository<Order>, productRepo: Repository<Product>, zohoService: ZohoService, eventsGateway: EventsGateway);
    getDashboard(): Promise<{
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
    }>;
    getOrders(paymentStatus?: PaymentStatus, fulfilmentStatus?: string): Promise<Order[]>;
    exportOrdersCsv(paymentStatus?: string): Promise<string>;
    getProducts(): Promise<Product[]>;
    syncOrderToZoho(orderId: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    updateProductStock(id: string, dto: UpdateStockDto): Promise<Product>;
}
