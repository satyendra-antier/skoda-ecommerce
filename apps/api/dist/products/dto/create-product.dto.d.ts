export declare class CreateProductDto {
    sku: string;
    name: string;
    shortDescription?: string;
    description?: string;
    category?: string;
    badge?: string;
    isFeatured?: boolean;
    collection?: string | null;
    specifications?: Record<string, string>;
    imageUrls?: string[];
    price: number;
    stockQuantity: number;
}
