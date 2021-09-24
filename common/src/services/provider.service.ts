import { ActiveAccountService } from '../abstractions/activeAccount.service';
import { ProviderService as ProviderServiceAbstraction } from '../abstractions/provider.service';

import { ProviderData } from '../models/data/providerData';

import { Provider } from '../models/domain/provider';

import { StorageKey } from '../enums/storageKey';


export class ProviderService implements ProviderServiceAbstraction {
    constructor(private activeAccountService: ActiveAccountService) {
    }

    async get(id: string): Promise<Provider> {
        const providers = await this.activeAccountService.get<{ [id: string]: ProviderData; }>(
            StorageKey.Providers);
        if (providers == null || !providers.hasOwnProperty(id)) {
            return null;
        }

        return new Provider(providers[id]);
    }

    async getAll(): Promise<Provider[]> {
        const providers = await this.activeAccountService.get<{ [id: string]: ProviderData; }>(
            StorageKey.Providers);
        const response: Provider[] = [];
        for (const id in providers) {
            if (providers.hasOwnProperty(id)) {
                response.push(new Provider(providers[id]));
            }
        }
        return response;
    }
}
