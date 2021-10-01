import { SettingStorageOptions } from '../models/domain/settingStorageOptions';

export abstract class ActiveAccountService {
    userId: string;
    isAuthenticated: boolean;
    serverUrl: string;
    email: string;
    canAccessPremium: boolean;

    getInformation: <T>(key: string, options?: SettingStorageOptions) => Promise<T>;
    hasInformation: (key: string, options?: SettingStorageOptions) => Promise<boolean>;
    saveInformation: (key: string, obj: any, options?: SettingStorageOptions) => Promise<any>;
    removeInformation: (key: string, options?: SettingStorageOptions) => Promise<any>;
}

