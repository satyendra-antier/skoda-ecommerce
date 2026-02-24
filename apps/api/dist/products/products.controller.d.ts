import { ProductsService } from './products.service';
import { ProductStatus } from '../entities/product.entity';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    list(status?: ProductStatus): Promise<import("../entities/product.entity").Product[]>;
    get(id: string): Promise<import("../entities/product.entity").Product>;
}
