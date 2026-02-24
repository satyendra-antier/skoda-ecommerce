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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../entities/order.entity");
const product_entity_1 = require("../entities/product.entity");
const zoho_service_1 = require("../zoho/zoho.service");
const events_gateway_1 = require("../events/events.gateway");
let AdminService = class AdminService {
    orderRepo;
    productRepo;
    zohoService;
    eventsGateway;
    constructor(orderRepo, productRepo, zohoService, eventsGateway) {
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
        this.zohoService = zohoService;
        this.eventsGateway = eventsGateway;
    }
    async getDashboard() {
        const [pending, successful, failed, productCount, recentOrders, revenueResult] = await Promise.all([
            this.orderRepo.count({ where: { paymentStatus: order_entity_1.PaymentStatus.Pending } }),
            this.orderRepo.count({ where: { paymentStatus: order_entity_1.PaymentStatus.Successful } }),
            this.orderRepo.count({ where: { paymentStatus: order_entity_1.PaymentStatus.Failed } }),
            this.productRepo.count(),
            this.orderRepo
                .createQueryBuilder('o')
                .select(['o.id', 'o.orderId', 'o.customerName', 'o.totalAmount', 'o.paymentStatus', 'o.createdAt'])
                .orderBy('o.createdAt', 'DESC')
                .take(10)
                .getMany(),
            this.orderRepo
                .createQueryBuilder('o')
                .select('SUM(o.totalAmount)', 'total')
                .where('o.paymentStatus = :status', { status: order_entity_1.PaymentStatus.Successful })
                .getRawOne(),
        ]);
        const totalRevenue = revenueResult?.total ?? '0';
        return {
            pending,
            successful,
            failed,
            productCount,
            recentOrders,
            totalRevenue,
        };
    }
    async getOrders(paymentStatus, fulfilmentStatus) {
        const qb = this.orderRepo
            .createQueryBuilder('o')
            .leftJoinAndSelect('o.items', 'items')
            .orderBy('o.createdAt', 'DESC');
        if (paymentStatus) {
            qb.andWhere('o.paymentStatus = :paymentStatus', { paymentStatus });
        }
        if (fulfilmentStatus) {
            qb.andWhere('o.fulfilmentStatus = :fulfilmentStatus', { fulfilmentStatus });
        }
        return qb.getMany();
    }
    async exportOrdersCsv(paymentStatus) {
        const qb = this.orderRepo
            .createQueryBuilder('o')
            .leftJoinAndSelect('o.items', 'items')
            .orderBy('o.createdAt', 'DESC');
        if (paymentStatus) {
            qb.andWhere('o.paymentStatus = :paymentStatus', { paymentStatus });
        }
        const orders = await qb.getMany();
        const headers = [
            'Order ID',
            'Customer',
            'Email',
            'Mobile',
            'Address',
            'City',
            'State',
            'Pincode',
            'Total',
            'Payment Status',
            'Created At',
            'Items',
        ];
        const rows = orders.map((o) => [
            o.orderId,
            o.customerName,
            o.email,
            o.mobile,
            `"${(o.shippingAddress || '').replace(/"/g, '""')}"`,
            o.city,
            o.state,
            o.pincode,
            o.totalAmount,
            o.paymentStatus,
            o.createdAt ? new Date(o.createdAt).toISOString() : '',
            (o.items || [])
                .map((i) => `${i.productName} x${i.quantity}`)
                .join('; '),
        ]);
        const escape = (v) => String(v).includes(',') || String(v).includes('"') || String(v).includes('\n')
            ? `"${String(v).replace(/"/g, '""')}"`
            : String(v);
        return [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
    }
    async getProducts() {
        return this.productRepo.find({ order: { name: 'ASC' } });
    }
    async syncOrderToZoho(orderId) {
        const order = await this.orderRepo.findOne({
            where: { orderId },
            relations: ['items'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order ${orderId} not found`);
        }
        try {
            await this.zohoService.syncOrder(order);
            return { success: true };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Zoho sync failed';
            return { success: false, message };
        }
    }
    async updateProductStock(id, dto) {
        const product = await this.productRepo.findOne({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (dto.stockQuantity !== undefined) {
            product.stockQuantity = dto.stockQuantity;
            if (product.stockQuantity <= 0) {
                product.status = product_entity_1.ProductStatus.OutOfStock;
            }
        }
        if (dto.status !== undefined) {
            product.status = dto.status;
        }
        await this.productRepo.save(product);
        this.eventsGateway.emitProductUpdated(product.id);
        return product;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        zoho_service_1.ZohoService,
        events_gateway_1.EventsGateway])
], AdminService);
//# sourceMappingURL=admin.service.js.map