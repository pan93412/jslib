export type SettingStorageOptions = {
    keySuffix?: KeySuffixOptions;
    skipDisk?: boolean;
    skipMemory?: boolean;
    useSecureStorage?: boolean;
};

export type KeySuffixOptions = 'auto' | 'biometric';
