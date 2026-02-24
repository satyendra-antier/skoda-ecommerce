import { Repository } from 'typeorm';
import { SiteSetting } from '../entities/site-setting.entity';
export declare class SettingsService {
    private readonly repo;
    constructor(repo: Repository<SiteSetting>);
    getBannerUrls(): Promise<string[]>;
    setBannerUrls(urls: string[]): Promise<string[]>;
    getCategories(): Promise<string[]>;
    setCategories(categories: string[]): Promise<string[]>;
}
