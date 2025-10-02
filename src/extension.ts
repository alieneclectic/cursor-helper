/**
 * Cursor Helper Extension
 * Main entry point with extensible architecture
 */

import * as vscode from 'vscode';
import { OutputChannelLogger } from './utils/logger';
import { ConfigManager } from './config/configManager';
import { FileWatcher } from './watchers/fileWatcher';
import { ContextWatcher } from './watchers/contextWatcher';
import { FileConfirmationWatcher } from './watchers/fileConfirmationWatcher';
import { VSCodeNotifier } from './notifiers/vscodeNotifier';
import { SoundPlayerFactory } from './sound/soundPlayer';
import { TemplateManager } from './templates/templateManager';
import { TemplateLibraryView } from './templates/templateLibraryView';
import { TaskCompleteEvent, IWatcher, INotifier, ISoundPlayer, TemplateCategory } from './core/types';

/**
 * Extension manager - orchestrates all components
 */
class CursorHelperExtension {
    private logger: OutputChannelLogger;
    private configManager: ConfigManager;
    private watcher: IWatcher | null = null;
    private contextWatcher: IWatcher | null = null;
    private fileConfirmationWatcher: IWatcher | null = null;
    private notifier: INotifier;
    private soundPlayer: ISoundPlayer;
    private templateManager: TemplateManager;
    private disposables: vscode.Disposable[] = [];
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        
        // Initialize core components
        this.logger = new OutputChannelLogger('Cursor Helper');
        this.configManager = new ConfigManager(this.logger);
        this.notifier = new VSCodeNotifier(this.logger);
        this.soundPlayer = SoundPlayerFactory.create(this.logger);
        this.templateManager = new TemplateManager(context, this.logger);

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

            // Start file confirmation watcher if enabled
            if (config.fileConfirmation.enabled) {
                await this.startFileConfirmationWatcher(
                    config.fileConfirmation.flagFile,
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

        if (this.fileConfirmationWatcher) {
            this.fileConfirmationWatcher.stop();
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

        // File confirmation setup command
        const fileConfirmSetupCmd = vscode.commands.registerCommand('cursorHelper.setupFileConfirmation', async () => {
            this.logger.info('File confirmation setup triggered');
            const rule = this.getFileConfirmationRule();
            
            await vscode.env.clipboard.writeText(rule);
            
            const action = await vscode.window.showInformationMessage(
                '✅ File confirmation alert rule copied to clipboard!\n\n' +
                'This rule will alert you when Cursor requests permission to edit a file.\n\n' +
                'Next steps:\n' +
                '1. Open Cursor Settings (Cmd+, or Ctrl+,)\n' +
                '2. Click "Cursor Settings" tab\n' +
                '3. Scroll to "Rules for AI"\n' +
                '4. Paste this rule along with your existing rules\n\n' +
                'This helps you stay aware when AI is asking to modify files.',
                'Open Extension Settings',
                'Test Notification'
            );

            if (action === 'Open Extension Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'cursorHelper.fileConfirmation');
            } else if (action === 'Test Notification') {
                // Manually trigger a file confirmation alert for testing
                await this.handleFileConfirmation({
                    timestamp: new Date(),
                    source: 'test-command',
                    data: { manual: true }
                });
            }
        });

        // Template Library Commands
        const showTemplateLibraryCmd = vscode.commands.registerCommand('cursorHelper.showTemplateLibrary', async () => {
            this.logger.info('Show template library triggered');
            await TemplateLibraryView.show(this.context, this.templateManager, this.logger);
        });

        const insertTemplateCmd = vscode.commands.registerCommand('cursorHelper.insertTemplate', async () => {
            this.logger.info('Insert template triggered');
            await this.insertTemplate();
        });

        const createTemplateFromSelectionCmd = vscode.commands.registerCommand('cursorHelper.createTemplateFromSelection', async () => {
            this.logger.info('Create template from selection triggered');
            await this.createTemplateFromSelection();
        });

        const insertRecentTemplateCmd = vscode.commands.registerCommand('cursorHelper.insertRecentTemplate', async () => {
            this.logger.info('Insert recent template triggered');
            await this.insertRecentTemplate();
        });

        this.disposables.push(
            testNotifyCmd, 
            openSettingsCmd, 
            quickSetupCmd, 
            contextSetupCmd, 
            fileConfirmSetupCmd,
            showTemplateLibraryCmd,
            insertTemplateCmd,
            createTemplateFromSelectionCmd,
            insertRecentTemplateCmd
        );
        this.logger.debug('Commands registered');
    }

    /**
     * Inserts a template into the editor
     */
    private async insertTemplate(): Promise<void> {
        const templates = await this.templateManager.getAllTemplates();
        
        if (templates.length === 0) {
            const action = await vscode.window.showInformationMessage(
                'No templates found. Create your first template!',
                'Open Template Library'
            );
            
            if (action) {
                await TemplateLibraryView.show(this.context, this.templateManager, this.logger);
            }
            return;
        }

        // Group templates by category
        const categories: TemplateCategory[] = ['refactoring', 'debugging', 'testing', 'documentation', 'optimization', 'general'];
        const items: vscode.QuickPickItem[] = [];
        
        for (const category of categories) {
            const categoryTemplates = templates.filter(t => t.category === category);
            if (categoryTemplates.length > 0) {
                items.push({ label: category.toUpperCase(), kind: vscode.QuickPickItemKind.Separator });
                items.push(...categoryTemplates.map(t => ({
                    label: t.name,
                    description: `Used ${t.useCount} times`,
                    detail: t.description,
                    id: t.id
                } as any)));
            }
        }

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a template to insert'
        }) as any;

        if (selected && selected.id) {
            await this.useTemplate(selected.id);
        }
    }

    /**
     * Uses a template (with variable substitution)
     */
    private async useTemplate(id: string): Promise<void> {
        const template = await this.templateManager.getTemplate(id);
        if (!template) {
            return;
        }

        // Extract variables from template
        const variables = this.templateManager.extractVariables(template.content);
        const values: Record<string, string> = {};

        // Prompt user for variable values
        for (const variable of variables) {
            const value = await vscode.window.showInputBox({
                prompt: variable.description || `Enter value for ${variable.name}`,
                placeHolder: variable.defaultValue || '',
                value: variable.defaultValue || ''
            });

            if (value === undefined) {
                return; // User cancelled
            }

            values[variable.name] = value;
        }

        // Substitute variables
        const content = this.templateManager.substituteVariables(template.content, values);

        // Insert into active editor or copy to clipboard
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            await editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, content);
            });
            vscode.window.showInformationMessage('✅ Template inserted!');
        } else {
            await vscode.env.clipboard.writeText(content);
            vscode.window.showInformationMessage('✅ Template copied to clipboard!');
        }

        // Increment use count
        await this.templateManager.incrementUseCount(id);
    }

    /**
     * Creates a template from selected text
     */
    private async createTemplateFromSelection(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) {
            vscode.window.showWarningMessage('Please select text to create a template');
            return;
        }

        const selectedText = editor.document.getText(editor.selection);

        const name = await vscode.window.showInputBox({
            prompt: 'Template name',
            placeHolder: 'My Template'
        });

        if (!name) return;

        const categories: TemplateCategory[] = ['refactoring', 'debugging', 'testing', 'documentation', 'optimization', 'general'];
        const category = await vscode.window.showQuickPick(categories, {
            placeHolder: 'Select category'
        }) as TemplateCategory;

        if (!category) return;

        const description = await vscode.window.showInputBox({
            prompt: 'Description (optional)',
            placeHolder: 'Brief description of the template'
        });

        const tagsInput = await vscode.window.showInputBox({
            prompt: 'Tags (optional, comma-separated)',
            placeHolder: 'e.g., react, typescript, bug-fix'
        });

        const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()) : [];

        await this.templateManager.createTemplate({
            name,
            category,
            description: description || undefined,
            content: selectedText,
            variables: [],
            tags
        });

        vscode.window.showInformationMessage(`✅ Template "${name}" created!`);
    }

    /**
     * Shows recent templates for quick insertion
     */
    private async insertRecentTemplate(): Promise<void> {
        const config = this.configManager.getConfig();
        const recentTemplates = await this.templateManager.getRecentTemplates(config.templateLibrary.recentTemplatesCount);

        if (recentTemplates.length === 0) {
            vscode.window.showInformationMessage('No recent templates');
            return;
        }

        const items = recentTemplates.map(t => ({
            label: t.name,
            description: t.category,
            detail: t.description,
            id: t.id
        } as any));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a recent template'
        });

        if (selected) {
            await this.useTemplate(selected.id);
        }
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
     * Gets the file confirmation Cursor Rule
     */
    private getFileConfirmationRule(): string {
        const platform = process.platform;
        
        if (platform === 'win32') {
            return 'Before asking for confirmation to edit a file, run this command to alert the user:\n' +
                   '<!run:powershell -command "$d=Get-Date; Set-Content -Path $env:USERPROFILE\\.cursor-file-confirm.flag -Value $d;">';
        } else {
            // macOS and Linux
            return 'Before asking for confirmation to edit a file, run this command to alert the user:\n' +
                   '<!run:sh -lc "echo \\"$(date) :: FILE_CONFIRM\\" > $HOME/.cursor-file-confirm.flag">';
        }
    }

    /**
     * Gets the platform-specific Cursor Rule
     */
    private getCursorRuleForPlatform(): string {
        const platform = process.platform;
        
        if (platform === 'win32') {
            return 'At the END of your turn, after you have completely finished all work and before ending your response, run this command to notify the user:\n' +
                   '<!run:powershell -command "$d=Get-Date; Set-Content -Path $env:USERPROFILE\\.cursor-notify.flag -Value $d;">';
        } else {
            // macOS and Linux
            return 'At the END of your turn, after you have completely finished all work and before ending your response, run this command to notify the user:\n' +
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

            // Handle file confirmation monitoring changes
            if (newConfig.fileConfirmation.enabled && !this.fileConfirmationWatcher) {
                // Start file confirmation watcher if it wasn't running
                await this.startFileConfirmationWatcher(
                    newConfig.fileConfirmation.flagFile,
                    newConfig.debounceMs
                );
            } else if (!newConfig.fileConfirmation.enabled && this.fileConfirmationWatcher) {
                // Stop file confirmation watcher if it's been disabled
                this.fileConfirmationWatcher.stop();
                this.fileConfirmationWatcher = null;
            } else if (this.fileConfirmationWatcher instanceof FileConfirmationWatcher) {
                // Update existing file confirmation watcher
                await this.fileConfirmationWatcher.updateFlagFile(newConfig.fileConfirmation.flagFile);
                await this.fileConfirmationWatcher.updateDebounce(newConfig.debounceMs);
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

    private async startFileConfirmationWatcher(flagFile: string, debounceMs: number): Promise<void> {
        this.fileConfirmationWatcher = new FileConfirmationWatcher(
            flagFile,
            debounceMs,
            (event) => this.handleFileConfirmation(event),
            this.logger
        );

        await this.fileConfirmationWatcher.start();
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

    private async handleFileConfirmation(event: TaskCompleteEvent): Promise<void> {
        this.logger.info(`File confirmation alert from ${event.source} at ${event.timestamp.toISOString()}`);
        
        const config = this.configManager.getConfig();

        try {
            // Show notification with file confirmation message
            await this.notifier.notify(config.fileConfirmation.message);

            // Play sound if enabled
            if (config.playSound) {
                const soundPath = config.customSoundPath || undefined;
                await this.soundPlayer.play(soundPath);
            }

            this.logger.info('File confirmation alert handling finished successfully');
        } catch (error) {
            this.logger.error('Error handling file confirmation alert', error as Error);
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

