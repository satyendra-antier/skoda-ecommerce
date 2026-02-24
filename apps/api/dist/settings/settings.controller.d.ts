import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settings;
    constructor(settings: SettingsService);
    getBanner(): Promise<{
        urls: string[];
    }>;
    getAdminBanner(): Promise<{
        urls: string[];
    }>;
    setBanner(body: {
        urls: string[];
    }): Promise<{
        urls: string[];
    }>;
    getCategories(): Promise<{
        categories: string[];
    }>;
    getAdminCategories(): Promise<{
        categories: string[];
    }>;
    setCategories(body: {
        categories: string[];
    }): Promise<{
        categories: string[];
    }>;
}
