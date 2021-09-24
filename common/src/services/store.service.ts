import { StorageService } from '../abstractions/storage.service';

import { SettingStorageOptions } from '../models/domain/settingStorageOptions';

import { StorageKey } from '../enums/storageKey';

export class StoreService implements StorageService {
    constructor(private storageService: StorageService,
        private secureStorageService: StorageService) {
    }

    async save(key: StorageKey | string, obj: any, options?: SettingStorageOptions): Promise<any> {
        if (options?.useSecureStorage) {
            return await this.secureStorageService.save(key, obj, options);
        } else {
            return await this.storageService.save(key, obj, options);
        }
    }

    async remove(key: StorageKey | string, options?: SettingStorageOptions): Promise<any> {
        if (options?.useSecureStorage) {
            return await this.secureStorageService.remove(key, options);
        } else {
            return await this.storageService.remove(key, options);
        }
    }

    async get<T>(key: StorageKey | string, options?: SettingStorageOptions): Promise<T> {
        if (options?.useSecureStorage) {
            return await this.secureStorageService.get<T>(key, options);
        } else {
            return await this.storageService.get<T>(key, options);
        }
    }

    async has(key: StorageKey | string, options?: SettingStorageOptions): Promise<boolean> {
        if (options?.useSecureStorage) {
            return await this.secureStorageService.has(key, options);
        } else {
            return await this.storageService.has(key, options);
        }
    }
}

