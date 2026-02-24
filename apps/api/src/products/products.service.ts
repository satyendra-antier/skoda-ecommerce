import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from '../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const existing = await this.findBySku(dto.sku);
    if (existing) {
      throw new ConflictException(`Product with SKU ${dto.sku} already exists`);
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
      status: (dto.stockQuantity ?? 0) > 0 ? ProductStatus.Active : ProductStatus.OutOfStock,
    });
    return this.productRepo.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.shortDescription !== undefined) product.shortDescription = dto.shortDescription;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.category !== undefined) product.category = dto.category;
    if (dto.badge !== undefined) product.badge = dto.badge;
    if (dto.isFeatured !== undefined) product.isFeatured = dto.isFeatured;
    if (dto.collection !== undefined) product.collection = dto.collection;
    if (dto.specifications !== undefined) product.specifications = dto.specifications;
    if (dto.imageUrls !== undefined) product.imageUrls = dto.imageUrls;
    if (dto.price !== undefined) product.price = String(dto.price);
    if (dto.stockQuantity !== undefined) {
      product.stockQuantity = dto.stockQuantity;
      product.status = dto.stockQuantity > 0 ? ProductStatus.Active : ProductStatus.OutOfStock;
    }
    const saved = await this.productRepo.save(product);
    this.eventsGateway.emitProductUpdated(id);
    return saved;
  }

  async findAll(status?: ProductStatus): Promise<Product[]> {
    const qb = this.productRepo.createQueryBuilder('p').orderBy('p.name');
    if (status) {
      qb.andWhere('p.status = :status', { status });
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  async findBySku(sku: string): Promise<Product | null> {
    return this.productRepo.findOne({ where: { sku } });
  }

  async getByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];
    return this.productRepo
      .createQueryBuilder('p')
      .where('p.id IN (:...ids)', { ids })
      .getMany();
  }

  async deductStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) return;
    product.stockQuantity = Math.max(0, product.stockQuantity - quantity);
    if (product.stockQuantity <= 0) {
      product.status = ProductStatus.OutOfStock;
    }
    await this.productRepo.save(product);
    this.eventsGateway.emitProductUpdated(productId);
  }

  async remove(id: string): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    await this.productRepo.remove(product);
  }
}
