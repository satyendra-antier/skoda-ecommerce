import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
export declare class ZohoService {
    private readonly config;
    private readonly orderRepo;
    private readonly logger;
    constructor(config: ConfigService, orderRepo: Repository<Order>);
    syncOrder(order: Order): Promise<void>;
    private getAccessToken;
    private createRecord;
    private updateRecord;
    private findByOrderId;
}
