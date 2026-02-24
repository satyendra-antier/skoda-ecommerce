import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client: Minio.Client | null = null;
  private bucket: string = 'skoda-products';
  private publicBaseUrl: string = '';

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('MINIO_ENDPOINT') || 'localhost';
    const port = this.config.get<number>('MINIO_PORT') || 9000;
    const useSSL = this.config.get<string>('MINIO_USE_SSL') === 'true';
    const accessKey = this.config.get<string>('MINIO_ACCESS_KEY');
    const secretKey = this.config.get<string>('MINIO_SECRET_KEY');
    this.bucket = this.config.get<string>('MINIO_BUCKET') || 'skoda-products';
    this.publicBaseUrl =
      this.config.get<string>('MINIO_PUBLIC_URL') ||
      `${useSSL ? 'https' : 'http'}://${endpoint}:${port}/${this.bucket}`;

    if (accessKey && secretKey) {
      this.client = new Minio.Client({
        endPoint: endpoint,
        port: Number(port),
        useSSL,
        accessKey,
        secretKey,
      });
    }
  }

  async onModuleInit() {
    if (this.client) {
      try {
        const exists = await this.client.bucketExists(this.bucket);
        if (!exists) {
          await this.client.makeBucket(this.bucket, 'us-east-1');
          this.logger.log(`Created MinIO bucket: ${this.bucket}`);
        }
        // Allow public read for product images (required for direct URLs like /skoda-products/products/...)
        const publicReadPolicy = JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: '*',
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}/*`],
            },
          ],
        });
        await this.client.setBucketPolicy(this.bucket, publicReadPolicy);
        this.logger.log(`Set public read policy on MinIO bucket: ${this.bucket}`);
      } catch (err) {
        this.logger.warn(`MinIO bucket check failed: ${(err as Error).message}`);
      }
    }
  }

  async uploadBuffer(buffer: Buffer, originalName: string): Promise<string> {
    if (!this.client) {
      throw new Error('MinIO not configured. Set MINIO_ACCESS_KEY and MINIO_SECRET_KEY.');
    }
    const ext = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : '';
    const objectName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    await this.client.putObject(this.bucket, objectName, buffer, buffer.length, {
      'Content-Type': this.getContentType(ext),
    });
    const url = `${this.publicBaseUrl}/${objectName}`;
    this.logger.log(`Uploaded ${objectName}`);
    return url;
  }

  private getContentType(ext: string): string {
    const map: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };
    return map[ext.toLowerCase()] || 'application/octet-stream';
  }

  isConfigured(): boolean {
    return this.client !== null;
  }
}
