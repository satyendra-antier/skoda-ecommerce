import { IsString } from 'class-validator';

export class InitPaymentDto {
  @IsString()
  orderId: string;
}
