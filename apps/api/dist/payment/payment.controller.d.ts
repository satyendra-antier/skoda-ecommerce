import type { Response } from 'express';
import { PaymentService } from './payment.service';
import { InitPaymentDto } from './dto/init-payment.dto';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    init(dto: InitPaymentDto): Promise<{
        redirectUrl: string;
    }>;
    callbackGet(query: Record<string, string>, res: Response): Promise<void>;
    devSuccess(orderId: string, redirect: string, res: Response): Promise<void>;
    callbackPost(body: Record<string, string>, query: Record<string, string>, res: Response): Promise<void>;
}
