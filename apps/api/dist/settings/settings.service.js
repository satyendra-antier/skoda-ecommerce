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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const site_setting_entity_1 = require("../entities/site-setting.entity");
const BANNER_KEY = 'banner_images';
const CATEGORIES_KEY = 'categories';
let SettingsService = class SettingsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async getBannerUrls() {
        const row = await this.repo.findOne({ where: { key: BANNER_KEY } });
        if (!row?.value)
            return [];
        try {
            const parsed = JSON.parse(row.value);
            return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
        }
        catch {
            return [];
        }
    }
    async setBannerUrls(urls) {
        const valid = urls.filter((x) => typeof x === 'string');
        await this.repo.upsert({ key: BANNER_KEY, value: JSON.stringify(valid) }, ['key']);
        return valid;
    }
    async getCategories() {
        const row = await this.repo.findOne({ where: { key: CATEGORIES_KEY } });
        if (!row?.value)
            return [];
        try {
            const parsed = JSON.parse(row.value);
            return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
        }
        catch {
            return [];
        }
    }
    async setCategories(categories) {
        const valid = categories.filter((x) => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim());
        await this.repo.upsert({ key: CATEGORIES_KEY, value: JSON.stringify(valid) }, ['key']);
        return valid;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(site_setting_entity_1.SiteSetting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SettingsService);
//# sourceMappingURL=settings.service.js.map