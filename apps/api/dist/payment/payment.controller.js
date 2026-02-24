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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const init_payment_dto_1 = require("./dto/init-payment.dto");
let PaymentController = class PaymentController {
    paymentService;
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async init(dto) {
        return this.paymentService.init(dto.orderId);
    }
    async callbackGet(query, res) {
        const { redirectUrl } = await this.paymentService.handleCallback(query);
        return res.redirect(302, redirectUrl);
    }
    async devSuccess(orderId, redirect, res) {
        if (orderId) {
            await this.paymentService.markOrderSuccess(orderId);
        }
        const url = redirect || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/confirmation?orderId=${orderId}&status=success`;
        return res.redirect(302, url);
    }
    async callbackPost(body, query, res) {
        const params = { ...query, ...body };
        const { redirectUrl } = await this.paymentService.handleCallback(params);
        return res.redirect(302, redirectUrl);
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('init'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [init_payment_dto_1.InitPaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "init", null);
__decorate([
    (0, common_1.Get)('callback'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "callbackGet", null);
__decorate([
    (0, common_1.Get)('success'),
    __param(0, (0, common_1.Query)('orderId')),
    __param(1, (0, common_1.Query)('redirect')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "devSuccess", null);
__decorate([
    (0, common_1.Post)('callback'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "callbackPost", null);
exports.PaymentController = PaymentController = __decorate([
    (0, common_1.Controller)('payment'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map