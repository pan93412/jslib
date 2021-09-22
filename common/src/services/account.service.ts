import { AccountService as AccountServiceAbstraction } from '../abstractions/account.service';
import { StorageService } from '../abstractions/storage.service';

import { Account } from '../models/domain/account';
import { SettingStorageOptions } from '../models/domain/settingStorageOptions';

import { StorageKey } from '../enums/storageKey';

import { BehaviorSubject } from 'rxjs';

export class AccountService implements AccountServiceAbstraction {
    accounts = new BehaviorSubject<Record<string, Account>>(null);

    private _accounts: Record<string, Account> = {};
    private activeUserId: string;

    get activeAccount(): Account {
        return this._accounts[this.activeUserId];
    }

    constructor(private storageService: StorageService, private secureStorageService: StorageService) {
    }

    async addAccount(account: Account): Promise<void> {
        this._accounts[account.userId] = account;
        await this.switchAccount(account.userId);
        await this.saveAccountToStorage(account);
        this.accounts.next(this._accounts);
    }

    findAccount(userId: string): Account {
        return this._accounts[userId];
    }

    async switchAccount(userId: string): Promise<void> {
        if (!this._accounts[userId]) {
            return;
        }

        this.activeUserId = userId;
        this.accounts.next(this._accounts);
    }

    async removeAccount(userId: string): Promise<void> {
        await this.secureStorageService.remove(userId);
        await this.storageService.remove(userId);
        delete this._accounts[userId];
        this.accounts.next(this._accounts);
    }

    async saveSetting(key: StorageKey | string, obj: any, options?: SettingStorageOptions): Promise<void> {
        if (!options?.skipMemory && this.activeAccount != null) {
            this.activeAccount.settings.set(key, obj);
        }

        if (!options?.skipDisk) {
            await this.saveToStorage(key, obj, options);
        }
    }

    async hasSetting(key: StorageKey | string, options?: SettingStorageOptions) {
        if (!options?.skipMemory) {
           return this.activeAccount?.settings.has(key);
        }

        if (!options?.skipDisk) {
            return await this.hasInStorage(key, options);
        }
    }

    async getSetting<T>(key: StorageKey | string, options?: SettingStorageOptions): Promise<T> {
        if (!options?.skipMemory && this.activeAccount?.settings.has(key)) {
            return this.activeAccount?.settings.get(key) as T;
        }

        if (!options?.skipDisk) {
            return await this.getFromStorage<T>(key, options);
        }
    }

    async removeSetting(key: StorageKey | string, options?: SettingStorageOptions) {
        if (!options?.skipMemory && this.activeAccount?.settings.has(key)) {
            this.activeAccount.settings.delete(key);
        }

        if (!options?.skipDisk) {
            await this.removeFromStorage(key, options);
        }
    }

    async clearMemory(): Promise<void> {
        this._accounts[this.activeUserId].settings.clear();
    }

    async clearDisk(): Promise<void> {
        await this.secureStorageService.remove(this.activeUserId);
        await this.storageService.remove(this.activeUserId);
    }


    private async saveToStorage(key: StorageKey | string, obj: any, options?: SettingStorageOptions): Promise<any> {
        if (options?.useSecureStorage) {
            return await this.secureStorageService.save(await this.prefixKey(key), obj, options);
        } else {
            return await this.storageService.save(await this.prefixKey(key), obj, options);
        }
    }

    private async removeFromStorage(key: StorageKey | string, options?: SettingStorageOptions): Promise<any> {
        if (options?.useSecureStorage) {
            return await this.secureStorageService.remove(await this.prefixKey(key), options);
        } else {
            return await this.storageService.remove(await this.prefixKey(key), options);
        }
    }

    private async getFromStorage<T>(key: StorageKey | string, options?: SettingStorageOptions): Promise<T> {
        if (options?.useSecureStorage) {
            return await this.secureStorageService.get<T>(await this.prefixKey(key), options);
        } else {
            return await this.storageService.get<T>(await this.prefixKey(key), options);
        }
    }

    private async hasInStorage(key: StorageKey | string, options?: SettingStorageOptions): Promise<boolean> {
        if (options?.useSecureStorage) {
            return await this.secureStorageService.has(await this.prefixKey(key), options);
        } else {
            return await this.storageService.has(await this.prefixKey(key), options);
        }
    }

    private async saveAccountToStorage(account: Account): Promise<void> {
        return account.settings.forEach(async (value: string, key: StorageKey) => {
            await this.saveToStorage(key, value);
        });
    }

    private async prefixKey(key: StorageKey | string): Promise<string> {
        let prefix = this.activeUserId;
        if (prefix == null) {
            prefix = 'global';
        }

        if (prefix == null) {
            return key;
        }

        return `${prefix}.${key}`;
    }
}
