import { AccountsManagementService } from '../abstractions/accountsManagement.service';
import { ActiveAccountService as ActiveAccountServiceAbstraction } from '../abstractions/activeAccount.service';

import { Account } from '../models/domain/account';
import { SettingStorageOptions, StorageMethod } from '../models/domain/settingStorageOptions';

import { StorageKey } from '../enums/storageKey';

import { StoreService } from './store.service';

export class ActiveAccountService implements ActiveAccountServiceAbstraction {
    private activeAccount: Account;

    get userId(): string {
        return this.activeAccount?.userId;
    }

    get email(): string {
        return this.activeAccount?.email;
    }

    get isAuthenticated(): boolean {
        return this.activeAccount?.isAuthenticated ?? false;
    }

    get serverUrl(): string {
        return this.activeAccount?.serverUrl;
    }

    get canAccessPremium(): boolean {
        return this.activeAccount?.canAccessPremium ?? false;
    }

    constructor(private accountsManagementService: AccountsManagementService, private storeService: StoreService) {
        this.accountsManagementService.activeAccount.subscribe(data => this.activeAccount = data);
    }

    async saveInformation(key: StorageKey | string, obj: any, options?: SettingStorageOptions): Promise<void> {
        if (this.useMemory(options?.storageMethod) && this.activeAccount != null) {
            this.activeAccount.information.set(key, obj);
            this.accountsManagementService.replace(this.activeAccount);
        }

        if (this.useDisk(options?.storageMethod)) {
            await this.storeService.save(await this.prefixKey(key), obj, options);
        }
    }

    async hasInformation(key: StorageKey | string, options?: SettingStorageOptions) {
        if (this.useMemory(options?.storageMethod)) {
            return this.activeAccount?.information.has(key);
        }

        if (this.useDisk(options?.storageMethod)) {
            return await this.storeService.has(await this.prefixKey(key), options);
        }

        return false;
    }

    async getInformation<T>(key: StorageKey | string, options?: SettingStorageOptions): Promise<T> {
        if (this.useMemory(options?.storageMethod) && this.activeAccount?.information.has(key)) {
            return this.activeAccount?.information.get(key) as T;
        }

        if (this.useDisk(options?.storageMethod)) {
            return await this.storeService.get<T>(await this.prefixKey(key), options);
        }
        return null;
    }

    async removeInformation(key: StorageKey | string, options?: SettingStorageOptions) {
        if (this.useMemory(options?.storageMethod) && this.activeAccount?.information.has(key)) {
            this.activeAccount.information.delete(key);
            this.accountsManagementService.replace(this.activeAccount);
        }

        if (this.useDisk(options?.storageMethod)) {
            await this.storeService.remove(await this.prefixKey(key), options);
        }
    }

    private useDisk(storageMethod: StorageMethod = 'both'): boolean {
        return storageMethod  !== 'memory';
    }

    private useMemory(storageMethod: StorageMethod = 'both'): boolean {
        return storageMethod !== 'disk' ;
    }

    private async prefixKey(key: StorageKey | string): Promise<string> {
        let prefix = this.userId;
        if (prefix == null) {
            prefix = 'global';
        }

        if (prefix == null) {
            return key;
        }

        return `${prefix}.${key}`;
    }
}

