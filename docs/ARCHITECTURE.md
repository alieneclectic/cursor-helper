# Architecture Overview

This document explains the architectural design of Cursor Helper and how the components work together.

## Design Principles

1. **Extensibility First**: All major components implement interfaces, making it easy to add new implementations
2. **Separation of Concerns**: Each module has a single, well-defined responsibility
3. **Dependency Injection**: Components receive dependencies rather than creating them
4. **Event-Driven**: Uses event emitters for loose coupling between components
5. **Cross-Platform**: Platform-specific code is abstracted behind interfaces

## Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Extension Host                        │
│                  (extension.ts)                          │
│                                                          │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Config     │  │ Logger   │  │ Commands │            │
│  │ Manager    │  │          │  │          │            │
│  └────────────┘  └──────────┘  └──────────┘            │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Task Complete Event Handler            │    │
│  │                                                 │    │
│  │   ┌─────────┐   ┌──────────┐   ┌──────────┐   │    │
│  │   │ Watcher │ → │ Notifier │ → │  Sound   │   │    │
│  │   │ (File)  │   │ (VSCode) │   │  Player  │   │    │
│  │   └─────────┘   └──────────┘   └──────────┘   │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Core Interfaces

### IWatcher

Watches for task completion events from various sources.

```typescript
interface IWatcher {
    start(): Promise<void>;      // Begin watching
    stop(): void;                // Stop watching
    isActive(): boolean;         // Check if active
}
```

**Current Implementations:**
- `FileWatcher`: Watches a flag file for changes

**Future Implementations:**
- `HttpWatcher`: Listens for webhook calls
- `LogWatcher`: Tails log files for specific patterns
- `ProcessWatcher`: Monitors process completion

### INotifier

Displays notifications to the user.

```typescript
interface INotifier {
    notify(message: string): Promise<void>;
}
```

**Current Implementations:**
- `VSCodeNotifier`: Shows VS Code information messages
- `RichNotifier`: Shows notifications with action buttons

**Future Implementations:**
- `WebhookNotifier`: Sends to external webhooks
- `EmailNotifier`: Sends email notifications
- `SlackNotifier`: Posts to Slack channels

### ISoundPlayer

Plays sound files across different platforms.

```typescript
interface ISoundPlayer {
    canPlay(): boolean;          // Check if supported on this platform
    play(soundPath?: string): Promise<void>;
}
```

**Current Implementations:**
- `MacOSSoundPlayer`: Uses `afplay` on macOS
- `WindowsSoundPlayer`: Uses PowerShell on Windows
- `LinuxSoundPlayer`: Uses `paplay`/`aplay` on Linux
- `NoOpSoundPlayer`: Fallback for unsupported platforms

**Future Implementations:**
- `WebAudioPlayer`: Browser-based audio (for webview)
- `CustomBinaryPlayer`: Support for more audio formats

### ILogger

Handles logging with multiple severity levels.

```typescript
interface ILogger {
    info(message: string): void;
    warn(message: string): void;
    error(message: string, error?: Error): void;
    debug(message: string): void;
    show(): void;
}
```

**Current Implementations:**
- `OutputChannelLogger`: Logs to VS Code output channel

## Component Lifecycle

### Activation Flow

```
1. Extension activates (onStartupFinished)
   ↓
2. Initialize Logger
   ↓
3. Initialize ConfigManager
   ↓
4. Load initial configuration
   ↓
5. Create Notifier and SoundPlayer
   ↓
6. Register commands
   ↓
7. Start FileWatcher
   ↓
8. Watch for config changes
   ↓
9. Ready!
```

### Event Flow (Task Complete)

```
1. Flag file changes
   ↓
2. FileWatcher detects change (debounced)
   ↓
3. Fires TaskCompleteEvent
   ↓
4. Extension handleTaskComplete()
   ↓
5. Show notification (INotifier)
   ↓
6. Play sound (ISoundPlayer, if enabled)
   ↓
7. Log event (ILogger)
```

### Configuration Change Flow

```
1. User changes settings
   ↓
2. VS Code fires onDidChangeConfiguration
   ↓
3. ConfigManager detects change
   ↓
4. Fires onConfigChange event
   ↓
5. Extension updates components:
   - Update logger enabled state
   - Update watcher flag file path
   - Update watcher debounce time
   ↓
6. Ready with new config!
```

### Deactivation Flow

```
1. Extension deactivates
   ↓
2. Stop watcher
   ↓
3. Dispose all disposables
   ↓
4. Logger cleanup
   ↓
5. Done!
```

## Directory Structure

```
src/
├── core/
│   └── types.ts              # All interfaces and type definitions
│
├── config/
│   └── configManager.ts      # Configuration loading and watching
│
├── watchers/
│   └── fileWatcher.ts        # File-based watcher implementation
│
├── notifiers/
│   └── vscodeNotifier.ts     # VS Code notification implementations
│
├── sound/
│   └── soundPlayer.ts        # Sound playback implementations
│
├── utils/
│   ├── logger.ts             # Logging utility
│   └── path.ts               # Path utilities (cross-platform)
│
└── extension.ts              # Main entry point, orchestration
```

## Extension Points

### Adding a New Watcher

1. Create file in `src/watchers/`
2. Implement `IWatcher`
3. Add factory or direct instantiation in `extension.ts`
4. Add configuration options to `package.json`

Example:
```typescript
// src/watchers/httpWatcher.ts
export class HttpWatcher implements IWatcher {
    constructor(
        private port: number,
        private eventHandler: WatchEventHandler,
        private logger: ILogger
    ) {}

    async start(): Promise<void> {
        // Start HTTP server
    }

    stop(): void {
        // Stop HTTP server
    }

    isActive(): boolean {
        return this.active;
    }
}
```

### Adding a New Notifier

1. Create file in `src/notifiers/`
2. Implement `INotifier`
3. Use in extension or make it configurable

Example:
```typescript
// src/notifiers/webhookNotifier.ts
export class WebhookNotifier implements INotifier {
    constructor(
        private webhookUrl: string,
        private logger: ILogger
    ) {}

    async notify(message: string): Promise<void> {
        await fetch(this.webhookUrl, {
            method: 'POST',
            body: JSON.stringify({ message })
        });
    }
}
```

### Adding a New Sound Player

1. Add class to `src/sound/soundPlayer.ts`
2. Extend `BaseSoundPlayer`
3. Add to `SoundPlayerFactory.create()`

Example:
```typescript
class CustomSoundPlayer extends BaseSoundPlayer {
    canPlay(): boolean {
        return /* platform check */;
    }

    async play(soundPath?: string): Promise<void> {
        // Play sound
    }
}
```

## Error Handling Strategy

1. **Graceful Degradation**: If a component fails, others continue
2. **User Feedback**: Errors shown via notifications when critical
3. **Detailed Logging**: All errors logged to output channel
4. **No Crashes**: Catch and log errors, don't propagate to VS Code

## Testing Strategy

### Manual Testing
- Test command for notifications
- Development host (F5) for live testing
- Multi-platform validation

### Future Automated Testing
- Unit tests for each interface implementation
- Integration tests for component interaction
- E2E tests with `vscode-extension-tester`

## Performance Considerations

1. **Debouncing**: File watcher uses debouncing to prevent event spam
2. **Lazy Loading**: Components initialized only when needed
3. **Async Operations**: File I/O and sound playback are async
4. **Resource Cleanup**: All watchers and listeners properly disposed

## Security Considerations

1. **No External Calls**: Extension runs entirely locally
2. **Path Validation**: User-provided paths are normalized and validated
3. **File Permissions**: Graceful handling of permission errors
4. **No Telemetry**: No data collection or external communication

## Future Architecture Enhancements

1. **Plugin System**: Load external watchers/notifiers dynamically
2. **Multiple Watchers**: Support multiple simultaneous watchers
3. **Event Bus**: Central event bus for component communication
4. **State Management**: Centralized state for complex workflows
5. **WebView UI**: Rich configuration interface
6. **Task Queue**: Queue and deduplicate rapid events

---

This architecture enables easy extension while maintaining code quality and separation of concerns.

