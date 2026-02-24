import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductStatus } from '../entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async list(
    @Query('status') status?: ProductStatus,
  ) {
    return this.productsService.findAll(status);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
