import { ActiveAccountService } from 'jslib-common/abstractions/activeAccount.service';
import { CryptoFunctionService } from 'jslib-common/abstractions/cryptoFunction.service';
import { LogService } from 'jslib-common/abstractions/log.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';

import { StorageKey } from 'jslib-common/enums/storageKey';

import { KeySuffixOptions } from 'jslib-common/models/domain/settingStorageOptions';

import { CryptoService } from 'jslib-common/services/crypto.service';

export class ElectronCryptoService extends CryptoService {

    constructor(cryptoFunctionService: CryptoFunctionService, platformUtilService: PlatformUtilsService,
        logService: LogService, activeAccount: ActiveAccountService) {
        super(cryptoFunctionService, platformUtilService, logService, activeAccount);
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
        const key = await this.activeAccount.getInformation<string>(StorageKey.CryptoMasterKey, { storageMethod: 'disk', useSecureStorage: true });

        if (key == null) {
            return;
        }

        try {
            if (await this.shouldStoreKey('auto')) {
                await this.activeAccount.saveInformation(StorageKey.CryptoMasterKey, key, { keySuffix: 'auto', storageMethod: 'disk', useSecureStorage: true });
            }
            if (await this.shouldStoreKey('biometric')) {
                await this.activeAccount.saveInformation(StorageKey.CryptoMasterKey, key, { keySuffix: 'biometric', storageMethod: 'disk', useSecureStorage: true });
            }
        } catch (e) {
            this.logService.error(`Encountered error while upgrading obsolete Bitwarden secure storage item:`);
            this.logService.error(e);
        }

        await this.activeAccount.removeInformation(StorageKey.CryptoMasterKey, { useSecureStorage: true });
    }
}
