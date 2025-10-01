/**
 * Cursor Helper Extension
 * Main entry point with extensible architecture
 */

import * as vscode from 'vscode';
import { OutputChannelLogger } from './utils/logger';
import { ConfigManager } from './config/configManager';
import { FileWatcher } from './watchers/fileWatcher';
import { ContextWatcher } from './watchers/contextWatcher';
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
    private contextWatcher: IWatcher | null = null;
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

            // Start context watcher if enabled
            if (config.contextMonitoring.enabled) {
                await this.startContextWatcher(
                    config.contextMonitoring.flagFile,
                    config.debounceMs
                );
            }

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

        if (this.contextWatcher) {
            this.contextWatcher.stop();
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

        // Quick setup command - copies Cursor Rule to clipboard
        const quickSetupCmd = vscode.commands.registerCommand('cursorHelper.quickSetup', async () => {
            this.logger.info('Quick setup triggered');
            const rule = this.getCursorRuleForPlatform();
            
            await vscode.env.clipboard.writeText(rule);
            
            const action = await vscode.window.showInformationMessage(
                '✅ Cursor Rule copied to clipboard!\n\n' +
                'Next steps:\n' +
                '1. Open Cursor Settings (Cmd+, or Ctrl+,)\n' +
                '2. Click "Cursor Settings" tab\n' +
                '3. Scroll to "Rules for AI"\n' +
                '4. Paste the rule\n\n' +
                'The rule will auto-trigger notifications when tasks complete!',
                'Open Cursor Settings',
                'Test Notification'
            );

            if (action === 'Open Cursor Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', '@ext:cursorHelper');
            } else if (action === 'Test Notification') {
                vscode.commands.executeCommand('cursorHelper.testNotify');
            }
        });

        // Context monitoring setup command
        const contextSetupCmd = vscode.commands.registerCommand('cursorHelper.setupContextMonitoring', async () => {
            this.logger.info('Context monitoring setup triggered');
            const rule = this.getContextMonitoringRule();
            
            await vscode.env.clipboard.writeText(rule);
            
            const action = await vscode.window.showInformationMessage(
                '✅ Context monitoring rule copied to clipboard!\n\n' +
                'This rule will automatically alert you when the context window reaches capacity.\n\n' +
                'Next steps:\n' +
                '1. Open Cursor Settings (Cmd+, or Ctrl+,)\n' +
                '2. Click "Cursor Settings" tab\n' +
                '3. Scroll to "Rules for AI"\n' +
                '4. Paste this rule along with your existing rules\n\n' +
                'You can adjust the threshold in extension settings.',
                'Open Extension Settings',
                'Test Notification'
            );

            if (action === 'Open Extension Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'cursorHelper.contextMonitoring');
            } else if (action === 'Test Notification') {
                // Manually trigger a context alert for testing
                await this.handleContextAlert({
                    timestamp: new Date(),
                    source: 'test-command',
                    data: { manual: true }
                });
            }
        });

        this.disposables.push(testNotifyCmd, openSettingsCmd, quickSetupCmd, contextSetupCmd);
        this.logger.debug('Commands registered');
    }

    /**
     * Gets the context monitoring Cursor Rule
     */
    private getContextMonitoringRule(): string {
        const platform = process.platform;
        const config = this.configManager.getConfig();
        const threshold = config.contextMonitoring.threshold;
        
        if (platform === 'win32') {
            return `When the context window usage exceeds ${threshold}%, run this command to alert the user:\n` +
                   '<!run:powershell -command "$d=Get-Date; Set-Content -Path $env:USERPROFILE\\.cursor-context-alert.flag -Value $d;">';
        } else {
            // macOS and Linux
            return `When the context window usage exceeds ${threshold}%, run this command to alert the user:\n` +
                   '<!run:sh -lc "echo \\"$(date) :: CONTEXT_ALERT\\" > $HOME/.cursor-context-alert.flag">';
        }
    }

    /**
     * Gets the platform-specific Cursor Rule
     */
    private getCursorRuleForPlatform(): string {
        const platform = process.platform;
        
        if (platform === 'win32') {
            return 'When you complete a task, run this command to notify the user:\n' +
                   '<!run:powershell -command "$d=Get-Date; Set-Content -Path $env:USERPROFILE\\.cursor-notify.flag -Value $d;">';
        } else {
            // macOS and Linux
            return 'When you complete a task, run this command to notify the user:\n' +
                   '<!run:sh -lc "echo \\"$(date) :: CURSOR_DONE\\" > $HOME/.cursor-notify.flag">';
        }
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

            // Handle context monitoring changes
            if (newConfig.contextMonitoring.enabled && !this.contextWatcher) {
                // Start context watcher if it wasn't running
                await this.startContextWatcher(
                    newConfig.contextMonitoring.flagFile,
                    newConfig.debounceMs
                );
            } else if (!newConfig.contextMonitoring.enabled && this.contextWatcher) {
                // Stop context watcher if it's been disabled
                this.contextWatcher.stop();
                this.contextWatcher = null;
            } else if (this.contextWatcher instanceof ContextWatcher) {
                // Update existing context watcher
                await this.contextWatcher.updateFlagFile(newConfig.contextMonitoring.flagFile);
                await this.contextWatcher.updateDebounce(newConfig.debounceMs);
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

    private async startContextWatcher(flagFile: string, debounceMs: number): Promise<void> {
        this.contextWatcher = new ContextWatcher(
            flagFile,
            debounceMs,
            (event) => this.handleContextAlert(event),
            this.logger
        );

        await this.contextWatcher.start();
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

    private async handleContextAlert(event: TaskCompleteEvent): Promise<void> {
        this.logger.info(`Context alert from ${event.source} at ${event.timestamp.toISOString()}`);
        
        const config = this.configManager.getConfig();

        try {
            // Show notification with context-specific message
            await this.notifier.notify(config.contextMonitoring.message);

            // Play sound if enabled
            if (config.playSound) {
                const soundPath = config.customSoundPath || undefined;
                await this.soundPlayer.play(soundPath);
            }

            this.logger.info('Context alert handling finished successfully');
        } catch (error) {
            this.logger.error('Error handling context alert', error as Error);
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

