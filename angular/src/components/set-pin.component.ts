import { Directive } from '@angular/core';

import { ActiveAccountService } from 'jslib-common/abstractions/activeAccount.service';
import { CryptoService } from 'jslib-common/abstractions/crypto.service';
import { VaultTimeoutService } from 'jslib-common/abstractions/vaultTimeout.service';

import { KdfType } from 'jslib-common/enums/kdfType';
import { StorageKey } from 'jslib-common/enums/storageKey';

import { Utils } from 'jslib-common/misc/utils';

import { SettingStorageOptions } from 'jslib-common/models/domain/settingStorageOptions';

import { ModalRef } from './modal/modal.ref';

@Directive()
export class SetPinComponent {

    pin = '';
    showPin = false;
    masterPassOnRestart = true;

    constructor(private modalRef: ModalRef, private cryptoService: CryptoService,
        private vaultTimeoutService: VaultTimeoutService, private activeAccountService: ActiveAccountService) { }

    toggleVisibility() {
        this.showPin = !this.showPin;
    }

    async submit() {
        if (Utils.isNullOrWhitespace(this.pin)) {
            this.modalRef.close(false);
        }

        const kdf = await this.activeAccountService.get<KdfType>(StorageKey.KdfType);
        const kdfIterations = await this.activeAccountService.get<number>(StorageKey.KdfIterations);
        const email = this.activeAccountService.activeAccount?.email;
        const pinKey = await this.cryptoService.makePinKey(this.pin, email, kdf, kdfIterations);
        const key = await this.cryptoService.getKey();
        const pinProtectedKey = await this.cryptoService.encrypt(key.key, pinKey);
        if (this.masterPassOnRestart) {
            const encPin = await this.cryptoService.encrypt(this.pin);
            await this.activeAccountService.save(StorageKey.ProtectedPin, encPin.encryptedString, { skipMemory: true });
            this.vaultTimeoutService.pinProtectedKey = pinProtectedKey;
        } else {
            await this.activeAccountService.save(StorageKey.PinProtectedKey, pinProtectedKey.encryptedString, { skipMemory: true });
        }

        this.modalRef.close(true);
    }
}
