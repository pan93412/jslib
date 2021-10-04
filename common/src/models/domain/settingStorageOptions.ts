export type SettingStorageOptions = {
    keySuffix?: KeySuffixOptions;
    storageMethod?: StorageMethod;
    useSecureStorage?: boolean;
};

export type KeySuffixOptions = 'auto' | 'biometric';
export type StorageMethod = 'memory' | 'disk' | 'both';
