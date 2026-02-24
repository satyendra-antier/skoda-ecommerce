import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PaymentService } from './payment.service';
import { InitPaymentDto } from './dto/init-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('init')
  async init(@Body() dto: InitPaymentDto) {
    return this.paymentService.init(dto.orderId);
  }

  @Get('callback')
  async callbackGet(@Query() query: Record<string, string>, @Res() res: Response) {
    const { redirectUrl } = await this.paymentService.handleCallback(query);
    return res.redirect(302, redirectUrl);
  }

  @Get('success')
  async devSuccess(
    @Query('orderId') orderId: string,
    @Query('redirect') redirect: string,
    @Res() res: Response,
  ) {
    if (orderId) {
      await this.paymentService.markOrderSuccess(orderId);
    }
    const url = redirect || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order/confirmation?orderId=${orderId}&status=success`;
    return res.redirect(302, url);
  }

  @Post('callback')
  async callbackPost(
    @Body() body: Record<string, string>,
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    const params = { ...query, ...body };
    const { redirectUrl } = await this.paymentService.handleCallback(params);
    return res.redirect(302, redirectUrl);
  }
}
