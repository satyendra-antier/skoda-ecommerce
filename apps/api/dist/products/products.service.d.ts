import { Repository } from 'typeorm';
import { Product, ProductStatus } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { EventsGateway } from '../events/events.gateway';
export declare class ProductsService {
    private readonly productRepo;
    private readonly eventsGateway;
    constructor(productRepo: Repository<Product>, eventsGateway: EventsGateway);
    create(dto: CreateProductDto): Promise<Product>;
    update(id: string, dto: UpdateProductDto): Promise<Product>;
    findAll(status?: ProductStatus): Promise<Product[]>;
    findOne(id: string): Promise<Product>;
    findBySku(sku: string): Promise<Product | null>;
    getByIds(ids: string[]): Promise<Product[]>;
    deductStock(productId: string, quantity: number): Promise<void>;
    remove(id: string): Promise<void>;
}
