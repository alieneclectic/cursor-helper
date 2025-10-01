/**
 * Cross-platform sound playback with extensible player support
 */

import * as os from 'os';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ISoundPlayer } from '../core/types';
import { ILogger } from '../core/types';
import { normalizePath } from '../utils/path';

const execAsync = promisify(exec);

/**
 * Base sound player class
 */
abstract class BaseSoundPlayer implements ISoundPlayer {
    protected logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
    }

    abstract play(soundPath?: string): Promise<void>;
    abstract canPlay(): boolean;

    protected async executeCommand(command: string): Promise<void> {
        try {
            await execAsync(command);
            this.logger.debug(`Sound command executed: ${command}`);
        } catch (error) {
            this.logger.warn(`Failed to execute sound command: ${error}`);
            throw error;
        }
    }

    protected fileExists(path: string): boolean {
        try {
            return fs.existsSync(path);
        } catch {
            return false;
        }
    }
}

/**
 * macOS sound player using afplay
 */
class MacOSSoundPlayer extends BaseSoundPlayer {
    private readonly defaultSound = '/System/Library/Sounds/Glass.aiff';

    canPlay(): boolean {
        return os.platform() === 'darwin';
    }

    async play(soundPath?: string): Promise<void> {
        const path = soundPath || this.defaultSound;
        const normalizedPath = normalizePath(path);

        if (!this.fileExists(normalizedPath)) {
            this.logger.warn(`Sound file not found: ${normalizedPath}, using default`);
            await this.executeCommand(`afplay "${this.defaultSound}"`);
            return;
        }

        await this.executeCommand(`afplay "${normalizedPath}"`);
    }
}

/**
 * Windows sound player using PowerShell
 */
class WindowsSoundPlayer extends BaseSoundPlayer {
    canPlay(): boolean {
        return os.platform() === 'win32';
    }

    async play(soundPath?: string): Promise<void> {
        if (soundPath) {
            const normalizedPath = normalizePath(soundPath);
            if (this.fileExists(normalizedPath)) {
                const command = `powershell -c "(New-Object Media.SoundPlayer '${normalizedPath}').PlaySync();"`;
                await this.executeCommand(command);
                return;
            }
        }

        // Fallback to console beep
        const command = 'powershell -c "[console]::beep(800, 300)"';
        await this.executeCommand(command);
    }
}

/**
 * Linux sound player with multiple fallbacks
 */
class LinuxSoundPlayer extends BaseSoundPlayer {
    canPlay(): boolean {
        return os.platform() === 'linux';
    }

    async play(soundPath?: string): Promise<void> {
        const normalizedPath = soundPath ? normalizePath(soundPath) : undefined;

        // Try paplay first (PulseAudio)
        if (await this.tryCommand('which paplay')) {
            if (normalizedPath && this.fileExists(normalizedPath)) {
                await this.executeCommand(`paplay "${normalizedPath}"`);
                return;
            }
            // Use default system sound
            await this.executeCommand('paplay /usr/share/sounds/freedesktop/stereo/complete.oga').catch(() => {
                this.logger.debug('Default paplay sound not found');
            });
            return;
        }

        // Try aplay (ALSA)
        if (await this.tryCommand('which aplay')) {
            if (normalizedPath && this.fileExists(normalizedPath)) {
                await this.executeCommand(`aplay "${normalizedPath}"`);
                return;
            }
        }

        // Fallback to terminal bell
        this.logger.debug('Using terminal bell fallback');
        process.stdout.write('\x07');
    }

    private async tryCommand(command: string): Promise<boolean> {
        try {
            await execAsync(command);
            return true;
        } catch {
            return false;
        }
    }
}

/**
 * Factory for creating platform-specific sound players
 */
export class SoundPlayerFactory {
    static create(logger: ILogger): ISoundPlayer {
        const players: ISoundPlayer[] = [
            new MacOSSoundPlayer(logger),
            new WindowsSoundPlayer(logger),
            new LinuxSoundPlayer(logger)
        ];

        const player = players.find(p => p.canPlay());
        
        if (!player) {
            logger.warn('No suitable sound player found for this platform');
            return new NoOpSoundPlayer();
        }

        logger.debug(`Using sound player: ${player.constructor.name}`);
        return player;
    }
}

/**
 * No-op sound player for unsupported platforms
 */
class NoOpSoundPlayer implements ISoundPlayer {
    canPlay(): boolean {
        return false;
    }

    async play(_soundPath?: string): Promise<void> {
        // Do nothing
    }
}

