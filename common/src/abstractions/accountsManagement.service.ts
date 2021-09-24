import { BehaviorSubject } from 'rxjs';

import { Account } from '../models/domain/account';

export abstract class AccountsManagementService {
    accounts: BehaviorSubject<Record<string, Account>>;
    activeAccount: BehaviorSubject<Account>;

    add: (account: Account) => Promise<void>;
    switch: (userId: string) => Promise<void>;
    find: (userId: string) => Account;
    remove: (userId: string) => Promise<void>;
    replace: (account: Account) => void;
}

