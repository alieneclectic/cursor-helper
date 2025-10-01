/**
 * Cursor Helper Extension
 * Main entry point with extensible architecture
 */

import * as vscode from 'vscode';
import { OutputChannelLogger } from './utils/logger';
import { ConfigManager } from './config/configManager';
import { FileWatcher } from './watchers/fileWatcher';
import { VSCodeNotifier } from './notifiers/vscodeNotifier';
import { SoundPlayerFactory } from './sound/soundPlayer';
import { TaskCompleteEvent, IWatcher, INotifier, ISoundPlayer } from './core/types';

/**
 * Extension manager - orchestrates all components
 */
class CursorHelperExtension {
    private logger: OutputChannelLogger;
    private configManager: ConfigManager;
    private watcher: IWatcher | null = null;
    private notifier: INotifier;
    private soundPlayer: ISoundPlayer;
    private disposables: vscode.Disposable[] = [];

    constructor(context: vscode.ExtensionContext) {
        // Initialize core components
        this.logger = new OutputChannelLogger('Cursor Helper');
        this.configManager = new ConfigManager(this.logger);
        this.notifier = new VSCodeNotifier(this.logger);
        this.soundPlayer = SoundPlayerFactory.create(this.logger);

        // Register for disposal
        context.subscriptions.push(this.logger);
        this.disposables.push(this.configManager);

        this.logger.info('Cursor Helper extension initializing...');
    }

    async activate(): Promise<void> {
        try {
            // Load initial configuration
            const config = this.configManager.getConfig();
            this.logger.setEnabled(config.enableLogging);

            // Register commands
            this.registerCommands();

            // Watch for config changes
            this.watchConfigChanges();

            // Start file watcher
            await this.startWatcher(config.flagFile, config.debounceMs);

            this.logger.info('Cursor Helper extension activated successfully');
        } catch (error) {
            this.logger.error('Failed to activate extension', error as Error);
            vscode.window.showErrorMessage('Cursor Helper failed to activate. Check output for details.');
        }
    }

    deactivate(): void {
        this.logger.info('Cursor Helper extension deactivating...');
        
        if (this.watcher) {
            this.watcher.stop();
        }

        this.disposables.forEach(d => d.dispose());
        this.logger.info('Cursor Helper extension deactivated');
    }

    private registerCommands(): void {
        // Test notification command
        const testNotifyCmd = vscode.commands.registerCommand('cursorHelper.testNotify', async () => {
            this.logger.info('Test notification triggered');
            const config = this.configManager.getConfig();
            
            await this.handleTaskComplete({
                timestamp: new Date(),
                source: 'test-command',
                data: { manual: true }
            });

            vscode.window.showInformationMessage('Cursor Helper test complete!');
        });

        // Open settings command
        const openSettingsCmd = vscode.commands.registerCommand('cursorHelper.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'cursorHelper');
        });

        this.disposables.push(testNotifyCmd, openSettingsCmd);
        this.logger.debug('Commands registered');
    }

    private watchConfigChanges(): void {
        const configWatcher = this.configManager.watchConfigChanges();
        
        this.configManager.onConfigChange(async (newConfig) => {
            this.logger.setEnabled(newConfig.enableLogging);
            this.logger.info('Configuration updated, reloading...');

            // Check if flag file path changed
            if (this.watcher instanceof FileWatcher) {
                await this.watcher.updateFlagFile(newConfig.flagFile);
                await this.watcher.updateDebounce(newConfig.debounceMs);
            }

            this.logger.info('Configuration reload complete');
        });

        this.disposables.push(configWatcher);
    }

    private async startWatcher(flagFile: string, debounceMs: number): Promise<void> {
        this.watcher = new FileWatcher(
            flagFile,
            debounceMs,
            (event) => this.handleTaskComplete(event),
            this.logger
        );

        await this.watcher.start();
    }

    private async handleTaskComplete(event: TaskCompleteEvent): Promise<void> {
        this.logger.info(`Task complete event from ${event.source} at ${event.timestamp.toISOString()}`);

        const config = this.configManager.getConfig();

        try {
            // Show notification
            await this.notifier.notify(config.message);

            // Play sound if enabled
            if (config.playSound) {
                const soundPath = config.customSoundPath || undefined;
                await this.soundPlayer.play(soundPath);
            }

            this.logger.info('Task complete handling finished successfully');
        } catch (error) {
            this.logger.error('Error handling task complete event', error as Error);
        }
    }
}

/**
 * Extension activation entry point
 */
let extensionInstance: CursorHelperExtension | null = null;

export function activate(context: vscode.ExtensionContext) {
    extensionInstance = new CursorHelperExtension(context);
    return extensionInstance.activate();
}

export function deactivate() {
    if (extensionInstance) {
        extensionInstance.deactivate();
        extensionInstance = null;
    }
}

