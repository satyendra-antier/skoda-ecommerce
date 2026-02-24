import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AdminAuthGuard } from '../admin/admin-auth.guard';

@Controller()
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  /** Public: get banner image URLs for home hero carousel */
  @Get('settings/banner')
  async getBanner() {
    const urls = await this.settings.getBannerUrls();
    return { urls };
  }

  /** Admin: get banner URLs */
  @UseGuards(AdminAuthGuard)
  @Get('admin/settings/banner')
  async getAdminBanner() {
    const urls = await this.settings.getBannerUrls();
    return { urls };
  }

  /** Admin: set banner URLs (array of image URLs from uploads) */
  @UseGuards(AdminAuthGuard)
  @Put('admin/settings/banner')
  async setBanner(@Body() body: { urls: string[] }) {
    const urls = Array.isArray(body?.urls) ? body.urls : [];
    const saved = await this.settings.setBannerUrls(urls);
    return { urls: saved };
  }

  /** Public: get category list for shop filters */
  @Get('settings/categories')
  async getCategories() {
    const categories = await this.settings.getCategories();
    return { categories };
  }

  /** Admin: get categories */
  @UseGuards(AdminAuthGuard)
  @Get('admin/settings/categories')
  async getAdminCategories() {
    const categories = await this.settings.getCategories();
    return { categories };
  }

  /** Admin: set categories (order = display order in shop filter) */
  @UseGuards(AdminAuthGuard)
  @Put('admin/settings/categories')
  async setCategories(@Body() body: { categories: string[] }) {
    const categories = Array.isArray(body?.categories) ? body.categories : [];
    const saved = await this.settings.setCategories(categories);
    return { categories: saved };
  }
}
