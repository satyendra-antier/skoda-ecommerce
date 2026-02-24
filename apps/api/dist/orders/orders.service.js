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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const order_entity_1 = require("../entities/order.entity");
const order_item_entity_1 = require("../entities/order-item.entity");
const product_entity_1 = require("../entities/product.entity");
const products_service_1 = require("../products/products.service");
let OrdersService = OrdersService_1 = class OrdersService {
    orderRepo;
    orderItemRepo;
    productsService;
    logger = new common_1.Logger(OrdersService_1.name);
    constructor(orderRepo, orderItemRepo, productsService) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.productsService = productsService;
    }
    generateOrderId() {
        return `SKD-${Date.now()}-${(0, uuid_1.v4)().slice(0, 8)}`;
    }
    async create(dto) {
        const productIds = dto.items.map((i) => i.productId);
        const products = await this.productsService.getByIds(productIds);
        const productMap = new Map(products.map((p) => [p.id, p]));
        const items = [];
        let totalAmount = 0;
        for (const line of dto.items) {
            const product = productMap.get(line.productId);
            if (!product) {
                throw new common_1.BadRequestException(`Product ${line.productId} not found`);
            }
            if (product.status === product_entity_1.ProductStatus.OutOfStock || product.stockQuantity < line.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for ${product.name} (requested ${line.quantity}, available ${product.stockQuantity})`);
            }
            const price = parseFloat(product.price);
            totalAmount += price * line.quantity;
            items.push({ product, quantity: line.quantity });
        }
        const orderId = this.generateOrderId();
        const order = this.orderRepo.create({
            orderId,
            customerName: dto.customerName,
            mobile: dto.mobile,
            email: dto.email,
            shippingAddress: dto.shippingAddress,
            city: dto.city,
            state: dto.state,
            pincode: dto.pincode,
            totalAmount: String(totalAmount.toFixed(2)),
            paymentStatus: order_entity_1.PaymentStatus.Pending,
        });
        await this.orderRepo.save(order);
        for (const { product, quantity } of items) {
            const orderItem = this.orderItemRepo.create({
                orderId: order.id,
                productId: product.id,
                quantity,
                priceAtPurchase: product.price,
                productName: product.name,
                productSku: product.sku,
            });
            await this.orderItemRepo.save(orderItem);
        }
        this.logger.log(`Order created: orderId=${orderId}, totalAmount=${totalAmount}`);
        return { orderId, totalAmount };
    }
    async findByOrderId(orderId) {
        const order = await this.orderRepo.findOne({
            where: { orderId },
            relations: ['items'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
        }
        return order;
    }
    async getByOrderId(orderId) {
        return this.findByOrderId(orderId);
    }
    async updatePaymentStatus(orderId, status) {
        const order = await this.orderRepo.findOne({
            where: { orderId },
            relations: ['items'],
        });
        if (!order)
            return;
        if (order.paymentStatus !== order_entity_1.PaymentStatus.Pending)
            return;
        order.paymentStatus = status;
        await this.orderRepo.save(order);
        this.logger.log(`Payment confirmation: orderId=${orderId}, status=${status}`);
        if (status === order_entity_1.PaymentStatus.Successful) {
            for (const item of order.items) {
                await this.productsService.deductStock(item.productId, item.quantity);
            }
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        products_service_1.ProductsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map