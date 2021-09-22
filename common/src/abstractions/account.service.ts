import { StorageKey } from '../enums/storageKey';

import { Account } from '../models/domain/account';
import { SettingStorageOptions } from '../models/domain/settingStorageOptions';

export abstract class AccountService {
    activeAccount: Account;
    addAccount: (account: Account) => Promise<void>;
    switchAccount: (userId: string) => Promise<void>;
    findAccount: (userId: string) => Account;
    removeAccount: (userId: string) => Promise<void>;
    saveSetting: (key: StorageKey | string, obj: any, options?: SettingStorageOptions) => Promise<any>;
    removeSetting: (key: StorageKey | string, options?: SettingStorageOptions) => Promise<any>;
    hasSetting: (key: StorageKey | string, options?: SettingStorageOptions) => Promise<boolean>;
    getSetting: <T>(key: StorageKey | string, options?: SettingStorageOptions) => Promise<T>;
}
