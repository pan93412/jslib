import { ActiveAccountService } from '../abstractions/activeAccount.service';
import { SettingsService as SettingsServiceAbstraction } from '../abstractions/settings.service';

import { StorageKey } from '../enums/storageKey';

export class SettingsService implements SettingsServiceAbstraction {
    constructor(private activeAccount: ActiveAccountService) {
    }

    async clearCache(): Promise<void> {
        await this.activeAccount.removeInformation(StorageKey.Settings, { storageMethod: 'memory' });
    }

    getEquivalentDomains(): Promise<any> {
        return this.getSettingsKey(StorageKey.EquivalentDomains);
    }

    async setEquivalentDomains(equivalentDomains: string[][]): Promise<void> {
        await this.setSettingsKey(StorageKey.EquivalentDomains, equivalentDomains);
    }

    async clear(): Promise<void> {
        await this.activeAccount.removeInformation(StorageKey.Settings);
    }

    // Helpers

    private async getSettings(): Promise<any> {
        return await this.activeAccount.getInformation(StorageKey.Settings);
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
        await this.activeAccount.saveInformation(StorageKey.Settings, settings);
    }
}
