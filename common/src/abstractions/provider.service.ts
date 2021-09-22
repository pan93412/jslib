import { Provider } from "../models/domain/provider";

export abstract class ProviderService {
    get: (id: string) => Promise<Provider>;
    getAll: () => Promise<Provider[]>;
}
