import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderDto): Promise<{
        orderId: string;
        totalAmount: number;
    }>;
    get(orderId: string): Promise<import("../entities/order.entity").Order>;
}
