import { AccountsManagementService as AccountsManagementServiceAbstraction } from '../abstractions/accountsManagement.service';
import { StorageService } from '../abstractions/storage.service';

import { Account } from '../models/domain/account';

import { StorageKey } from '../enums/storageKey';

import { BehaviorSubject } from 'rxjs';

export class AccountsManagementService implements AccountsManagementServiceAbstraction {
    accounts = new BehaviorSubject<Record<string, Account>>(null);
    activeAccount = new BehaviorSubject<Account>(null);

    private _accounts: Record<string, Account> = {};

    constructor(private storageService: StorageService, private secureStorageService: StorageService) {
    }

    async add(account: Account): Promise<void> {
        this._accounts[account.userId] = account;
        await this.switch(account.userId);
        await this.saveToDisk(account);
        this.accounts.next(this._accounts);
    }

    find(userId: string): Account {
        return this._accounts[userId];
    }

    async switch(userId: string): Promise<void> {
        if (!this._accounts[userId]) {
            return;
        }

        this.activeAccount.next(this._accounts[userId]);
    }

    async remove(userId: string): Promise<void> {
        await this.secureStorageService.remove(userId);
        await this.storageService.remove(userId);
        delete this._accounts[userId];
        this.accounts.next(this._accounts);
    }

    replace(account: Account) {
        if (this.find(account.userId)) {
            this._accounts[account.userId] = account;
        }
    }

    private async saveToDisk(account: Account): Promise<void> {
        return account.information.forEach(async (value: string, key: StorageKey) => {
            await this.storageService.save(`${account.userId}.${key}`, value);
        });
    }
}
