import { OrderItem } from './order-item.entity';
export declare enum ProductStatus {
    Active = "Active",
    OutOfStock = "OutOfStock"
}
export declare class Product {
    id: string;
    sku: string;
    name: string;
    shortDescription: string | null;
    description: string | null;
    category: string | null;
    badge: string | null;
    isFeatured: boolean;
    collection: string | null;
    specifications: Record<string, string> | null;
    imageUrls: string[];
    price: string;
    stockQuantity: number;
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
    orderItems: OrderItem[];
    setUpdatedAt(): void;
}
