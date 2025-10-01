/**
 * Configuration management with live reload support
 */

import * as vscode from 'vscode';
import { CursorHelperConfig } from '../core/types';
import { ILogger } from '../core/types';

export class ConfigManager {
    private static readonly CONFIG_SECTION = 'cursorHelper';
    private logger: ILogger;
    private changeEmitter = new vscode.EventEmitter<CursorHelperConfig>();
    
    public readonly onConfigChange = this.changeEmitter.event;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    /**
     * Gets the current configuration
     */
    getConfig(): CursorHelperConfig {
        const config = vscode.workspace.getConfiguration(ConfigManager.CONFIG_SECTION);
        
        return {
            flagFile: config.get<string>('flagFile', '~/.cursor-notify.flag'),
            message: config.get<string>('message', 'Cursor task complete'),
            playSound: config.get<boolean>('playSound', true),
            customSoundPath: config.get<string>('customSoundPath', ''),
            debounceMs: config.get<number>('debounceMs', 500),
            enableLogging: config.get<boolean>('enableLogging', false)
        };
    }

    /**
     * Watches for configuration changes
     */
    watchConfigChanges(): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
            if (event.affectsConfiguration(ConfigManager.CONFIG_SECTION)) {
                this.logger.info('Configuration changed');
                const newConfig = this.getConfig();
                this.changeEmitter.fire(newConfig);
            }
        });
    }

    /**
     * Updates a specific configuration value
     */
    async updateConfig<K extends keyof CursorHelperConfig>(
        key: K,
        value: CursorHelperConfig[K],
        global: boolean = true
    ): Promise<void> {
        const config = vscode.workspace.getConfiguration(ConfigManager.CONFIG_SECTION);
        await config.update(key, value, global);
        this.logger.info(`Updated config: ${key} = ${value}`);
    }

    dispose(): void {
        this.changeEmitter.dispose();
    }
}

