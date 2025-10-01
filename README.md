# Cursor Helper

Get notified when your Cursor AI tasks complete! 🎉

Cursor Helper is a lightweight VS Code/Cursor extension that monitors a flag file and triggers desktop notifications with optional sounds when your AI-assisted coding tasks finish.

## ✨ Features

- 🔔 **Desktop Notifications**: Get notified instantly when tasks complete
- 🔊 **Cross-Platform Sound**: Plays completion sounds on macOS, Windows, and Linux
- ⚙️ **Highly Configurable**: Customize messages, sounds, and behavior
- 🔧 **Extensible Architecture**: Easy to add new notification types and watchers
- 📝 **Detailed Logging**: Optional output channel for debugging

## 🚀 Quick Start

### Installation

1. **From VSIX** (Development):
   ```bash
   npm install
   npm run build
   npm run package
   ```
   Then install the generated `.vsix` file via **Extensions → Install from VSIX...**

2. **From Source**:
   - Clone this repository
   - Run `npm install`
   - Press `F5` to open Extension Development Host

### Setup with Cursor Rules

To trigger notifications automatically, add a Cursor Rule that updates the flag file when tasks complete:

#### macOS/Linux Rule:
```text
<!run:sh -lc "echo \"$(date) :: CURSOR_DONE\" > $HOME/.cursor-notify.flag">
```

#### Windows Rule:
```text
<!run:powershell -command "$d=Get-Date; Set-Content -Path $env:USERPROFILE\.cursor-notify.flag -Value $d;">
```

Add this rule to your Cursor Rules configuration to automatically trigger notifications when the AI completes tasks.

## ⚙️ Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `cursorHelper.flagFile` | string | `~/.cursor-notify.flag` | Path to the flag file to watch |
| `cursorHelper.message` | string | `Cursor task complete` | Notification message to display |
| `cursorHelper.playSound` | boolean | `true` | Play a sound when tasks complete |
| `cursorHelper.customSoundPath` | string | `""` | Path to custom sound file (empty = system default) |
| `cursorHelper.debounceMs` | number | `500` | Debounce time for file change events (ms) |
| `cursorHelper.enableLogging` | boolean | `false` | Enable detailed logging to output channel |

### Example Configuration

```json
{
  "cursorHelper.flagFile": "~/projects/.cursor-done",
  "cursorHelper.message": "✅ AI task finished!",
  "cursorHelper.playSound": true,
  "cursorHelper.customSoundPath": "~/sounds/complete.wav",
  "cursorHelper.debounceMs": 1000,
  "cursorHelper.enableLogging": true
}
```

## 🎯 Usage

### Manual Test

Use the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):
- **Cursor Helper: Test Notification** - Trigger a test notification
- **Cursor Helper: Open Settings** - Open extension settings

### Automatic Triggering

Once you've added the Cursor Rule, the extension will automatically:
1. Watch the configured flag file
2. Detect when it's updated by Cursor
3. Show a notification
4. Play a sound (if enabled)

## 🔊 Sound Support

### macOS
- Default: System sound (`/System/Library/Sounds/Glass.aiff`)
- Custom: Any `.aiff` or `.wav` file via `customSoundPath`

### Windows
- Default: Console beep (800Hz, 300ms)
- Custom: `.wav` files via PowerShell `Media.SoundPlayer`

### Linux
- Attempts `paplay` (PulseAudio) → `aplay` (ALSA) → terminal bell
- Custom sound support for `.wav` and `.oga` files

## 🏗️ Architecture

The extension is built with extensibility in mind:

```
src/
├── core/
│   └── types.ts              # Interfaces and types
├── config/
│   └── configManager.ts      # Configuration management
├── watchers/
│   └── fileWatcher.ts        # File watching (extensible)
├── notifiers/
│   └── vscodeNotifier.ts     # Notification handlers (extensible)
├── sound/
│   └── soundPlayer.ts        # Sound playback (extensible)
├── utils/
│   ├── logger.ts             # Logging utilities
│   └── path.ts               # Path utilities
└── extension.ts              # Main entry point
```

### Extending the Extension

#### Add a New Watcher

Implement the `IWatcher` interface:

```typescript
import { IWatcher, TaskCompleteEvent } from './core/types';

export class MyCustomWatcher implements IWatcher {
    async start(): Promise<void> { /* ... */ }
    stop(): void { /* ... */ }
    isActive(): boolean { /* ... */ }
}
```

#### Add a New Notifier

Implement the `INotifier` interface:

```typescript
import { INotifier } from './core/types';

export class MyCustomNotifier implements INotifier {
    async notify(message: string): Promise<void> { /* ... */ }
}
```

#### Add a New Sound Player

Implement the `ISoundPlayer` interface:

```typescript
import { ISoundPlayer } from './core/types';

export class MyCustomSoundPlayer implements ISoundPlayer {
    canPlay(): boolean { /* ... */ }
    async play(soundPath?: string): Promise<void> { /* ... */ }
}
```

## 🐛 Troubleshooting

### Notifications Not Appearing

1. Check that the flag file path is correct (supports `~` expansion)
2. Ensure the parent directory exists and is writable
3. Enable logging: `"cursorHelper.enableLogging": true`
4. Check Output panel: **View → Output → Cursor Helper**

### Sound Not Playing

1. Verify your system has a compatible sound player:
   - macOS: `afplay` (built-in)
   - Windows: PowerShell (built-in)
   - Linux: `paplay` or `aplay` (install `pulseaudio-utils` or `alsa-utils`)
2. Test with a custom sound file to ensure it exists and is readable
3. Check logs for errors

### File Watcher Issues

- Some network drives or cloud storage folders may not support file watching
- Try using a local path for the flag file
- Increase `debounceMs` if you're getting multiple notifications

## 🔒 Privacy

This extension:
- ✅ Runs entirely locally
- ✅ No telemetry or analytics
- ✅ No external network calls
- ✅ No data collection

## 📝 Development

### Building from Source

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch

# Package for distribution
npm run package
```

### Debugging

1. Open the project in VS Code/Cursor
2. Press `F5` to launch Extension Development Host
3. Set breakpoints in TypeScript files
4. Use Command Palette to test commands

## 🤝 Contributing

Contributions are welcome! This extension is designed to be extensible:

- Add new watcher types (HTTP endpoints, log file tailing, etc.)
- Add new notification types (rich notifications, webhooks, etc.)
- Add new sound players or platform support
- Improve error handling and edge cases

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

## 🗺️ Roadmap

- [ ] Status bar integration with task status
- [ ] Multiple flag file support with labels
- [ ] Webhook notification mode
- [ ] Log file tailing mode
- [ ] Rich notifications with action buttons
- [ ] Rate limiting and cooldown
- [ ] Bundled default sounds
- [ ] E2E test suite

## 🙏 Acknowledgments

Built for the Cursor AI community to enhance the AI-assisted coding experience.

---

**Enjoy! 🎉** If you find this extension helpful, please star the repository and share it with others!

