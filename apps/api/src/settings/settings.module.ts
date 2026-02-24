import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SiteSetting } from '../entities/site-setting.entity';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { AdminAuthGuard } from '../admin/admin-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([SiteSetting]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'skoda-admin-secret',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SettingsService, AdminAuthGuard],
  controllers: [SettingsController],
  exports: [SettingsService],
})
export class SettingsModule {}
