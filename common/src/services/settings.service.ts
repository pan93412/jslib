import { ActiveAccountService } from '../abstractions/activeAccount.service';
import { SettingsService as SettingsServiceAbstraction } from '../abstractions/settings.service';

import { StorageKey } from '../enums/storageKey';

import { SettingStorageOptions } from '../models/domain/settingStorageOptions';

export class SettingsService implements SettingsServiceAbstraction {
    constructor(private activeAccountService: ActiveAccountService) {
    }

    async clearCache(): Promise<void> {
        await this.activeAccountService.remove(StorageKey.Settings, { skipDisk: true } as SettingStorageOptions);
    }

    getEquivalentDomains(): Promise<any> {
        return this.getSettingsKey(StorageKey.EquivalentDomains);
    }

    async setEquivalentDomains(equivalentDomains: string[][]): Promise<void> {
        await this.setSettingsKey(StorageKey.EquivalentDomains, equivalentDomains);
    }

    async clear(): Promise<void> {
        await this.activeAccountService.remove(StorageKey.Settings);
    }

    // Helpers

    private async getSettings(): Promise<any> {
        return await this.activeAccountService.get(StorageKey.Settings);
    }

    private async getSettingsKey(key: string): Promise<any> {
        const settings = await this.getSettings();
        if (settings != null && settings[key]) {
            return settings[key];
        }
        return null;
    }

    private async setSettingsKey(key: string, value: any): Promise<void> {
        let settings = await this.getSettings();
        if (!settings) {
            settings = {};
        }

        settings[key] = value;
        await this.activeAccountService.save(StorageKey.Settings, settings);
    }
}
