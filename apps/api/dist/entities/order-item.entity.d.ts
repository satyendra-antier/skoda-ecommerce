import { Order } from './order.entity';
import { Product } from './product.entity';
export declare class OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    priceAtPurchase: string;
    productName: string;
    productSku: string;
    order: Order;
    product: Product;
}
