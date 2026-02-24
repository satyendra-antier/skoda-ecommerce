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
var ZohoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../entities/order.entity");
let ZohoService = ZohoService_1 = class ZohoService {
    config;
    orderRepo;
    logger = new common_1.Logger(ZohoService_1.name);
    constructor(config, orderRepo) {
        this.config = config;
        this.orderRepo = orderRepo;
    }
    async syncOrder(order) {
        const clientId = this.config.get('ZOHO_CLIENT_ID');
        const clientSecret = this.config.get('ZOHO_CLIENT_SECRET');
        const refreshToken = this.config.get('ZOHO_REFRESH_TOKEN');
        const moduleName = this.config.get('ZOHO_ORDER_MODULE') || 'Deals';
        if (!clientId || !clientSecret || !refreshToken) {
            this.logger.warn('Zoho credentials not configured; skipping CRM sync');
            return;
        }
        const payload = {
            Customer_Name: order.customerName,
            Mobile_Number: order.mobile,
            Email_ID: order.email,
            Shipping_Address: order.shippingAddress,
            Products_Purchased: order.items?.map((i) => i.productName).join(', ') || '',
            Quantity: order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0,
            Order_ID: order.orderId,
            Amount_Paid: order.totalAmount,
            Payment_Status: order.paymentStatus,
            Order_Date_Time: order.createdAt?.toISOString?.() || new Date().toISOString(),
        };
        const maxRetries = 2;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                if (order.zohoRecordId) {
                    await this.updateRecord(moduleName, order.zohoRecordId, payload);
                }
                else {
                    const existing = await this.findByOrderId(moduleName, order.orderId);
                    if (existing) {
                        await this.updateRecord(moduleName, existing.id, payload);
                        order.zohoRecordId = existing.id;
                        await this.orderRepo.save(order);
                    }
                    else {
                        const recordId = await this.createRecord(moduleName, payload);
                        order.zohoRecordId = recordId;
                        await this.orderRepo.save(order);
                    }
                }
                this.logger.log(`Zoho sync success for order ${order.orderId}`);
                return;
            }
            catch (err) {
                this.logger.error(`Zoho sync failed for order ${order.orderId} (attempt ${attempt + 1}/${maxRetries + 1}): ${err}`);
                if (attempt === maxRetries) {
                    this.logger.error(`Zoho sync gave up for order ${order.orderId}`);
                    return;
                }
                await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            }
        }
    }
    async getAccessToken() {
        const clientId = this.config.get('ZOHO_CLIENT_ID');
        const clientSecret = this.config.get('ZOHO_CLIENT_SECRET');
        const refreshToken = this.config.get('ZOHO_REFRESH_TOKEN');
        const res = await fetch('https://accounts.zoho.com/oauth/v2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                refresh_token: refreshToken,
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'refresh_token',
            }),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Zoho token failed: ${res.status} ${text}`);
        }
        const data = await res.json();
        return data.access_token;
    }
    async createRecord(moduleName, data) {
        const token = await this.getAccessToken();
        const dc = this.config.get('ZOHO_DC') || 'com';
        const base = `https://www.zohoapis.${dc}/crm/v2/${encodeURIComponent(moduleName)}`;
        const res = await fetch(base, {
            method: 'POST',
            headers: {
                Authorization: `Zoho-oauthtokens ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: [data] }),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Zoho create failed: ${res.status} ${text}`);
        }
        const json = await res.json();
        const id = json?.data?.[0]?.details?.id;
        if (!id)
            throw new Error('Zoho create returned no id');
        return id;
    }
    async updateRecord(moduleName, recordId, data) {
        const token = await this.getAccessToken();
        const dc = this.config.get('ZOHO_DC') || 'com';
        const base = `https://www.zohoapis.${dc}/crm/v2/${encodeURIComponent(moduleName)}/${recordId}`;
        const res = await fetch(base, {
            method: 'PUT',
            headers: {
                Authorization: `Zoho-oauthtokens ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: [data] }),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Zoho update failed: ${res.status} ${text}`);
        }
    }
    async findByOrderId(moduleName, orderId) {
        const token = await this.getAccessToken();
        const dc = this.config.get('ZOHO_DC') || 'com';
        const base = `https://www.zohoapis.${dc}/crm/v2/${encodeURIComponent(moduleName)}/search?criteria=(Order_ID:equals:${encodeURIComponent(orderId)})`;
        const res = await fetch(base, {
            headers: { Authorization: `Zoho-oauthtokens ${token}` },
        });
        if (!res.ok)
            return null;
        const json = await res.json();
        const record = json?.data?.[0];
        return record ? { id: record.id } : null;
    }
};
exports.ZohoService = ZohoService;
exports.ZohoService = ZohoService = ZohoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], ZohoService);
//# sourceMappingURL=zoho.service.js.map