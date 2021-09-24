import { ActiveAccountService as ActiveAccountServiceAbstraction } from '../abstractions/activeAccount.service';
import { AccountsManagementService } from '../abstractions/accountsManagement.service';

import { Account } from '../models/domain/account';
import { SettingStorageOptions } from '../models/domain/settingStorageOptions';

import { StorageKey } from '../enums/storageKey';

import { StoreService } from './store.service';

export class ActiveAccountService implements ActiveAccountServiceAbstraction {
    activeAccount: Account;

    constructor(private accountsManagementService: AccountsManagementService, private storeService: StoreService) { 
        this.accountsManagementService.activeAccount.subscribe(data => this.activeAccount = data);
    }

    async save(key: StorageKey | string, obj: any, options?: SettingStorageOptions): Promise<void> {
        if (!options?.skipMemory && this.activeAccount != null) {
            this.activeAccount.information.set(key, obj);
            this.accountsManagementService.replace(this.activeAccount);
        }

        if (!options?.skipDisk) {
            await this.storeService.save(await this.prefixKey(key), obj, options);
        }
    }

    async has(key: StorageKey | string, options?: SettingStorageOptions) {
        if (!options?.skipMemory) {
           return this.activeAccount?.information.has(key);
        }

        if (!options?.skipDisk) {
            return await this.storeService.has(await this.prefixKey(key), options);
        }
    }

    async get<T>(key: StorageKey | string, options?: SettingStorageOptions): Promise<T> {
        if (!options?.skipMemory && this.activeAccount?.information.has(key)) {
            return this.activeAccount?.information.get(key) as T;
        }

        if (!options?.skipDisk) {
            return await this.storeService.get<T>(await this.prefixKey(key), options);
        }
    }

    async remove(key: StorageKey | string, options?: SettingStorageOptions) {
        if (!options?.skipMemory && this.activeAccount?.information.has(key)) {
            this.activeAccount.information.delete(key);
            this.accountsManagementService.replace(this.activeAccount);
        }

        if (!options?.skipDisk) {
            await this.storeService.remove(await this.prefixKey(key), options);
        }
    }

    private async prefixKey(key: StorageKey | string): Promise<string> {
        let prefix = this.activeAccount?.userId;
        if (prefix == null) {
            prefix = 'global';
        }

        if (prefix == null) {
            return key;
        }

        return `${prefix}.${key}`;
    }
}

