import { OrderItem } from './order-item.entity';
export declare enum PaymentStatus {
    Pending = "Pending",
    Successful = "Successful",
    Failed = "Failed"
}
export declare class Order {
    id: string;
    orderId: string;
    customerName: string;
    mobile: string;
    email: string;
    shippingAddress: string;
    city: string;
    state: string;
    pincode: string;
    totalAmount: string;
    paymentStatus: PaymentStatus;
    fulfilmentStatus: string | null;
    zohoRecordId: string | null;
    createdAt: Date;
    updatedAt: Date;
    items: OrderItem[];
    setUpdatedAt(): void;
}
