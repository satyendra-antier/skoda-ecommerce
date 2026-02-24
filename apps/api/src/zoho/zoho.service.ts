import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';

@Injectable()
export class ZohoService {
  private readonly logger = new Logger(ZohoService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async syncOrder(order: Order): Promise<void> {
    const clientId = this.config.get<string>('ZOHO_CLIENT_ID');
    const clientSecret = this.config.get<string>('ZOHO_CLIENT_SECRET');
    const refreshToken = this.config.get<string>('ZOHO_REFRESH_TOKEN');
    const moduleName = this.config.get<string>('ZOHO_ORDER_MODULE') || 'Deals';

    if (!clientId || !clientSecret || !refreshToken) {
      this.logger.warn('Zoho credentials not configured; skipping CRM sync');
      return;
    }

    const payload = {
      Customer_Name: order.customerName,
      Mobile_Number: order.mobile,
      Email_ID: order.email,
      Shipping_Address: order.shippingAddress,
      Products_Purchased: order.items?.map((i) => i.productName).join(', ') || '',
      Quantity: order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0,
      Order_ID: order.orderId,
      Amount_Paid: order.totalAmount,
      Payment_Status: order.paymentStatus,
      Order_Date_Time: order.createdAt?.toISOString?.() || new Date().toISOString(),
    };

    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (order.zohoRecordId) {
          await this.updateRecord(moduleName, order.zohoRecordId, payload);
        } else {
          const existing = await this.findByOrderId(moduleName, order.orderId);
          if (existing) {
            await this.updateRecord(moduleName, existing.id, payload);
            order.zohoRecordId = existing.id;
            await this.orderRepo.save(order);
          } else {
            const recordId = await this.createRecord(moduleName, payload);
            order.zohoRecordId = recordId;
            await this.orderRepo.save(order);
          }
        }
        this.logger.log(`Zoho sync success for order ${order.orderId}`);
        return;
      } catch (err) {
        this.logger.error(
          `Zoho sync failed for order ${order.orderId} (attempt ${attempt + 1}/${maxRetries + 1}): ${err}`,
        );
        if (attempt === maxRetries) {
          this.logger.error(`Zoho sync gave up for order ${order.orderId}`);
          return;
        }
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  private async getAccessToken(): Promise<string> {
    const clientId = this.config.get<string>('ZOHO_CLIENT_ID');
    const clientSecret = this.config.get<string>('ZOHO_CLIENT_SECRET');
    const refreshToken = this.config.get<string>('ZOHO_REFRESH_TOKEN');
    const res = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken!,
        client_id: clientId!,
        client_secret: clientSecret!,
        grant_type: 'refresh_token',
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Zoho token failed: ${res.status} ${text}`);
    }
    const data = await res.json();
    return data.access_token;
  }

  private async createRecord(moduleName: string, data: Record<string, unknown>): Promise<string> {
    const token = await this.getAccessToken();
    const dc = this.config.get<string>('ZOHO_DC') || 'com';
    const base = `https://www.zohoapis.${dc}/crm/v2/${encodeURIComponent(moduleName)}`;
    const res = await fetch(base, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtokens ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [data] }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Zoho create failed: ${res.status} ${text}`);
    }
    const json = await res.json();
    const id = json?.data?.[0]?.details?.id;
    if (!id) throw new Error('Zoho create returned no id');
    return id;
  }

  private async updateRecord(moduleName: string, recordId: string, data: Record<string, unknown>): Promise<void> {
    const token = await this.getAccessToken();
    const dc = this.config.get<string>('ZOHO_DC') || 'com';
    const base = `https://www.zohoapis.${dc}/crm/v2/${encodeURIComponent(moduleName)}/${recordId}`;
    const res = await fetch(base, {
      method: 'PUT',
      headers: {
        Authorization: `Zoho-oauthtokens ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [data] }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Zoho update failed: ${res.status} ${text}`);
    }
  }

  private async findByOrderId(moduleName: string, orderId: string): Promise<{ id: string } | null> {
    const token = await this.getAccessToken();
    const dc = this.config.get<string>('ZOHO_DC') || 'com';
    const base = `https://www.zohoapis.${dc}/crm/v2/${encodeURIComponent(moduleName)}/search?criteria=(Order_ID:equals:${encodeURIComponent(orderId)})`;
    const res = await fetch(base, {
      headers: { Authorization: `Zoho-oauthtokens ${token}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const record = json?.data?.[0];
    return record ? { id: record.id } : null;
  }
}
