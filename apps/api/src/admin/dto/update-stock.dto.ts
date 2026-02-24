import { IsInt, IsOptional, IsEnum, Min } from 'class-validator';
import { ProductStatus } from '../../entities/product.entity';

export class UpdateStockDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
