/**
 * VS Code notification implementation
 */

import * as vscode from 'vscode';
import { INotifier } from '../core/types';
import { ILogger } from '../core/types';

export enum NotificationType {
    Info = 'info',
    Warning = 'warning',
    Error = 'error'
}

export class VSCodeNotifier implements INotifier {
    private logger: ILogger;
    private notificationType: NotificationType;

    constructor(logger: ILogger, type: NotificationType = NotificationType.Info) {
        this.logger = logger;
        this.notificationType = type;
    }

    async notify(message: string): Promise<void> {
        this.logger.info(`Showing notification: ${message}`);

        switch (this.notificationType) {
            case NotificationType.Info:
                vscode.window.showInformationMessage(message);
                break;
            case NotificationType.Warning:
                vscode.window.showWarningMessage(message);
                break;
            case NotificationType.Error:
                vscode.window.showErrorMessage(message);
                break;
        }
    }

    setType(type: NotificationType): void {
        this.notificationType = type;
    }
}

/**
 * Rich notifier with action buttons
 * Example of how to extend notification capabilities
 */
export class RichNotifier implements INotifier {
    private logger: ILogger;
    private actions: Map<string, () => void>;

    constructor(logger: ILogger) {
        this.logger = logger;
        this.actions = new Map();
    }

    addAction(label: string, callback: () => void): void {
        this.actions.set(label, callback);
    }

    async notify(message: string): Promise<void> {
        this.logger.info(`Showing rich notification: ${message}`);
        
        const actionLabels = Array.from(this.actions.keys());
        const selected = await vscode.window.showInformationMessage(
            message,
            ...actionLabels
        );

        if (selected && this.actions.has(selected)) {
            const action = this.actions.get(selected);
            action?.();
        }
    }
}

