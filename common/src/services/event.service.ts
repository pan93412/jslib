import { EventType } from '../enums/eventType';
import { StorageKey } from '../enums/storageKey';

import { EventData } from '../models/data/eventData';

import { EventRequest } from '../models/request/eventRequest';

import { ActiveAccountService } from '../abstractions/activeAccount.service';
import { ApiService } from '../abstractions/api.service';
import { CipherService } from '../abstractions/cipher.service';
import { EventService as EventServiceAbstraction } from '../abstractions/event.service';
import { OrganizationService } from '../abstractions/organization.service';

export class EventService implements EventServiceAbstraction {
    private inited = false;

    constructor(private apiService: ApiService, private cipherService: CipherService,
        private activeAccountService: ActiveAccountService, private organizationService: OrganizationService) { }

    init(checkOnInterval: boolean) {
        if (this.inited) {
            return;
        }

        this.inited = true;
        if (checkOnInterval) {
            this.uploadEvents();
            setInterval(() => this.uploadEvents(), 60 * 1000); // check every 60 seconds
        }
    }

    async collect(eventType: EventType, cipherId: string = null, uploadImmediately = false): Promise<any> {
        const authed = this.activeAccountService.isAuthenticated;
        if (!authed) {
            return;
        }
        const organizations = await this.organizationService.getAll();
        if (organizations == null) {
            return;
        }
        const orgIds = new Set<string>(organizations.filter(o => o.useEvents).map(o => o.id));
        if (orgIds.size === 0) {
            return;
        }
        if (cipherId != null) {
            const cipher = await this.cipherService.get(cipherId);
            if (cipher == null || cipher.organizationId == null || !orgIds.has(cipher.organizationId)) {
                return;
            }
        }
        let eventCollection = await this.activeAccountService.get<EventData[]>(StorageKey.EventCollectionKey);
        if (eventCollection == null) {
            eventCollection = [];
        }
        const event = new EventData();
        event.type = eventType;
        event.cipherId = cipherId;
        event.date = new Date().toISOString();
        eventCollection.push(event);
        await this.activeAccountService.save(StorageKey.EventCollectionKey, eventCollection);
        if (uploadImmediately) {
            await this.uploadEvents();
        }
    }

    async uploadEvents(): Promise<any> {
        const authed = this.activeAccountService.isAuthenticated;
        if (!authed) {
            return;
        }
        const eventCollection = await this.activeAccountService.get<EventData[]>(StorageKey.EventCollectionKey);
        if (eventCollection == null || eventCollection.length === 0) {
            return;
        }
        const request = eventCollection.map(e => {
            const req = new EventRequest();
            req.type = e.type;
            req.cipherId = e.cipherId;
            req.date = e.date;
            return req;
        });
        try {
            await this.apiService.postEventsCollect(request);
            this.clearEvents();
        } catch { }
    }

    async clearEvents(): Promise<any> {
        await this.activeAccountService.remove(StorageKey.EventCollectionKey);
    }
}
