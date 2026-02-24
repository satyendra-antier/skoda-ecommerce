"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Minio = __importStar(require("minio"));
let StorageService = StorageService_1 = class StorageService {
    config;
    logger = new common_1.Logger(StorageService_1.name);
    client = null;
    bucket = 'skoda-products';
    publicBaseUrl = '';
    constructor(config) {
        this.config = config;
        const endpoint = this.config.get('MINIO_ENDPOINT') || 'localhost';
        const port = this.config.get('MINIO_PORT') || 9000;
        const useSSL = this.config.get('MINIO_USE_SSL') === 'true';
        const accessKey = this.config.get('MINIO_ACCESS_KEY');
        const secretKey = this.config.get('MINIO_SECRET_KEY');
        this.bucket = this.config.get('MINIO_BUCKET') || 'skoda-products';
        this.publicBaseUrl =
            this.config.get('MINIO_PUBLIC_URL') ||
                `${useSSL ? 'https' : 'http'}://${endpoint}:${port}/${this.bucket}`;
        if (accessKey && secretKey) {
            this.client = new Minio.Client({
                endPoint: endpoint,
                port: Number(port),
                useSSL,
                accessKey,
                secretKey,
            });
        }
    }
    async onModuleInit() {
        if (this.client) {
            try {
                const exists = await this.client.bucketExists(this.bucket);
                if (!exists) {
                    await this.client.makeBucket(this.bucket, 'us-east-1');
                    this.logger.log(`Created MinIO bucket: ${this.bucket}`);
                }
            }
            catch (err) {
                this.logger.warn(`MinIO bucket check failed: ${err.message}`);
            }
        }
    }
    async uploadBuffer(buffer, originalName) {
        if (!this.client) {
            throw new Error('MinIO not configured. Set MINIO_ACCESS_KEY and MINIO_SECRET_KEY.');
        }
        const ext = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : '';
        const objectName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        await this.client.putObject(this.bucket, objectName, buffer, buffer.length, {
            'Content-Type': this.getContentType(ext),
        });
        const url = `${this.publicBaseUrl}/${objectName}`;
        this.logger.log(`Uploaded ${objectName}`);
        return url;
    }
    getContentType(ext) {
        const map = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.gif': 'image/gif',
        };
        return map[ext.toLowerCase()] || 'application/octet-stream';
    }
    isConfigured() {
        return this.client !== null;
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map