import { OrganizationData } from '../data/organizationData';

import { KdfType } from '../../enums/kdfType';
import { StorageKey } from '../../enums/storageKey';

export class Account {
    userId: string;
    email: string;
    information: Map<string, any> = new Map<string, any>();

    constructor(userId: string, userEmail: string,
        kdfType: KdfType, kdfIterations: number,
        clientId: string, clientSecret: string,
        accessToken: string, refreshToken: string) {
        this.userId = userId;
        this.email = userEmail;
        this.information.set(StorageKey.KdfType, kdfType);
        this.information.set(StorageKey.KdfIterations, kdfIterations);
        this.information.set(StorageKey.ClientId, clientId);
        this.information.set(StorageKey.ClientSecret, clientSecret);
        this.information.set(StorageKey.AccessToken, accessToken);
        this.information.set(StorageKey.RefreshToken, refreshToken);
    }

    get isAuthenticated(): boolean {
        if (!this.information.has(StorageKey.AccessToken)) {
            return false;
        }

        return this.userId != null || this.information.has(StorageKey.EntityId);
    }

    get canAccessPremium(): boolean {
        if (!this.isAuthenticated) {
            return false;
        }

        return this.hasPremiumPersonally || this.hasPremiumThroughOrganization;
    }

    get serverUrl(): string {
        if (!this.information.has(StorageKey.EnvironmentUrls)) {
            return null;
        }

        const enviromentUrls = this.information.get(StorageKey.EnvironmentUrls);
        return enviromentUrls.base;
    }

    private get hasPremiumPersonally(): boolean {
        const token = this.information.get(StorageKey.AccessToken);
        if (token.premium) {
           return true;
        }
    }

    private get hasPremiumThroughOrganization(): boolean {
        const organizations = this.information.get(StorageKey.Organizations) as {
            [id: string]: OrganizationData;
        };

        if (organizations == null) {
            return false;
        }

        for (const id  of Object.keys(organizations)) {
            const o = organizations[id];
            if (o.enabled && o.usersGetPremium && !o.isProviderUser) {
                return true;
            }
        }

        return false;
    }
}

