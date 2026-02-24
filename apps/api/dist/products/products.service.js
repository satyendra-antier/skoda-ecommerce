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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../entities/product.entity");
const events_gateway_1 = require("../events/events.gateway");
let ProductsService = class ProductsService {
    productRepo;
    eventsGateway;
    constructor(productRepo, eventsGateway) {
        this.productRepo = productRepo;
        this.eventsGateway = eventsGateway;
    }
    async create(dto) {
        const existing = await this.findBySku(dto.sku);
        if (existing) {
            throw new common_1.ConflictException(`Product with SKU ${dto.sku} already exists`);
        }
        const product = this.productRepo.create({
            sku: dto.sku,
            name: dto.name,
            shortDescription: dto.shortDescription ?? null,
            description: dto.description ?? null,
            category: dto.category ?? null,
            badge: dto.badge ?? null,
            isFeatured: dto.isFeatured ?? false,
            collection: dto.collection ?? null,
            specifications: dto.specifications ?? null,
            imageUrls: dto.imageUrls ?? [],
            price: String(dto.price),
            stockQuantity: dto.stockQuantity ?? 0,
            status: (dto.stockQuantity ?? 0) > 0 ? product_entity_1.ProductStatus.Active : product_entity_1.ProductStatus.OutOfStock,
        });
        return this.productRepo.save(product);
    }
    async update(id, dto) {
        const product = await this.findOne(id);
        if (dto.name !== undefined)
            product.name = dto.name;
        if (dto.shortDescription !== undefined)
            product.shortDescription = dto.shortDescription;
        if (dto.description !== undefined)
            product.description = dto.description;
        if (dto.category !== undefined)
            product.category = dto.category;
        if (dto.badge !== undefined)
            product.badge = dto.badge;
        if (dto.isFeatured !== undefined)
            product.isFeatured = dto.isFeatured;
        if (dto.collection !== undefined)
            product.collection = dto.collection;
        if (dto.specifications !== undefined)
            product.specifications = dto.specifications;
        if (dto.imageUrls !== undefined)
            product.imageUrls = dto.imageUrls;
        if (dto.price !== undefined)
            product.price = String(dto.price);
        if (dto.stockQuantity !== undefined) {
            product.stockQuantity = dto.stockQuantity;
            product.status = dto.stockQuantity > 0 ? product_entity_1.ProductStatus.Active : product_entity_1.ProductStatus.OutOfStock;
        }
        const saved = await this.productRepo.save(product);
        this.eventsGateway.emitProductUpdated(id);
        return saved;
    }
    async findAll(status) {
        const qb = this.productRepo.createQueryBuilder('p').orderBy('p.name');
        if (status) {
            qb.andWhere('p.status = :status', { status });
        }
        return qb.getMany();
    }
    async findOne(id) {
        const product = await this.productRepo.findOne({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException(`Product ${id} not found`);
        }
        return product;
    }
    async findBySku(sku) {
        return this.productRepo.findOne({ where: { sku } });
    }
    async getByIds(ids) {
        if (ids.length === 0)
            return [];
        return this.productRepo
            .createQueryBuilder('p')
            .where('p.id IN (:...ids)', { ids })
            .getMany();
    }
    async deductStock(productId, quantity) {
        const product = await this.productRepo.findOne({ where: { id: productId } });
        if (!product)
            return;
        product.stockQuantity = Math.max(0, product.stockQuantity - quantity);
        if (product.stockQuantity <= 0) {
            product.status = product_entity_1.ProductStatus.OutOfStock;
        }
        await this.productRepo.save(product);
        this.eventsGateway.emitProductUpdated(productId);
    }
    async remove(id) {
        const product = await this.productRepo.findOne({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException(`Product ${id} not found`);
        }
        await this.productRepo.remove(product);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        events_gateway_1.EventsGateway])
], ProductsService);
//# sourceMappingURL=products.service.js.map