import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import { ZohoService } from '../zoho/zoho.service';
export declare class PaymentService {
    private readonly config;
    private readonly ordersService;
    private readonly zohoService;
    private readonly logger;
    constructor(config: ConfigService, ordersService: OrdersService, zohoService: ZohoService);
    init(orderId: string): Promise<{
        redirectUrl: string;
    }>;
    handleCallback(query: Record<string, string>): Promise<{
        redirectUrl: string;
    }>;
    markOrderSuccess(orderId: string): Promise<void>;
}
