/**
 * Core types and interfaces for extensibility
 */

import * as vscode from 'vscode';

/**
 * Configuration interface
 */
export interface CursorHelperConfig {
    flagFile: string;
    message: string;
    playSound: boolean;
    customSoundPath: string;
    debounceMs: number;
    enableLogging: boolean;
    contextMonitoring: {
        enabled: boolean;
        flagFile: string;
        message: string;
        threshold: number;
    };
    fileConfirmation: {
        enabled: boolean;
        flagFile: string;
        message: string;
    };
}

/**
 * Base interface for all watchers
 * Implement this to add new watcher types (HTTP, log files, etc.)
 */
export interface IWatcher {
    start(): Promise<void>;
    stop(): void;
    isActive(): boolean;
}

/**
 * Base interface for all notifiers
 * Implement this to add new notification types (rich notifications, webhooks, etc.)
 */
export interface INotifier {
    notify(message: string): Promise<void>;
}

/**
 * Base interface for sound players
 * Implement this to add platform-specific or custom sound players
 */
export interface ISoundPlayer {
    play(soundPath?: string): Promise<void>;
    canPlay(): boolean;
}

/**
 * Event emitted when a task completes
 */
export interface TaskCompleteEvent {
    timestamp: Date;
    source: string;
    data?: any;
}

/**
 * Logger interface for extensible logging
 */
export interface ILogger {
    info(message: string): void;
    warn(message: string): void;
    error(message: string, error?: Error): void;
    debug(message: string): void;
    show(): void;
}

/**
 * Extension context wrapper for dependency injection
 */
export interface IExtensionContext {
    subscriptions: vscode.Disposable[];
    extensionPath: string;
    workspaceState: vscode.Memento;
    globalState: vscode.Memento;
}

