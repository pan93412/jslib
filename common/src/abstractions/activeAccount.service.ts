import { StorageService } from './storage.service';

export abstract class ActiveAccountService extends StorageService {
    userId: string;
    isAuthenticated: boolean;
}

