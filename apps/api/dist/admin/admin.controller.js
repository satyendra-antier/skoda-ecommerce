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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const admin_auth_guard_1 = require("./admin-auth.guard");
const login_dto_1 = require("./dto/login.dto");
const update_stock_dto_1 = require("./dto/update-stock.dto");
const admin_service_1 = require("./admin.service");
const order_entity_1 = require("../entities/order.entity");
const storage_service_1 = require("../storage/storage.service");
const products_service_1 = require("../products/products.service");
const create_product_dto_1 = require("../products/dto/create-product.dto");
const update_product_dto_1 = require("../products/dto/update-product.dto");
let AdminController = class AdminController {
    config;
    jwtService;
    adminService;
    storageService;
    productsService;
    constructor(config, jwtService, adminService, storageService, productsService) {
        this.config = config;
        this.jwtService = jwtService;
        this.adminService = adminService;
        this.storageService = storageService;
        this.productsService = productsService;
    }
    async login(dto) {
        const username = this.config.get('ADMIN_USERNAME') || 'admin';
        const password = this.config.get('ADMIN_PASSWORD') || 'admin';
        if (dto.username !== username || dto.password !== password) {
            return { success: false, message: 'Invalid credentials' };
        }
        const token = this.jwtService.sign({ sub: 'admin' }, { expiresIn: '24h', secret: this.config.get('JWT_SECRET') || 'skoda-admin-secret' });
        return { success: true, token };
    }
    async dashboard() {
        return this.adminService.getDashboard();
    }
    async orders(paymentStatus, fulfilmentStatus) {
        return this.adminService.getOrders(paymentStatus, fulfilmentStatus);
    }
    async syncOrderZoho(orderId) {
        return this.adminService.syncOrderToZoho(orderId);
    }
    async exportOrders(paymentStatus, res) {
        const csv = await this.adminService.exportOrdersCsv(paymentStatus);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
        return res.send(csv);
    }
    async products() {
        return this.adminService.getProducts();
    }
    async getProduct(id) {
        return this.productsService.findOne(id);
    }
    async deleteProduct(id) {
        await this.productsService.remove(id);
        return { success: true };
    }
    async updateProduct(id, dto) {
        return this.productsService.update(id, dto);
    }
    async updateStock(id, dto) {
        return this.adminService.updateProductStock(id, dto);
    }
    async upload(files) {
        if (!files?.length) {
            return { urls: [] };
        }
        if (!this.storageService.isConfigured()) {
            throw new Error('File storage (MinIO) is not configured. Set MINIO_ACCESS_KEY and MINIO_SECRET_KEY.');
        }
        const urls = [];
        for (const file of files) {
            const url = await this.storageService.uploadBuffer(file.buffer, file.originalname || 'image');
            urls.push(url);
        }
        return { urls };
    }
    async createProduct(dto) {
        return this.productsService.create(dto);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.AdminLoginDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "dashboard", null);
__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Get)('orders'),
    __param(0, (0, common_1.Query)('paymentStatus')),
    __param(1, (0, common_1.Query)('fulfilmentStatus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "orders", null);
__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)('orders/:orderId/sync-zoho'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "syncOrderZoho", null);
__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Get)('orders/export'),
    __param(0, (0, common_1.Query)('paymentStatus')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportOrders", null);
__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Get)('products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "products", null);
__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Get)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getProduct", null);
__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Delete)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Patch)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Patch)('products/:id/stock'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_stock_dto_1.UpdateStockDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateStock", null);
__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "upload", null);
__decorate([
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)('products'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createProduct", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        jwt_1.JwtService,
        admin_service_1.AdminService,
        storage_service_1.StorageService,
        products_service_1.ProductsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map