import { ProviderData } from '../models/data/providerData';

import { Provider } from '../models/domain/provider';

export abstract class ProviderService {
    get: (id: string) => Promise<Provider>;
    getAll: () => Promise<Provider[]>;
    save: (orgs: {[id: string]: ProviderData}) => Promise<any>;
}
