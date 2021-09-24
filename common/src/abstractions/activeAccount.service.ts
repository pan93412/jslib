import { StorageService } from './storage.service';

import { Account } from '../models/domain/account';

export abstract class ActiveAccountService extends StorageService {
    activeAccount: Account;
}

