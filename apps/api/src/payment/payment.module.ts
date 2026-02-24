import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { OrdersModule } from '../orders/orders.module';
import { ZohoModule } from '../zoho/zoho.module';

@Module({
  imports: [OrdersModule, ZohoModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
