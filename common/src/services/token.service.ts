import { ConstantsService } from './constants.service';

import { StorageService } from '../abstractions/storage.service';
import { TokenService as TokenServiceAbstraction } from '../abstractions/token.service';

import { Utils } from '../misc/utils';

const Keys = {
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
    twoFactorTokenPrefix: 'twoFactorToken_',
    clientId: 'apikey_clientId',
    clientSecret: 'apikey_clientSecret',
};

export class TokenService implements TokenServiceAbstraction {
    token: string;
    decodedToken: any;
    refreshToken: string;
    clientId: string;
    clientSecret: string;

    constructor(private storageService: StorageService) {
    }

    async setTokens(accessToken: string, refreshToken: string, clientIdClientSecret: [string, string]): Promise<any> {
        await this.setToken(accessToken);
        await this.setRefreshToken(refreshToken);
        if (clientIdClientSecret != null) {
            await this.setClientId(clientIdClientSecret[0]);
            await this.setClientSecret(clientIdClientSecret[1]);
        }
    }

    async setClientId(clientId: string): Promise<any> {
        this.clientId = clientId;
        return this.storeTokenValue(Keys.clientId, clientId);
    }

    async getClientId(): Promise<string> {
        if (this.clientId != null) {
            return this.clientId;
        }

        this.clientId = await this.storageService.get<string>(Keys.clientId);
        return this.clientId;
    }

    async setClientSecret(clientSecret: string): Promise<any> {
        this.clientSecret = clientSecret;
        return this.storeTokenValue(Keys.clientSecret, clientSecret);
    }

    async getClientSecret(): Promise<string> {
        if (this.clientSecret != null) {
            return this.clientSecret;
        }

        this.clientSecret = await this.storageService.get<string>(Keys.clientSecret);
        return this.clientSecret;
    }

    async setToken(token: string): Promise<any> {
        this.token = token;
        this.decodedToken = null;
        return this.storeTokenValue(Keys.accessToken, token);
    }

    async getToken(): Promise<string> {
        if (this.token != null) {
            return this.token;
        }

        this.token = await this.storageService.get<string>(Keys.accessToken);
        return this.token;
    }

    async setRefreshToken(refreshToken: string): Promise<any> {
        this.refreshToken = refreshToken;
        return this.storeTokenValue(Keys.refreshToken, refreshToken);
    }

    async getRefreshToken(): Promise<string> {
        if (this.refreshToken != null) {
            return this.refreshToken;
        }

        this.refreshToken = await this.storageService.get<string>(Keys.refreshToken);
        return this.refreshToken;
    }

    async toggleTokens(): Promise<any> {
        const token = await this.getToken();
        const refreshToken = await this.getRefreshToken();
        const clientId = await this.getClientId();
        const clientSecret = await this.getClientSecret();
        const timeout = await this.storageService.get(ConstantsService.vaultTimeoutKey);
        const action = await this.storageService.get(ConstantsService.vaultTimeoutActionKey);
        if ((timeout != null || timeout === 0) && action === 'logOut') {
            // if we have a vault timeout and the action is log out, reset tokens
            await this.clearToken();
            this.token = token;
            this.refreshToken = refreshToken;
            this.clientId = clientId;
            this.clientSecret = clientSecret;
            return;
        }

        await this.setToken(token);
        await this.setRefreshToken(refreshToken);
        await this.setClientId(clientId);
        await this.setClientSecret(clientSecret);
    }

    setTwoFactorToken(token: string, email: string): Promise<any> {
        return this.storageService.save(Keys.twoFactorTokenPrefix + email, token);
    }

    getTwoFactorToken(email: string): Promise<string> {
        return this.storageService.get<string>(Keys.twoFactorTokenPrefix + email);
    }

    clearTwoFactorToken(email: string): Promise<any> {
        return this.storageService.remove(Keys.twoFactorTokenPrefix + email);
    }

    async clearToken(): Promise<any> {
        this.token = null;
        this.decodedToken = null;
        this.refreshToken = null;
        this.clientId = null;
        this.clientSecret = null;

        await this.storageService.remove(Keys.accessToken);
        await this.storageService.remove(Keys.refreshToken);
        await this.storageService.remove(Keys.clientId);
        await this.storageService.remove(Keys.clientSecret);
    }

    // jwthelper methods
    // ref https://github.com/auth0/angular-jwt/blob/master/src/angularJwt/services/jwt.js

    decodeToken(): any {
        if (this.decodedToken) {
            return this.decodedToken;
        }

        if (this.token == null) {
            throw new Error('Token not found.');
        }

        const parts = this.token.split('.');
        if (parts.length !== 3) {
            throw new Error('JWT must have 3 parts');
        }

        const decoded = Utils.fromUrlB64ToUtf8(parts[1]);
        if (decoded == null) {
            throw new Error('Cannot decode the token');
        }

        this.decodedToken = JSON.parse(decoded);
        return this.decodedToken;
    }

    getTokenExpirationDate(): Date {
        const decoded = this.decodeToken();
        if (typeof decoded.exp === 'undefined') {
            return null;
        }

        const d = new Date(0); // The 0 here is the key, which sets the date to the epoch
        d.setUTCSeconds(decoded.exp);
        return d;
    }

    tokenSecondsRemaining(offsetSeconds: number = 0): number {
        const d = this.getTokenExpirationDate();
        if (d == null) {
            return 0;
        }

        const msRemaining = d.valueOf() - (new Date().valueOf() + (offsetSeconds * 1000));
        return Math.round(msRemaining / 1000);
    }

    tokenNeedsRefresh(minutes: number = 5): boolean {
        const sRemaining = this.tokenSecondsRemaining();
        return sRemaining < (60 * minutes);
    }

    getUserId(): string {
        const decoded = this.decodeToken();
        if (typeof decoded.sub === 'undefined') {
            throw new Error('No user id found');
        }

        return decoded.sub as string;
    }

    getEmail(): string {
        const decoded = this.decodeToken();
        if (typeof decoded.email === 'undefined') {
            throw new Error('No email found');
        }

        return decoded.email as string;
    }

    getEmailVerified(): boolean {
        const decoded = this.decodeToken();
        if (typeof decoded.email_verified === 'undefined') {
            throw new Error('No email verification found');
        }

        return decoded.email_verified as boolean;
    }

    getName(): string {
        const decoded = this.decodeToken();
        if (typeof decoded.name === 'undefined') {
            return null;
        }

        return decoded.name as string;
    }

    getPremium(): boolean {
        const decoded = this.decodeToken();
        if (typeof decoded.premium === 'undefined') {
            return false;
        }

        return decoded.premium as boolean;
    }

    getIssuer(): string {
        const decoded = this.decodeToken();
        if (typeof decoded.iss === 'undefined') {
            throw new Error('No issuer found');
        }

        return decoded.iss as string;
    }

    private async storeTokenValue(key: string, value: string) {
        if (await this.skipTokenStorage()) {
            // if we have a vault timeout and the action is log out, don't store token
            return;
        }

        return this.storageService.save(key, value);
    }

    private async skipTokenStorage(): Promise<boolean> {
        const timeout = await this.storageService.get<number>(ConstantsService.vaultTimeoutKey);
        const action = await this.storageService.get<string>(ConstantsService.vaultTimeoutActionKey);
        return timeout != null && action === 'logOut';
    }
}
