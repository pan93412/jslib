import { ActiveAccountService } from 'jslib-common/abstractions/activeAccount.service';
import { CryptoFunctionService } from 'jslib-common/abstractions/cryptoFunction.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import { StorageKey } from 'jslib-common/enums/storageKey';

import { KeySuffixOptions, SettingStorageOptions } from 'jslib-common/models/domain/settingStorageOptions';

import { CryptoService } from 'jslib-common/services/crypto.service';

export class ElectronCryptoService extends CryptoService {

    constructor(cryptoFunctionService: CryptoFunctionService, platformUtilService: PlatformUtilsService,
        logService: LogService, activeAccountService: ActiveAccountService) {
        super(cryptoFunctionService, platformUtilService, logService, activeAccountService);
    }

    async hasKeyStored(keySuffix: KeySuffixOptions): Promise<boolean> {
        await this.upgradeSecurelyStoredKey();
        return super.hasKeyStored(keySuffix);
    }

    protected async retrieveKeyFromStorage(keySuffix: KeySuffixOptions) {
        await this.upgradeSecurelyStoredKey();
        return super.retrieveKeyFromStorage(keySuffix);
    }

    /**
     * @deprecated 4 Jun 2021 This is temporary upgrade method to move from a single shared stored key to
     * multiple, unique stored keys for each use, e.g. never logout vs. biometric authentication.
     */
    private async upgradeSecurelyStoredKey() {
        // attempt key upgrade, but if we fail just delete it. Keys will be stored property upon unlock anyway.
        const key = await this.activeAccountService.get<string>(StorageKey.CryptoMasterKey, { skipMemory: true, useSecureStorage: true });

        if (key == null) {
            return;
        }

        try {
            if (await this.shouldStoreKey('auto')) {
                await this.activeAccountService.save(StorageKey.CryptoMasterKey, key, { keySuffix: 'auto', skipMemory: true, useSecureStorage: true });
            }
            if (await this.shouldStoreKey('biometric')) {
                await this.activeAccountService.save(StorageKey.CryptoMasterKey, key, { keySuffix: 'biometric', skipMemory: true, useSecureStorage: true });
            }
        } catch (e) {
            this.logService.error(`Encountered error while upgrading obsolete Bitwarden secure storage item:`);
            this.logService.error(e);
        }

        await this.activeAccountService.remove(StorageKey.CryptoMasterKey, { useSecureStorage: true });
    }
}
