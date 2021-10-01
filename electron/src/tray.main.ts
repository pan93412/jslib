import {
    app,
    BrowserWindow,
    Menu,
    MenuItemConstructorOptions,
    nativeImage,
    Tray,
} from 'electron';
import * as path from 'path';

import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { StorageService } from 'jslib-common/abstractions/storage.service';

import { StorageKey } from 'jslib-common/enums/storageKey';

import { WindowMain } from './window.main';

export class TrayMain {
    contextMenu: Menu;

    private appName: string;
    private tray: Tray;
    private icon: string | Electron.NativeImage;
    private pressedIcon: Electron.NativeImage;

    constructor(private windowMain: WindowMain, private i18nService: I18nService,
        private storageService: StorageService) {
        if (process.platform === 'win32') {
            this.icon = path.join(__dirname, '/images/icon.ico');
        } else if (process.platform === 'darwin') {
            const nImage = nativeImage.createFromPath(path.join(__dirname, '/images/icon-template.png'));
            nImage.setTemplateImage(true);
            this.icon = nImage;
            this.pressedIcon = nativeImage.createFromPath(path.join(__dirname, '/images/icon-highlight.png'));
        } else {
            this.icon = path.join(__dirname, '/images/icon.png');
        }
    }

    async init(appName: string, additionalMenuItems: MenuItemConstructorOptions[] = null) {
        this.appName = appName;

        const menuItemOptions: MenuItemConstructorOptions[] = [{
            label: this.i18nService.t('showHide'),
            click: () => this.toggleWindow(),
        },
        { type: 'separator' },
        {
            label: this.i18nService.t('exit'),
            click: () => this.closeWindow(),
        }];

        if (additionalMenuItems != null) {
            menuItemOptions.splice(1, 0, ...additionalMenuItems);
        }

        this.contextMenu = Menu.buildFromTemplate(menuItemOptions);
        if (await this.storageService.get<boolean>(StorageKey.EnableTrayKey)) {
            this.showTray();
        }
    }

    setupWindowListeners(win: BrowserWindow) {
        win.on('minimize', async (e: Event) => {
            if (await this.storageService.get<boolean>(StorageKey.EnableMinimizeToTrayKey)) {
                e.preventDefault();
                this.hideToTray();
            }
        });

        win.on('close', async (e: Event) => {
            if (await this.storageService.get<boolean>(StorageKey.EnableCloseToTrayKey)) {
                if (!this.windowMain.isQuitting) {
                    e.preventDefault();
                    this.hideToTray();
                }
            }
        });

        win.on('show', async (e: Event) => {
            const enableTray = await this.storageService.get<boolean>(StorageKey.EnableTrayKey);
            if (!enableTray) {
                setTimeout(() =>  this.removeTray(false), 100);
            }
        });
    }

    removeTray(showWindow = true) {
        // Due to https://github.com/electron/electron/issues/17622
        // we cannot destroy the tray icon on linux.
        if (this.tray != null && process.platform !== 'linux') {
            this.tray.destroy();
            this.tray = null;
        }

        if (showWindow && this.windowMain.win != null && !this.windowMain.win.isVisible()) {
            this.windowMain.win.show();
        }
    }

    async hideToTray() {
        this.showTray();
        if (this.windowMain.win != null) {
            this.windowMain.win.hide();
        }
        if (this.isDarwin() && !await this.storageService.get<boolean>(StorageKey.AlwaysShowDock)) {
            this.hideDock();
        }
    }

    restoreFromTray() {
        if (this.windowMain.win == null || !this.windowMain.win.isVisible()) {
            this.toggleWindow();
        }
    }

    showTray() {
        if (this.tray != null) {
            return;
        }

        this.tray = new Tray(this.icon);
        this.tray.setToolTip(this.appName);
        this.tray.on('click', () => this.toggleWindow());
        this.tray.on('right-click', () => this.tray.popUpContextMenu(this.contextMenu));

        if (this.pressedIcon != null) {
            this.tray.setPressedImage(this.pressedIcon);
        }
        if (this.contextMenu != null && !this.isDarwin()) {
            this.tray.setContextMenu(this.contextMenu);
        }
    }

    updateContextMenu() {
        if (this.contextMenu != null && this.isLinux()) {
            this.tray.setContextMenu(this.contextMenu);
        }
    }

    private hideDock() {
        app.dock.hide();
    }

    private showDock() {
        app.dock.show();
    }

    private isDarwin() {
        return process.platform === 'darwin';
    }

    private isLinux() {
        return process.platform === 'linux';
    }

    private async toggleWindow() {
        if (this.windowMain.win == null) {
            if (this.isDarwin()) {
                // On MacOS, closing the window via the red button destroys the BrowserWindow instance.
                this.windowMain.createWindow().then(() => {
                    this.windowMain.win.show();
                    this.showDock();
                });
            }
            return;
        }
        if (this.windowMain.win.isVisible()) {
            this.windowMain.win.hide();
            if (this.isDarwin() && !await this.storageService.get<boolean>(StorageKey.AlwaysShowDock)) {
                this.hideDock();
            }
        } else {
            this.windowMain.win.show();
            if (this.isDarwin()) {
                this.showDock();
            }
        }
    }

    private closeWindow() {
        this.windowMain.isQuitting = true;
        if (this.windowMain.win != null) {
            this.windowMain.win.close();
        }
    }
}
