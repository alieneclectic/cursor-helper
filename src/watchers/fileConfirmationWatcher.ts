/**
 * File confirmation monitoring watcher
 * Watches for file edit confirmation requests from Cursor
 */

import * as fs from 'fs';
import { IWatcher, TaskCompleteEvent } from '../core/types';
import { ILogger } from '../core/types';
import { normalizePath, getParentDir, getFileName } from '../utils/path';

export type FileConfirmationHandler = (event: TaskCompleteEvent) => void;

export class FileConfirmationWatcher implements IWatcher {
    private logger: ILogger;
    private flagFilePath: string;
    private debounceMs: number;
    private eventHandler: FileConfirmationHandler;
    private watcher: fs.FSWatcher | null = null;
    private debounceTimer: NodeJS.Timeout | null = null;
    private active: boolean = false;

    constructor(
        flagFilePath: string,
        debounceMs: number,
        eventHandler: FileConfirmationHandler,
        logger: ILogger
    ) {
        this.flagFilePath = normalizePath(flagFilePath);
        this.debounceMs = debounceMs;
        this.eventHandler = eventHandler;
        this.logger = logger;
    }

    async start(): Promise<void> {
        if (this.active) {
            this.logger.warn('FileConfirmationWatcher already active');
            return;
        }

        try {
            // Ensure flag file exists
            await this.ensureFlagFile();

            // Watch the parent directory
            const parentDir = getParentDir(this.flagFilePath);
            const fileName = getFileName(this.flagFilePath);

            this.logger.info(`Starting file confirmation watcher on: ${this.flagFilePath}`);
            this.logger.debug(`Watching directory: ${parentDir} for file: ${fileName}`);

            this.watcher = fs.watch(parentDir, (eventType, filename) => {
                // Only process events for our target file
                if (filename === fileName) {
                    this.logger.debug(`File confirmation detected: ${eventType} on ${filename}`);
                    this.handleFileConfirmation();
                }
            });

            this.watcher.on('error', (error) => {
                this.logger.error('File confirmation watcher error', error);
            });

            this.active = true;
            this.logger.info('File confirmation watcher started successfully');
        } catch (error) {
            this.logger.error('Failed to start file confirmation watcher', error as Error);
            throw error;
        }
    }

    stop(): void {
        if (!this.active) {
            return;
        }

        this.logger.info('Stopping file confirmation watcher');

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }

        this.active = false;
        this.logger.info('File confirmation watcher stopped');
    }

    isActive(): boolean {
        return this.active;
    }

    /**
     * Updates the flag file path and restarts the watcher
     */
    async updateFlagFile(newPath: string): Promise<void> {
        this.logger.info(`Updating file confirmation flag file path to: ${newPath}`);
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
        this.logger.debug(`File confirmation watcher debounce time updated to: ${ms}ms`);
    }

    private handleFileConfirmation(): void {
        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Set new debounced timer
        this.debounceTimer = setTimeout(() => {
            this.logger.debug('Debounced file confirmation triggered');
            
            // Read the file to get any additional info
            let confirmationData: any = {};
            try {
                const fileContent = fs.readFileSync(this.flagFilePath, 'utf-8');
                // Try to parse confirmation data if it's in JSON format
                try {
                    confirmationData = JSON.parse(fileContent);
                } catch {
                    // If not JSON, just include the raw content
                    confirmationData = { raw: fileContent.trim() };
                }
            } catch (error) {
                this.logger.warn('Could not read file confirmation flag file content');
            }

            const event: TaskCompleteEvent = {
                timestamp: new Date(),
                source: 'file-confirmation-watcher',
                data: { 
                    filePath: this.flagFilePath,
                    ...confirmationData
                }
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
            this.logger.info(`Creating file confirmation flag file: ${this.flagFilePath}`);
            fs.writeFileSync(this.flagFilePath, `Created by Cursor Helper on ${new Date().toISOString()}\n`);
        } else {
            this.logger.debug(`File confirmation flag file already exists: ${this.flagFilePath}`);
        }
    }
}

