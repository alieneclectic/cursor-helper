# Cursor Helper

Get notified when your Cursor AI tasks complete! 🎉

Cursor Helper is a lightweight VS Code/Cursor extension that monitors a flag file and triggers desktop notifications with optional sounds when your AI-assisted coding tasks finish.

## ✨ Features

- 🔔 **Desktop Notifications**: Get notified instantly when tasks complete
- 🔊 **Cross-Platform Sound**: Plays completion sounds on macOS, Windows, and Linux
- ⚙️ **Highly Configurable**: Customize messages, sounds, and behavior
- 🔧 **Extensible Architecture**: Easy to add new notification types and watchers
- 📝 **Detailed Logging**: Optional output channel for debugging
- 🔒 **Privacy First**: Runs entirely locally, no telemetry or external calls

## 🚀 Quick Start

### Installation

**Option 1: From VSIX** (Development/Testing)
```bash
npm install
npm run build
npm run package
```
Then install the generated `.vsix` file via **Extensions → Install from VSIX...**

**Option 2: From Source** (Development)
```bash
git clone https://github.com/your-username/cursor-helper.git
cd cursor-helper
npm install
```
Press `F5` in VS Code/Cursor to open Extension Development Host

### Setup Cursor Rule (Automatic Notifications)

The easiest way to get automatic notifications:

1. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: `Cursor Helper: Quick Setup (Copy Rule)`
3. Press Enter and follow the instructions

**Or manually add this rule to Cursor Settings:**

**macOS/Linux:**
```text
When you complete a task, run this command to notify the user:
<!run:sh -lc "echo \"$(date) :: CURSOR_DONE\" > $HOME/.cursor-notify.flag">
```

**Windows:**
```text
When you complete a task, run this command to notify the user:
<!run:powershell -command "$d=Get-Date; Set-Content -Path $env:USERPROFILE\.cursor-notify.flag -Value $d;">
```

### Test It Works

1. Press `Cmd+Shift+P` / `Ctrl+Shift+P`
2. Type: `Cursor Helper: Test Notification`
3. You should see a notification and hear a sound! 🎉

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

### Platform-Specific Sound Paths

**macOS** (system sounds):
```json
{
  "cursorHelper.customSoundPath": "/System/Library/Sounds/Hero.aiff"
}
```

**Windows** (custom WAV):
```json
{
  "cursorHelper.customSoundPath": "C:\\Users\\YourName\\Music\\complete.wav"
}
```

**Linux** (custom sound):
```json
{
  "cursorHelper.customSoundPath": "/home/username/sounds/complete.wav"
}
```

## 🎯 Usage

### Commands

Use the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):
- **Cursor Helper: Quick Setup (Copy Rule)** - Easy one-click setup with platform-specific rule
- **Cursor Helper: Test Notification** - Trigger a test notification
- **Cursor Helper: Open Settings** - Open extension settings

### How It Works

1. You add the Cursor Rule (see Quick Start)
2. When Cursor AI completes a task, the rule executes
3. The rule updates the flag file with a timestamp
4. Extension detects the file change
5. You get a notification and sound! 🎉

## 🔊 Sound Support

### macOS
- Default: System sound (`/System/Library/Sounds/Glass.aiff`)
- Custom: Any `.aiff` or `.wav` file via `customSoundPath`
- Uses built-in `afplay` command

### Windows
- Default: Console beep (800Hz, 300ms)
- Custom: `.wav` files via PowerShell `Media.SoundPlayer`

### Linux
- Attempts `paplay` (PulseAudio) → `aplay` (ALSA) → terminal bell
- Custom support for `.wav` and `.oga` files
- Install utilities: `sudo apt-get install pulseaudio-utils` or `alsa-utils`

## 🏗️ Architecture

The extension is built with extensibility in mind:

```
src/
├── core/
│   └── types.ts              # Interfaces (IWatcher, INotifier, ISoundPlayer, ILogger)
├── config/
│   └── configManager.ts      # Configuration management with hot-reload
├── watchers/
│   └── fileWatcher.ts        # File watching with debouncing (extensible)
├── notifiers/
│   └── vscodeNotifier.ts     # Notification handlers (extensible)
├── sound/
│   └── soundPlayer.ts        # Cross-platform sound playback (extensible)
├── utils/
│   ├── logger.ts             # Logging utilities
│   └── path.ts               # Path utilities
└── extension.ts              # Main entry point
```

### Extensibility

All major components implement interfaces, making it easy to extend:

**Add a New Watcher:**
```typescript
import { IWatcher, TaskCompleteEvent } from './core/types';

export class HttpWatcher implements IWatcher {
    async start(): Promise<void> { /* ... */ }
    stop(): void { /* ... */ }
    isActive(): boolean { /* ... */ }
}
```

**Add a New Notifier:**
```typescript
import { INotifier } from './core/types';

export class WebhookNotifier implements INotifier {
    async notify(message: string): Promise<void> { /* ... */ }
}
```

**Add a New Sound Player:**
```typescript
import { ISoundPlayer } from './core/types';

export class CustomSoundPlayer implements ISoundPlayer {
    canPlay(): boolean { /* ... */ }
    async play(soundPath?: string): Promise<void> { /* ... */ }
}
```

## 🐛 Troubleshooting

### Notifications Not Appearing

1. **Check flag file path:**
   ```bash
   # macOS/Linux
   ls -la ~/.cursor-notify.flag
   
   # Windows PowerShell
   Test-Path $env:USERPROFILE\.cursor-notify.flag
   ```

2. **Enable logging:**
   - Set `"cursorHelper.enableLogging": true`
   - View Output: **View → Output → Cursor Helper**

3. **Test manually:**
   ```bash
   # macOS/Linux
   echo "test" > ~/.cursor-notify.flag
   
   # Windows
   echo "test" > %USERPROFILE%\.cursor-notify.flag
   ```

### Sound Not Playing

**macOS:**
```bash
# Check afplay
which afplay
afplay /System/Library/Sounds/Glass.aiff
```

**Linux:**
```bash
# Install sound utilities (Ubuntu/Debian)
sudo apt-get install pulseaudio-utils
# Or ALSA
sudo apt-get install alsa-utils
```

**Windows:** PowerShell should work by default

### File Watcher Issues

- Network drives or cloud storage may not support file watching
- Try using a local path for the flag file
- Increase `debounceMs` if getting multiple notifications

## 🔧 Development

### Building from Source

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Package for distribution
npm run package
```

### Debugging

1. Open the project in VS Code/Cursor
2. Press `F5` to launch Extension Development Host
3. Set breakpoints in TypeScript files
4. Use Command Palette to test commands
5. Check Output panel (View → Output → Cursor Helper) for logs

### Testing

1. **Test Command:** `Cursor Helper: Test Notification`
2. **Manual Flag Update:** `echo "test" > ~/.cursor-notify.flag`
3. **Watch Mode:** Run `npm run watch` and press `F5`
4. **VSIX Install:** `npm run package` then install the `.vsix` file

### Project Structure

```
cursor-helper/
├── src/                      # TypeScript source files
├── out/                      # Compiled JavaScript (generated)
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript configuration
├── .vscode/                  # VS Code debug configuration
│   ├── launch.json
│   └── tasks.json
└── README.md                 # This file
```

## 🤝 Contributing

Contributions are welcome! This extension is designed to be extensible.

### Getting Started

1. Fork and clone the repository
2. Run `npm install`
3. Make changes in `src/` directory
4. Run `npm run build` or `npm run watch`
5. Press `F5` to test in Extension Development Host

### Coding Standards

- Use TypeScript strict mode
- Prefer interfaces over types for extensibility
- Use async/await over callbacks
- Document public APIs with JSDoc comments
- Run `npm run lint` before committing

### Areas for Contribution

- Add new watcher types (HTTP endpoints, log file tailing, process monitoring)
- Add new notification types (webhooks, rich notifications with buttons)
- Add new sound players or platform support
- Improve error handling and edge cases
- Add automated tests
- Improve documentation

### Pull Request Process

1. Update README.md if adding new features
2. Ensure all tests pass and linting is clean
3. Create a Pull Request with:
   - Clear description of changes
   - Screenshots/GIFs for UI changes
   - Platform testing notes

## 📜 Changelog

### [0.1.0] - 2025-10-01

**Added:**
- Initial release of Cursor Helper extension
- File-based task completion detection via flag file
- Cross-platform desktop notifications
- Cross-platform sound playback (macOS/Windows/Linux)
- Configurable settings (flag file path, message, sound, debounce, logging)
- Quick Setup command with platform-specific rules
- Test Notification and Open Settings commands
- Extensible architecture with interfaces
- Hot-reload configuration support
- Output channel logging for debugging

## 🗺️ Roadmap

- [ ] Status bar integration with task status
- [ ] Multiple flag file support with labels
- [ ] Webhook notification mode
- [ ] Log file tailing mode
- [ ] Rich notifications with action buttons
- [ ] Rate limiting and cooldown
- [ ] Bundled default sounds
- [ ] E2E test suite
- [ ] VS Code Marketplace publication

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

Built for the Cursor AI community to enhance the AI-assisted coding experience.

---

**Enjoy!** 🎉 If you find this extension helpful, please star the repository and share it with others!
