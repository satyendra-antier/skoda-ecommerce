import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import { ZohoService } from '../zoho/zoho.service';
import { PaymentStatus } from '../entities/order.entity';

const BILLDESK_REQUEST_URL =
  process.env.BILLDESK_REQUEST_URL ||
  'https://pgi.billdesk.com/pgidsk/PGIMerchantRequest';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly ordersService: OrdersService,
    private readonly zohoService: ZohoService,
  ) {}

  async init(orderId: string): Promise<{ redirectUrl: string }> {
    const order = await this.ordersService.findByOrderId(orderId);
    if (order.paymentStatus !== PaymentStatus.Pending) {
      throw new BadRequestException('Order already processed');
    }
    const merchantId = this.config.get<string>('BILLDESK_MERCHANT_ID');
    const secretKey = this.config.get<string>('BILLDESK_SECRET_KEY');
    const returnUrl = this.config.get<string>('BILLDESK_RETURN_URL');
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    if (!merchantId || !secretKey || !returnUrl) {
      const apiBase = this.config.get<string>('API_BASE_URL') || 'http://localhost:3001';
      return {
        redirectUrl: `${apiBase}/payment/success?orderId=${orderId}&redirect=${encodeURIComponent(`${frontendUrl}/order/confirmation?orderId=${orderId}&status=success`)}`,
      };
    }

    const amount = parseFloat(order.totalAmount).toFixed(2);
    const currency = 'INR';
    const dataString = [
      merchantId,
      orderId,
      'NA',
      amount,
      currency,
      'NA',
      'NA',
      'F',
      'NA',
      'NA',
      'NA',
      'NA',
      'NA',
      'NA',
      'NA',
      'NA',
      returnUrl,
    ].join('|');
    const hash = createHash('sha256').update(secretKey + '|' + dataString).digest('hex');
    const msg = Buffer.from(dataString + '|' + hash, 'utf-8').toString('base64');
    const redirectUrl = `${BILLDESK_REQUEST_URL}?msg=${encodeURIComponent(msg)}`;
    return { redirectUrl };
  }

  async handleCallback(query: Record<string, string>): Promise<{ redirectUrl: string }> {
    const orderId = query.orderid || query.OrderId || query.ORDERID;
    const status = (query.status || query.Status || query.trnstatus || '').toLowerCase();
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const successRedirect = `${frontendUrl}/order/confirmation?orderId=${orderId}&status=success`;
    const failRedirect = `${frontendUrl}/order/confirmation?orderId=${orderId}&status=failed`;

    if (!orderId) {
      return { redirectUrl: `${frontendUrl}/order/confirmation?error=missing_order` };
    }

    const secretKey = this.config.get<string>('BILLDESK_SECRET_KEY');
    if (secretKey && query.checksum) {
      const expectedChecksum = createHash('sha256')
        .update(secretKey + '|' + (query.msg || query.response))
        .digest('hex');
      if (expectedChecksum.toLowerCase() !== (query.checksum || '').toLowerCase()) {
        return { redirectUrl: failRedirect };
      }
    }

    const isSuccess =
      status === 'success' ||
      status === '0300' ||
      query.result === 'success' ||
      query.TxnStatus === '0300';

    this.logger.log(`Payment callback: orderId=${orderId}, result=${isSuccess ? 'success' : 'failed'}`);
    await this.ordersService.updatePaymentStatus(orderId, isSuccess ? PaymentStatus.Successful : PaymentStatus.Failed);
    if (isSuccess) {
      const order = await this.ordersService.findByOrderId(orderId);
      this.zohoService.syncOrder(order).catch(() => {});
    }
    return { redirectUrl: isSuccess ? successRedirect : failRedirect };
  }

  async markOrderSuccess(orderId: string): Promise<void> {
    await this.ordersService.updatePaymentStatus(orderId, PaymentStatus.Successful);
    const order = await this.ordersService.findByOrderId(orderId);
    this.zohoService.syncOrder(order).catch(() => {});
  }
}
