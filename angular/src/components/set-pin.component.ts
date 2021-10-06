import { Directive } from '@angular/core';

import { ActiveAccountService } from 'jslib-common/abstractions/activeAccount.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';

import { KdfType } from 'jslib-common/enums/kdfType';
import { StorageKey } from 'jslib-common/enums/storageKey';

import { Utils } from 'jslib-common/misc/utils';

import { ModalRef } from './modal/modal.ref';

@Directive()
export class SetPinComponent {

    pin = '';
    showPin = false;
    masterPassOnRestart = true;

    constructor(private modalRef: ModalRef, private cryptoService: CryptoService,
        private vaultTimeoutService: VaultTimeoutService, private activeAccount: ActiveAccountService) { }

    toggleVisibility() {
        this.showPin = !this.showPin;
    }

    async submit() {
        if (Utils.isNullOrWhitespace(this.pin)) {
            this.modalRef.close(false);
        }

        const kdf = await this.activeAccount.getInformation<KdfType>(StorageKey.KdfType);
        const kdfIterations = await this.activeAccount.getInformation<number>(StorageKey.KdfIterations);
        const email = this.activeAccount.email;
        const pinKey = await this.cryptoService.makePinKey(this.pin, email, kdf, kdfIterations);
        const key = await this.cryptoService.getKey();
        const pinProtectedKey = await this.cryptoService.encrypt(key.key, pinKey);
        if (this.masterPassOnRestart) {
            const encPin = await this.cryptoService.encrypt(this.pin);
            await this.activeAccount.saveInformation(StorageKey.ProtectedPin, encPin.encryptedString, { storageMethod: 'disk' });
            this.vaultTimeoutService.pinProtectedKey = pinProtectedKey;
        } else {
            await this.activeAccount.saveInformation(StorageKey.PinProtectedKey, pinProtectedKey.encryptedString, { storageMethod: 'disk' });
        }

        this.modalRef.close(true);
    }
}
