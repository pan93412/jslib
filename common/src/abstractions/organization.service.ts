import { Organization } from '../models/domain/organization';

export abstract class OrganizationService {
    get: (id: string) => Promise<Organization>;
    getByIdentifier: (identifier: string) => Promise<Organization>;
    getAll: () => Promise<Organization[]>;
}
