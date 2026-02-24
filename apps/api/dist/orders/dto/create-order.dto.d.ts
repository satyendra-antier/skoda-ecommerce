export declare class CreateOrderItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    customerName: string;
    mobile: string;
    email: string;
    shippingAddress: string;
    city: string;
    state: string;
    pincode: string;
    items: CreateOrderItemDto[];
}
