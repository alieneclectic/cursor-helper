/**
 * Context window monitoring watcher
 * Watches for context capacity alerts from Cursor
 */

import * as fs from 'fs';
import { IWatcher, TaskCompleteEvent } from '../core/types';
import { ILogger } from '../core/types';
import { normalizePath, getParentDir, getFileName } from '../utils/path';

export type ContextAlertHandler = (event: TaskCompleteEvent) => void;

export class ContextWatcher implements IWatcher {
    private logger: ILogger;
    private flagFilePath: string;
    private debounceMs: number;
    private eventHandler: ContextAlertHandler;
    private watcher: fs.FSWatcher | null = null;
    private debounceTimer: NodeJS.Timeout | null = null;
    private active: boolean = false;

    constructor(
        flagFilePath: string,
        debounceMs: number,
        eventHandler: ContextAlertHandler,
        logger: ILogger
    ) {
        this.flagFilePath = normalizePath(flagFilePath);
        this.debounceMs = debounceMs;
        this.eventHandler = eventHandler;
        this.logger = logger;
    }

    async start(): Promise<void> {
        if (this.active) {
            this.logger.warn('ContextWatcher already active');
            return;
        }

        try {
            // Ensure flag file exists
            await this.ensureFlagFile();

            // Watch the parent directory
            const parentDir = getParentDir(this.flagFilePath);
            const fileName = getFileName(this.flagFilePath);

            this.logger.info(`Starting context watcher on: ${this.flagFilePath}`);
            this.logger.debug(`Watching directory: ${parentDir} for file: ${fileName}`);

            this.watcher = fs.watch(parentDir, (eventType, filename) => {
                // Only process events for our target file
                if (filename === fileName) {
                    this.logger.debug(`Context alert detected: ${eventType} on ${filename}`);
                    this.handleContextAlert();
                }
            });

            this.watcher.on('error', (error) => {
                this.logger.error('Context watcher error', error);
            });

            this.active = true;
            this.logger.info('Context watcher started successfully');
        } catch (error) {
            this.logger.error('Failed to start context watcher', error as Error);
            throw error;
        }
    }

    stop(): void {
        if (!this.active) {
            return;
        }

        this.logger.info('Stopping context watcher');

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }

        this.active = false;
        this.logger.info('Context watcher stopped');
    }

    isActive(): boolean {
        return this.active;
    }

    /**
     * Updates the flag file path and restarts the watcher
     */
    async updateFlagFile(newPath: string): Promise<void> {
        this.logger.info(`Updating context flag file path to: ${newPath}`);
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
        this.logger.debug(`Context watcher debounce time updated to: ${ms}ms`);
    }

    private handleContextAlert(): void {
        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Set new debounced timer
        this.debounceTimer = setTimeout(() => {
            this.logger.debug('Debounced context alert triggered');
            
            // Read the file to get context info
            let contextData: any = {};
            try {
                const fileContent = fs.readFileSync(this.flagFilePath, 'utf-8');
                // Try to parse context data if it's in JSON format
                try {
                    contextData = JSON.parse(fileContent);
                } catch {
                    // If not JSON, just include the raw content
                    contextData = { raw: fileContent.trim() };
                }
            } catch (error) {
                this.logger.warn('Could not read context flag file content');
            }

            const event: TaskCompleteEvent = {
                timestamp: new Date(),
                source: 'context-watcher',
                data: { 
                    filePath: this.flagFilePath,
                    ...contextData
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
            this.logger.info(`Creating context flag file: ${this.flagFilePath}`);
            fs.writeFileSync(this.flagFilePath, `Created by Cursor Helper on ${new Date().toISOString()}\n`);
        } else {
            this.logger.debug(`Context flag file already exists: ${this.flagFilePath}`);
        }
    }
}

