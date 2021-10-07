import { StorageKey } from '../enums/storageKey';

import { FolderData } from '../models/data/folderData';

import { Folder } from '../models/domain/folder';
import { SymmetricCryptoKey } from '../models/domain/symmetricCryptoKey';
import { TreeNode } from '../models/domain/treeNode';

import { FolderRequest } from '../models/request/folderRequest';

import { FolderResponse } from '../models/response/folderResponse';

import { FolderView } from '../models/view/folderView';

import { ActiveAccountService } from '../abstractions/activeAccount.service';
import { ApiService } from '../abstractions/api.service';
import { CipherService } from '../abstractions/cipher.service';
import { CryptoService } from '../abstractions/crypto.service';
import { FolderService as FolderServiceAbstraction } from '../abstractions/folder.service';
import { I18nService } from '../abstractions/i18n.service';
import { CipherData } from '../models/data/cipherData';

import { ServiceUtils } from '../misc/serviceUtils';
import { Utils } from '../misc/utils';

const NestingDelimiter = '/';

export class FolderService implements FolderServiceAbstraction {
    constructor(private cryptoService: CryptoService, private apiService: ApiService,
        private i18nService: I18nService, private cipherService: CipherService,
        private activeAccount: ActiveAccountService) { }

    async clearCache(): Promise<void> {
        await this.activeAccount.removeInformation(StorageKey.Folders, { storageMethod: 'memory' });
    }

    async encrypt(model: FolderView, key?: SymmetricCryptoKey): Promise<Folder> {
        const folder = new Folder();
        folder.id = model.id;
        folder.name = await this.cryptoService.encrypt(model.name, key);
        return folder;
    }

    async get(id: string): Promise<Folder> {
        const folders = await this.activeAccount.getInformation<{ [id: string]: FolderData; }>(
            StorageKey.Folders);
        if (folders == null || !folders.hasOwnProperty(id)) {
            return null;
        }

        return new Folder(folders[id]);
    }

    async getAll(): Promise<Folder[]> {
        const folders = await this.activeAccount.getInformation<{ [id: string]: FolderData; }>(
            StorageKey.Folders);
        const response: Folder[] = [];
        for (const id in folders) {
            if (folders.hasOwnProperty(id)) {
                response.push(new Folder(folders[id]));
            }
        }
        return response;
    }

    async getAllDecrypted(): Promise<FolderView[]> {
        if (await this.activeAccount.hasInformation(StorageKey.Folders, { storageMethod: 'memory' })) {
            return this.activeAccount.getInformation(StorageKey.Folders, { storageMethod: 'memory' });
        }

        const hasKey = await this.cryptoService.hasKey();
        if (!hasKey) {
            throw new Error('No key.');
        }

        const decFolders: FolderView[] = [];
        const promises: Promise<any>[] = [];
        const folders = await this.getAll();
        folders.forEach(folder => {
            promises.push(folder.decrypt().then(f => decFolders.push(f)));
        });

        await Promise.all(promises);
        decFolders.sort(Utils.getSortFunction(this.i18nService, 'name'));

        const noneFolder = new FolderView();
        noneFolder.name = this.i18nService.t('noneFolder');
        decFolders.push(noneFolder);

        await this.activeAccount.saveInformation(StorageKey.Folders, decFolders, { storageMethod: 'memory' });
        return decFolders;
    }

    async getAllNested(): Promise<TreeNode<FolderView>[]> {
        const folders = await this.getAllDecrypted();
        const nodes: TreeNode<FolderView>[] = [];
        folders.forEach(f => {
            const folderCopy = new FolderView();
            folderCopy.id = f.id;
            folderCopy.revisionDate = f.revisionDate;
            const parts = f.name != null ? f.name.replace(/^\/+|\/+$/g, '').split(NestingDelimiter) : [];
            ServiceUtils.nestedTraverse(nodes, 0, parts, folderCopy, null, NestingDelimiter);
        });
        return nodes;
    }

    async getNested(id: string): Promise<TreeNode<FolderView>> {
        const folders = await this.getAllNested();
        return ServiceUtils.getTreeNodeObject(folders, id) as TreeNode<FolderView>;
    }

    async saveWithServer(folder: Folder): Promise<any> {
        const request = new FolderRequest(folder);

        let response: FolderResponse;
        if (folder.id == null) {
            response = await this.apiService.postFolder(request);
            folder.id = response.id;
        } else {
            response = await this.apiService.putFolder(folder.id, request);
        }

        const userId = this.activeAccount.userId;
        const data = new FolderData(response, userId);
        await this.upsert(data);
    }

    async upsert(folder: FolderData | FolderData[]): Promise<any> {
        let folders = await this.activeAccount.getInformation<{ [id: string]: FolderData; }>(
            StorageKey.Folders, { storageMethod: 'disk' });
        if (folders == null) {
            folders = {};
        }

        if (folder instanceof FolderData) {
            const f = folder as FolderData;
            folders[f.id] = f;
        } else {
            (folder as FolderData[]).forEach(f => {
                folders[f.id] = f;
            });
        }

        await this.activeAccount.removeInformation(StorageKey.Folders);
        await this.activeAccount.saveInformation(StorageKey.Folders, folders, { storageMethod: 'disk' });
    }

    async replace(folders: { [id: string]: FolderData; }): Promise<any> {
        await this.activeAccount.removeInformation(StorageKey.Folders);
        await this.activeAccount.saveInformation(StorageKey.Folders, folders, { storageMethod: 'disk' });
    }

    async clear(): Promise<any> {
        await this.activeAccount.removeInformation(StorageKey.Folders);
    }

    async delete(id: string | string[]): Promise<any> {
        const folders = await this.activeAccount.getInformation<{ [id: string]: FolderData; }>(
            StorageKey.Folders, { storageMethod: 'disk' });
        if (folders == null) {
            return;
        }

        if (typeof id === 'string') {
            if (folders[id] == null) {
                return;
            }
            delete folders[id];
        } else {
            (id as string[]).forEach(i => {
                delete folders[i];
            });
        }

        await this.activeAccount.removeInformation(StorageKey.Folders);
        await this.activeAccount.saveInformation(StorageKey.Folders, folders, { storageMethod: 'disk' });

        // Items in a deleted folder are re-assigned to "No Folder"
        const ciphers = await this.activeAccount.getInformation<{ [id: string]: CipherData; }>(StorageKey.Ciphers, { storageMethod: 'disk' });
        if (ciphers != null) {
            const updates: CipherData[] = [];
            for (const cId in ciphers) {
                if (ciphers[cId].folderId === id) {
                    ciphers[cId].folderId = null;
                    updates.push(ciphers[cId]);
                }
            }
            if (updates.length > 0) {
                this.cipherService.upsert(updates);
            }
        }
    }

    async deleteWithServer(id: string): Promise<any> {
        await this.apiService.deleteFolder(id);
        await this.delete(id);
    }
}
