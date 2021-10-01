export type SettingStorageOptions = {
    keySuffix?: KeySuffixOptions;
    skipDisk?: boolean;
    skipMemory?: boolean;
    storageMethod?: StorageMethod;
    useSecureStorage?: boolean;
};

export type KeySuffixOptions = 'auto' | 'biometric';
export type StorageMethod = 'memory' | 'disk' | 'both';
