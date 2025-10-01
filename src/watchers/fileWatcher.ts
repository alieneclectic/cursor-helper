/**
 * File-based watcher implementation with debouncing
 */

import * as fs from 'fs';
import * as path from 'path';
import { IWatcher, TaskCompleteEvent } from '../core/types';
import { ILogger } from '../core/types';
import { normalizePath, getParentDir, getFileName } from '../utils/path';

export type WatchEventHandler = (event: TaskCompleteEvent) => void;

export class FileWatcher implements IWatcher {
    private logger: ILogger;
    private flagFilePath: string;
    private debounceMs: number;
    private eventHandler: WatchEventHandler;
    private watcher: fs.FSWatcher | null = null;
    private debounceTimer: NodeJS.Timeout | null = null;
    private active: boolean = false;

    constructor(
        flagFilePath: string,
        debounceMs: number,
        eventHandler: WatchEventHandler,
        logger: ILogger
    ) {
        this.flagFilePath = normalizePath(flagFilePath);
        this.debounceMs = debounceMs;
        this.eventHandler = eventHandler;
        this.logger = logger;
    }

    async start(): Promise<void> {
        if (this.active) {
            this.logger.warn('FileWatcher already active');
            return;
        }

        try {
            // Ensure flag file exists
            await this.ensureFlagFile();

            // Watch the parent directory (more reliable than watching the file directly)
            const parentDir = getParentDir(this.flagFilePath);
            const fileName = getFileName(this.flagFilePath);

            this.logger.info(`Starting file watcher on: ${this.flagFilePath}`);
            this.logger.debug(`Watching directory: ${parentDir} for file: ${fileName}`);

            this.watcher = fs.watch(parentDir, (eventType, filename) => {
                // Only process events for our target file
                if (filename === fileName) {
                    this.logger.debug(`File change detected: ${eventType} on ${filename}`);
                    this.handleFileChange();
                }
            });

            this.watcher.on('error', (error) => {
                this.logger.error('File watcher error', error);
            });

            this.active = true;
            this.logger.info('File watcher started successfully');
        } catch (error) {
            this.logger.error('Failed to start file watcher', error as Error);
            throw error;
        }
    }

    stop(): void {
        if (!this.active) {
            return;
        }

        this.logger.info('Stopping file watcher');

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }

        this.active = false;
        this.logger.info('File watcher stopped');
    }

    isActive(): boolean {
        return this.active;
    }

    /**
     * Updates the flag file path and restarts the watcher
     */
    async updateFlagFile(newPath: string): Promise<void> {
        this.logger.info(`Updating flag file path to: ${newPath}`);
        const wasActive = this.active;
        
        if (wasActive) {
            this.stop();
        }

        this.flagFilePath = normalizePath(newPath);

        if (wasActive) {
            await this.start();
        }
    }

    /**
     * Updates debounce time
     */
    updateDebounce(ms: number): void {
        this.debounceMs = ms;
        this.logger.debug(`Debounce time updated to: ${ms}ms`);
    }

    private handleFileChange(): void {
        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Set new debounced timer
        this.debounceTimer = setTimeout(() => {
            this.logger.debug('Debounced file change triggered');
            
            const event: TaskCompleteEvent = {
                timestamp: new Date(),
                source: 'file-watcher',
                data: { filePath: this.flagFilePath }
            };

            this.eventHandler(event);
            this.debounceTimer = null;
        }, this.debounceMs);
    }

    private async ensureFlagFile(): Promise<void> {
        const parentDir = getParentDir(this.flagFilePath);

        // Create parent directory if it doesn't exist
        if (!fs.existsSync(parentDir)) {
            this.logger.info(`Creating parent directory: ${parentDir}`);
            fs.mkdirSync(parentDir, { recursive: true });
        }

        // Create flag file if it doesn't exist
        if (!fs.existsSync(this.flagFilePath)) {
            this.logger.info(`Creating flag file: ${this.flagFilePath}`);
            fs.writeFileSync(this.flagFilePath, `Created by Cursor Helper on ${new Date().toISOString()}\n`);
        } else {
            this.logger.debug(`Flag file already exists: ${this.flagFilePath}`);
        }
    }
}

