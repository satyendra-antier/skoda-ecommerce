import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class StorageService implements OnModuleInit {
    private readonly config;
    private readonly logger;
    private client;
    private bucket;
    private publicBaseUrl;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    uploadBuffer(buffer: Buffer, originalName: string): Promise<string>;
    private getContentType;
    isConfigured(): boolean;
}
