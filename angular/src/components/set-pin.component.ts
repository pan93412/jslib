import { Directive } from '@angular/core';

import { AccountService } from 'jslib-common/abstractions/account.service';
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
        private vaultTimeoutService: VaultTimeoutService, private accountService: AccountService) { }

    toggleVisibility() {
        this.showPin = !this.showPin;
    }

    async submit() {
        if (Utils.isNullOrWhitespace(this.pin)) {
            this.modalRef.close(false);
        }

        const kdf = await this.accountService.getSetting<KdfType>(StorageKey.KdfType);
        const kdfIterations = await this.accountService.getSetting<number>(StorageKey.KdfIterations);
        const email = this.accountService.activeAccount?.email;
        const pinKey = await this.cryptoService.makePinKey(this.pin, email, kdf, kdfIterations);
        const key = await this.cryptoService.getKey();
        const pinProtectedKey = await this.cryptoService.encrypt(key.key, pinKey);
        if (this.masterPassOnRestart) {
            const encPin = await this.cryptoService.encrypt(this.pin);
            await this.accountService.saveSetting(StorageKey.ProtectedPin, encPin.encryptedString, { skipMemory: true } as SettingStorageOptions);
            this.vaultTimeoutService.pinProtectedKey = pinProtectedKey;
        } else {
            await this.accountService.saveSetting(StorageKey.PinProtectedKey, pinProtectedKey.encryptedString, { skipMemory: true } as SettingStorageOptions);
        }

        this.modalRef.close(true);
    }
}
