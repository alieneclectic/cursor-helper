/**
 * Path utilities for cross-platform compatibility
 */

import * as path from 'path';
import * as os from 'os';

/**
 * Expands home directory (~) in paths
 */
export function expandHome(filepath: string): string {
    if (filepath.startsWith('~/') || filepath === '~') {
        return path.join(os.homedir(), filepath.slice(1));
    }
    return filepath;
}

/**
 * Normalizes path for cross-platform use
 */
export function normalizePath(filepath: string): string {
    return path.normalize(expandHome(filepath));
}

/**
 * Gets the parent directory of a file path
 */
export function getParentDir(filepath: string): string {
    return path.dirname(filepath);
}

/**
 * Gets the filename from a path
 */
export function getFileName(filepath: string): string {
    return path.basename(filepath);
}

/**
 * Checks if a path is absolute
 */
export function isAbsolutePath(filepath: string): boolean {
    return path.isAbsolute(filepath);
}

