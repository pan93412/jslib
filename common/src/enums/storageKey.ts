export enum StorageKey {
    // Auth
    AccessToken = 'accessToken',
    RefreshToken = 'refreshToken',
    SecurityStamp = 'securityStamp',
    TwoFactorToken = 'twoFactorToken',

    // User Info
    ApiKeyClientId = 'apikey_clientId',
    ApiKeyClientSecret = 'apikey_clientSecret',
    ClientId = 'clientId',
    ClientSecret = 'clientSecret',
    EmailVerified = 'emailVerified',
    EntityId = 'entityId',
    EntityType = 'entityType',
    LastActive = 'lastActive',
    LastSync = 'lastSync',

    // App Info
    InstalledVersion = 'installedVersion',

    // Crypto
    CryptoMasterKey = 'key',
    CryptoSymmetricKey = 'encKey',
    EncOrgKeys = 'encOrgKeys',
    EncPrivateKey = 'encPrivateKey',
    EncProviderKeys = 'encProviderKeys',
    KeyHash = 'keyHash',
    LegacyEtmKey = 'legacyEtmKey',
    PublicKey = 'publicKey',

    // Orgs
    ForcePasswordReset = 'forcePasswordReset',

    // Data Objects
    Ciphers = 'ciphers',
    CollapsedGroupings = 'collapsedGroupings',
    Collections = 'collections',
    EnvironmentUrls = 'environmentUrls',
    Folders = 'folders',
    LocalData = 'sitesLocalData',
    NeverDomains = 'neverDomains',
    Organizations = 'organizations',
    PasswordGenerationHistory = 'generatedPasswordHistory',
    Policies = 'policies',
    Providers = 'providers',
    Sends = 'sends',

    // Settings
    AlwaysShowDock = 'alwaysShowDock',
    AutoConfirmFingerprints = 'autoConfirmFingerprints',
    AutoFillOnPageLoadDefault = 'autoFillOnPageLoadDefault',
    BiometricAwaitingAcceptance = 'biometricAwaitingAcceptance',
    BiometricFingerprintValidated = 'biometricFingerprintValidated',
    BiometricText = 'biometricText',
    BiometricUnlock = 'biometric',
    ClearClipboard = 'clearClipboardKey',
    DefaultUriMatch = 'defaultUriMatch',
    DisableAddLoginNotification = 'disableAddLoginNotification',
    DisableAutoTotpCopy = 'disableAutoTotpCopy',
    DisableBadgeCounter = 'disableBadgeCounter',
    DisableChangedPasswordNotification = 'disableChangedPasswordNotification',
    DisableContextMenuItem = 'disableContextMenuItem',
    DisableFavicon = 'disableFavicon',
    DisableGa = 'disableGa',
    DontShowCardsCurrentTab = 'dontShowCardsCurrentTab',
    DontShowIdentitiesCurrentTab = 'dontShowIdentitiesCurrentTab',
    EnableAlwaysOnTopKey = 'enableAlwaysOnTopKey',
    EnableAutoFillOnPageLoad = 'enableAutoFillOnPageLoad',
    EnableBiometric = 'enabledBiometric',
    EnableBrowserIntegration = 'enableBrowserIntegration',
    EnableBrowserIntegrationFingerprint = 'enableBrowserIntegrationFingerprint',
    EnableCloseToTrayKey = 'enableCloseToTray',
    EnableMinimizeToTrayKey = 'enableMinimizeToTray',
    EnableStartToTrayKey = 'enableStartToTrayKey',
    EnableTrayKey = 'enableTray',
    EquivalentDomains = 'equivalentDomains',
    EventCollectionKey = 'eventCollection',
    KdfIterations = 'kdfIterations',
    KdfType = 'kdf',
    Locale = 'locale',
    MainWindowSize = 'mainWindowSize',
    MinimizeOnCopyToClipboardKey = 'minimizeOnCopyToClipboardKey',
    NoAutoPromptBiometrics = 'noAutoPromptBiometrics',
    NoAutoPromptBiometricsText = 'noAutoPromptBiometricsText',
    OpenAtLogin = 'openAtLogin',
    PasswordGenerationOptions = 'passwordGenerationOptions',
    PinProtectedKey = 'pinProtectedKey',
    ProtectedPin = 'protectedPin',
    RememberEmail = 'rememberEmail',
    RememberedEmail = 'rememberedEmail',
    Settings = 'settings',
    SsoCodeVerifier = 'ssoCodeVerifier',
    SsoState = 'ssoState',
    Theme = 'theme',
    VaultTimeout = 'lockOption',
    VaultTimeoutAction = 'vaultTimeoutAction',
}
