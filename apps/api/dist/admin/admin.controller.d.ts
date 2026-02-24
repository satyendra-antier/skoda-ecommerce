import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminLoginDto } from './dto/login.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { AdminService } from './admin.service';
import { PaymentStatus } from '../entities/order.entity';
import { StorageService } from '../storage/storage.service';
import { ProductsService } from '../products/products.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
export declare class AdminController {
    private readonly config;
    private readonly jwtService;
    private readonly adminService;
    private readonly storageService;
    private readonly productsService;
    constructor(config: ConfigService, jwtService: JwtService, adminService: AdminService, storageService: StorageService, productsService: ProductsService);
    login(dto: AdminLoginDto): Promise<{
        success: boolean;
        message: string;
        token?: undefined;
    } | {
        success: boolean;
        token: string;
        message?: undefined;
    }>;
    dashboard(): Promise<{
        pending: number;
        successful: number;
        failed: number;
        productCount: number;
        recentOrders: Array<{
            id: string;
            orderId: string;
            customerName: string;
            totalAmount: string;
            paymentStatus: string;
            createdAt: Date;
        }>;
        totalRevenue: string;
    }>;
    orders(paymentStatus?: PaymentStatus, fulfilmentStatus?: string): Promise<import("../entities/order.entity").Order[]>;
    syncOrderZoho(orderId: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    exportOrders(paymentStatus: string | undefined, res: Response): Promise<Response<any, Record<string, any>>>;
    products(): Promise<import("../entities/product.entity").Product[]>;
    getProduct(id: string): Promise<import("../entities/product.entity").Product>;
    deleteProduct(id: string): Promise<{
        success: boolean;
    }>;
    updateProduct(id: string, dto: UpdateProductDto): Promise<import("../entities/product.entity").Product>;
    updateStock(id: string, dto: UpdateStockDto): Promise<import("../entities/product.entity").Product>;
    upload(files: Express.Multer.File[]): Promise<{
        urls: string[];
    }>;
    createProduct(dto: CreateProductDto): Promise<import("../entities/product.entity").Product>;
}
