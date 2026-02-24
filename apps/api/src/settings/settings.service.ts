import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSetting } from '../entities/site-setting.entity';

const BANNER_KEY = 'banner_images';
const CATEGORIES_KEY = 'categories';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SiteSetting)
    private readonly repo: Repository<SiteSetting>,
  ) {}

  async getBannerUrls(): Promise<string[]> {
    const row = await this.repo.findOne({ where: { key: BANNER_KEY } });
    if (!row?.value) return [];
    try {
      const parsed = JSON.parse(row.value) as unknown;
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }

  async setBannerUrls(urls: string[]): Promise<string[]> {
    const valid = urls.filter((x) => typeof x === 'string');
    await this.repo.upsert({ key: BANNER_KEY, value: JSON.stringify(valid) }, ['key']);
    return valid;
  }

  async getCategories(): Promise<string[]> {
    const row = await this.repo.findOne({ where: { key: CATEGORIES_KEY } });
    if (!row?.value) return [];
    try {
      const parsed = JSON.parse(row.value) as unknown;
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }

  async setCategories(categories: string[]): Promise<string[]> {
    const valid = categories.filter((x) => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim());
    await this.repo.upsert({ key: CATEGORIES_KEY, value: JSON.stringify(valid) }, ['key']);
    return valid;
  }
}
