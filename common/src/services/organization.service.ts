import { AccountService } from '../abstractions/account.service';
import { OrganizationData } from '../models/data/organizationData';

import { Organization } from '../models/domain/organization';

import { StorageKey } from '../enums/storageKey';


export class OrganizationService {//implements AccountServiceAbstraction {
    constructor(private accountService: AccountService) {
    }

    async get(id: string): Promise<Organization> {
        const organizations = await this.accountService.getSetting<{ [id: string]: OrganizationData; }>(
            StorageKey.Organizations);
        if (organizations == null || !organizations.hasOwnProperty(id)) {
            return null;
        }

        return new Organization(organizations[id]);
    }

    async getByIdentifier(identifier: string): Promise<Organization> {
        const organizations = await this.getAll();
        if (organizations == null || organizations.length === 0) {
            return null;
        }

        return organizations.find(o => o.identifier === identifier);
    }

    async getAll(): Promise<Organization[]> {
        const organizations = await this.accountService.getSetting<{ [id: string]: OrganizationData; }>(
            StorageKey.Organizations);
        const response: Organization[] = [];
        for (const id in organizations) {
            if (organizations.hasOwnProperty(id) && !organizations[id].isProviderUser) {
                response.push(new Organization(organizations[id]));
            }
        }
        return response;
    }
}
