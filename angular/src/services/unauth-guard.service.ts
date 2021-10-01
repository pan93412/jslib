import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
} from '@angular/router';

import { ActiveAccountService } from 'jslib-common/abstractions/activeAccount.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';

@Injectable()
export class UnauthGuardService implements CanActivate {

    protected homepage = 'vault';
    constructor(private vaultTimeoutService: VaultTimeoutService, private router: Router,
        private activeAccount: ActiveAccountService) { }

    async canActivate() {
        const isAuthed = this.activeAccount.isAuthenticated;
        if (isAuthed) {
            const locked = await this.vaultTimeoutService.isLocked();
            if (locked) {
                this.router.navigate(['lock']);
            } else {
                this.router.navigate([this.homepage]);
            }
            return false;
        }

        return true;
    }
}
