/**
 * Extensible logging utility
 */

import * as vscode from 'vscode';
import { ILogger } from '../core/types';

export class OutputChannelLogger implements ILogger {
    private outputChannel: vscode.OutputChannel;
    private enabled: boolean;

    constructor(channelName: string = 'Cursor Helper', enabled: boolean = false) {
        this.outputChannel = vscode.window.createOutputChannel(channelName);
        this.enabled = enabled;
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    info(message: string): void {
        this.log('INFO', message);
    }

    warn(message: string): void {
        this.log('WARN', message);
        if (this.enabled) {
            this.outputChannel.show(true);
        }
    }

    error(message: string, error?: Error): void {
        const errorMsg = error ? `${message}: ${error.message}\n${error.stack}` : message;
        this.log('ERROR', errorMsg);
        this.outputChannel.show(true);
    }

    debug(message: string): void {
        if (this.enabled) {
            this.log('DEBUG', message);
        }
    }

    show(): void {
        this.outputChannel.show();
    }

    dispose(): void {
        this.outputChannel.dispose();
    }

    private log(level: string, message: string): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}`;
        this.outputChannel.appendLine(logMessage);
    }
}

