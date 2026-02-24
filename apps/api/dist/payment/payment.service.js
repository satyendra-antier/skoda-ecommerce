"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const config_1 = require("@nestjs/config");
const orders_service_1 = require("../orders/orders.service");
const zoho_service_1 = require("../zoho/zoho.service");
const order_entity_1 = require("../entities/order.entity");
const BILLDESK_REQUEST_URL = process.env.BILLDESK_REQUEST_URL ||
    'https://pgi.billdesk.com/pgidsk/PGIMerchantRequest';
let PaymentService = PaymentService_1 = class PaymentService {
    config;
    ordersService;
    zohoService;
    logger = new common_1.Logger(PaymentService_1.name);
    constructor(config, ordersService, zohoService) {
        this.config = config;
        this.ordersService = ordersService;
        this.zohoService = zohoService;
    }
    async init(orderId) {
        const order = await this.ordersService.findByOrderId(orderId);
        if (order.paymentStatus !== order_entity_1.PaymentStatus.Pending) {
            throw new common_1.BadRequestException('Order already processed');
        }
        const merchantId = this.config.get('BILLDESK_MERCHANT_ID');
        const secretKey = this.config.get('BILLDESK_SECRET_KEY');
        const returnUrl = this.config.get('BILLDESK_RETURN_URL');
        const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
        if (!merchantId || !secretKey || !returnUrl) {
            const apiBase = this.config.get('API_BASE_URL') || 'http://localhost:3001';
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
        const hash = (0, crypto_1.createHash)('sha256').update(secretKey + '|' + dataString).digest('hex');
        const msg = Buffer.from(dataString + '|' + hash, 'utf-8').toString('base64');
        const redirectUrl = `${BILLDESK_REQUEST_URL}?msg=${encodeURIComponent(msg)}`;
        return { redirectUrl };
    }
    async handleCallback(query) {
        const orderId = query.orderid || query.OrderId || query.ORDERID;
        const status = (query.status || query.Status || query.trnstatus || '').toLowerCase();
        const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
        const successRedirect = `${frontendUrl}/order/confirmation?orderId=${orderId}&status=success`;
        const failRedirect = `${frontendUrl}/order/confirmation?orderId=${orderId}&status=failed`;
        if (!orderId) {
            return { redirectUrl: `${frontendUrl}/order/confirmation?error=missing_order` };
        }
        const secretKey = this.config.get('BILLDESK_SECRET_KEY');
        if (secretKey && query.checksum) {
            const expectedChecksum = (0, crypto_1.createHash)('sha256')
                .update(secretKey + '|' + (query.msg || query.response))
                .digest('hex');
            if (expectedChecksum.toLowerCase() !== (query.checksum || '').toLowerCase()) {
                return { redirectUrl: failRedirect };
            }
        }
        const isSuccess = status === 'success' ||
            status === '0300' ||
            query.result === 'success' ||
            query.TxnStatus === '0300';
        this.logger.log(`Payment callback: orderId=${orderId}, result=${isSuccess ? 'success' : 'failed'}`);
        await this.ordersService.updatePaymentStatus(orderId, isSuccess ? order_entity_1.PaymentStatus.Successful : order_entity_1.PaymentStatus.Failed);
        if (isSuccess) {
            const order = await this.ordersService.findByOrderId(orderId);
            this.zohoService.syncOrder(order).catch(() => { });
        }
        return { redirectUrl: isSuccess ? successRedirect : failRedirect };
    }
    async markOrderSuccess(orderId) {
        await this.ordersService.updatePaymentStatus(orderId, order_entity_1.PaymentStatus.Successful);
        const order = await this.ordersService.findByOrderId(orderId);
        this.zohoService.syncOrder(order).catch(() => { });
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        orders_service_1.OrdersService,
        zoho_service_1.ZohoService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map