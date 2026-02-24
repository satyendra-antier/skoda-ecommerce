import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { ZohoService } from './zoho.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  providers: [ZohoService],
  exports: [ZohoService],
})
export class ZohoModule {}
