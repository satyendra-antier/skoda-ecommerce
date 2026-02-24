import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminLoginDto } from './dto/login.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { AdminService } from './admin.service';
import { PaymentStatus } from '../entities/order.entity';
import { StorageService } from '../storage/storage.service';
import { ProductsService } from '../products/products.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly adminService: AdminService,
    private readonly storageService: StorageService,
    private readonly productsService: ProductsService,
  ) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    const username = this.config.get<string>('ADMIN_USERNAME') || 'admin';
    const password = this.config.get<string>('ADMIN_PASSWORD') || 'admin';
    if (dto.username !== username || dto.password !== password) {
      return { success: false, message: 'Invalid credentials' };
    }
    const token = this.jwtService.sign(
      { sub: 'admin' },
      { expiresIn: '24h', secret: this.config.get<string>('JWT_SECRET') || 'skoda-admin-secret' },
    );
    return { success: true, token };
  }

  @UseGuards(AdminAuthGuard)
  @Get('dashboard')
  async dashboard() {
    return this.adminService.getDashboard();
  }

  @UseGuards(AdminAuthGuard)
  @Get('orders')
  async orders(
    @Query('paymentStatus') paymentStatus?: PaymentStatus,
    @Query('fulfilmentStatus') fulfilmentStatus?: string,
  ) {
    return this.adminService.getOrders(paymentStatus, fulfilmentStatus);
  }

  @UseGuards(AdminAuthGuard)
  @Post('orders/:orderId/sync-zoho')
  async syncOrderZoho(@Param('orderId') orderId: string) {
    return this.adminService.syncOrderToZoho(orderId);
  }

  @UseGuards(AdminAuthGuard)
  @Get('orders/export')
  async exportOrders(
    @Query('paymentStatus') paymentStatus: string | undefined,
    @Res() res: Response,
  ) {
    const csv = await this.adminService.exportOrdersCsv(paymentStatus);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
    return res.send(csv);
  }

  @UseGuards(AdminAuthGuard)
  @Get('products')
  async products() {
    return this.adminService.getProducts();
  }

  @UseGuards(AdminAuthGuard)
  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    await this.productsService.remove(id);
    return { success: true };
  }

  @UseGuards(AdminAuthGuard)
  @Patch('products/:id')
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('products/:id/stock')
  async updateStock(@Param('id') id: string, @Body() dto: UpdateStockDto) {
    return this.adminService.updateProductStock(id, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  async upload(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) {
      return { urls: [] };
    }
    if (!this.storageService.isConfigured()) {
      throw new BadRequestException('File storage (MinIO) is not configured. Set MINIO_ACCESS_KEY and MINIO_SECRET_KEY.');
    }
    const urls: string[] = [];
    for (const file of files) {
      try {
        const url = await this.storageService.uploadBuffer(file.buffer, file.originalname || 'image');
        urls.push(url);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        throw new BadRequestException(`Upload failed: ${message}`);
      }
    }
    return { urls };
  }

  @UseGuards(AdminAuthGuard)
  @Post('products')
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}
