# Cursor Helper

A powerful VS Code/Cursor extension that enhances your AI-assisted coding experience with notifications and intelligent monitoring.

## ✨ Features

- 🔔 **Smart Notifications**: Desktop alerts for task completion, context capacity, and file confirmations
- 📚 **Prompt Template Library**: Save, organize, and reuse effective prompts with variable substitution
- 🔊 **Cross-Platform Sound**: Native sound support for macOS, Windows, and Linux
- ⚙️ **Highly Configurable**: Extensive settings for messages, sounds, and thresholds
- 🔒 **Privacy First**: Runs entirely locally, no telemetry or external calls

## 📑 Table of Contents

- [Quick Start](#-quick-start)
- [Features Deep Dive](#-features-deep-dive)
  - [Task Notifications](#task-notifications)
  - [Prompt Template Library](#prompt-template-library)
  - [Context Monitoring](#context-monitoring)
  - [File Confirmations](#file-confirmations)
- [Configuration](#%EF%B8%8F-configuration)
- [Commands](#-commands)
- [Troubleshooting](#-troubleshooting)
- [Development](#-development)
- [Contributing](#-contributing)

## 🚀 Quick Start

### 1. Installation

**From VSIX** (Recommended for testing)
```bash
npm install && npm run build && npm run package
```
Install the generated `.vsix` via **Extensions → Install from VSIX...**

**From Source** (Development)
```bash
git clone https://github.com/alieneclectic/cursor-helper.git
cd cursor-helper
npm install
```
Press `F5` to launch Extension Development Host

### 2. Setup Notifications

**Easy Method:**
1. Open Command Palette: `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
2. Run: `Cursor Helper: Quick Setup (Copy Rule)`
3. Follow the prompts to add the rule to Cursor

**Manual Method** - Add this to Cursor Settings:

<details>
<summary><b>macOS/Linux</b></summary>

```text
At the END of your turn, after you have completely finished all work and before ending your response, run this command to notify the user:
<!run:sh -lc "echo \"$(date) :: CURSOR_DONE\" > $HOME/.cursor-notify.flag">
```
</details>

<details>
<summary><b>Windows</b></summary>

```text
At the END of your turn, after you have completely finished all work and before ending your response, run this command to notify the user:
<!run:powershell -command "$d=Get-Date; Set-Content -Path $env:USERPROFILE\.cursor-notify.flag -Value $d;">
```
</details>

### 3. Test It

Run `Cursor Helper: Test Notification` from the Command Palette. You should see a notification and hear a sound! 🎉

## 🎯 Features Deep Dive

### Task Notifications

Get instant desktop notifications when Cursor completes tasks. The extension watches a flag file that Cursor updates via a custom rule. When detected, you'll receive a notification with optional sound.

**How it works:**
1. Add the Cursor rule (see Quick Start)
2. Cursor AI completes a task → updates flag file
3. Extension detects change → triggers notification

### Prompt Template Library

Save, organize, and reuse your most effective prompts with powerful variable substitution. Perfect for standardizing workflows and sharing best practices with your team.

**Key Features:**
- 📝 **Create from scratch or selection**: Convert any text into a reusable template
- 🔄 **Variable substitution**: Use `{{variableName}}` for dynamic placeholders
- 📂 **Category organization**: Refactoring, Debugging, Testing, Documentation, Optimization, General
- 🏷️ **Tags & search**: Easily find templates with tags and full-text search
- 📊 **Usage tracking**: See which templates are most effective
- 🔀 **Import/Export**: Share templates across projects and teams
- ⭐ **8 default templates**: Get started immediately with curated examples

**Quick Start:**
1. Run: `Cursor Helper: Open Template Library`
2. Browse default templates or create your own
3. Use `Cursor Helper: Insert Template` to add to your prompt

**Variable Syntax:**
- `{{name}}` - Simple placeholder
- `{{name:description}}` - With descriptive prompt
- `{{name:description:default}}` - With default value

**Example Template:**
```
Please refactor {{fileName:Name of the file}} to improve {{goal:Refactoring goal::readability}}.

Focus on:
- Code clarity
- Performance
- {{customFocus:Additional focus area::Error handling}}
```

**Learn More:** See [TEMPLATE_LIBRARY_GUIDE.md](TEMPLATE_LIBRARY_GUIDE.md) for detailed documentation.

### Context Monitoring

Get alerted when Cursor's context window nears capacity so you can start fresh or summarize.

**Setup:**
1. Run: `Cursor Helper: Setup Context Window Monitoring`
2. Or manually add this rule to Cursor Settings:

<details>
<summary><b>macOS/Linux</b></summary>

```text
When the context window usage exceeds 90%, run this command to alert the user:
<!run:sh -lc "echo \"$(date) :: CONTEXT_ALERT\" > $HOME/.cursor-context-alert.flag">
```
</details>

<details>
<summary><b>Windows</b></summary>

```text
When the context window usage exceeds 90%, run this command to alert the user:
<!run:powershell -command "$d=Get-Date; Set-Content -Path $env:USERPROFILE\.cursor-context-alert.flag -Value $d;">
```
</details>

Adjust threshold in settings (default: 90%)

### File Confirmations

Get notified when Cursor requests permission to edit files, so you never miss an important approval.

**Setup:**
1. Run: `Cursor Helper: Setup File Confirmation Alerts`
2. Or manually add this rule to Cursor Settings:

<details>
<summary><b>macOS/Linux</b></summary>

```text
Before asking for confirmation to edit a file, run this command to alert the user:
<!run:sh -lc "echo \"$(date) :: FILE_CONFIRM\" > $HOME/.cursor-file-confirm.flag">
```
</details>

<details>
<summary><b>Windows</b></summary>

```text
Before asking for confirmation to edit a file, run this command to alert the user:
<!run:powershell -command "$d=Get-Date; Set-Content -Path $env:USERPROFILE\.cursor-file-confirm.flag -Value $d;">
```
</details>

## ⚙️ Configuration

<details>
<summary><b>All Settings</b></summary>

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `cursorHelper.flagFile` | string | `~/.cursor-notify.flag` | Task completion flag file path |
| `cursorHelper.message` | string | `Cursor task complete` | Notification message |
| `cursorHelper.playSound` | boolean | `true` | Enable sound on completion |
| `cursorHelper.customSoundPath` | string | `""` | Custom sound file path |
| `cursorHelper.debounceMs` | number | `500` | Debounce time (ms) |
| `cursorHelper.enableLogging` | boolean | `false` | Enable debug logging |
| **Context Monitoring** ||||
| `contextMonitoring.enabled` | boolean | `true` | Enable context alerts |
| `contextMonitoring.flagFile` | string | `~/.cursor-context-alert.flag` | Context flag file |
| `contextMonitoring.message` | string | `⚠️ Context window at capacity` | Alert message |
| `contextMonitoring.threshold` | number | `90` | Alert threshold (%) |
| **File Confirmations** ||||
| `fileConfirmation.enabled` | boolean | `true` | Enable file edit alerts |
| `fileConfirmation.flagFile` | string | `~/.cursor-file-confirm.flag` | File confirm flag |
| `fileConfirmation.message` | string | `📝 Cursor is requesting file edit permission` | Alert message |
| **Template Library** ||||
| `templateLibrary.enabled` | boolean | `true` | Enable template library |
| `templateLibrary.showInCommandPalette` | boolean | `true` | Show in command palette |
| `templateLibrary.recentTemplatesCount` | number | `5` | Number of recent templates |

</details>

**Example Configuration:**
```json
{
  "cursorHelper.message": "✅ Task complete!",
  "cursorHelper.customSoundPath": "/System/Library/Sounds/Hero.aiff",
  "cursorHelper.contextMonitoring.threshold": 85
}
```

**Platform-Specific Sounds:**
- **macOS**: `/System/Library/Sounds/Hero.aiff`
- **Windows**: `C:\Users\YourName\Music\complete.wav`
- **Linux**: `/home/username/sounds/complete.wav`

## 💻 Commands

Access via Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):

| Command | Description |
|---------|-------------|
| `Quick Setup (Copy Rule)` | One-click setup with platform-specific rule |
| `Setup Context Window Monitoring` | Setup context capacity alerts |
| `Setup File Confirmation Alerts` | Setup file edit confirmation alerts |
| `Open Template Library` | Browse and manage prompt templates |
| `Insert Template` | Insert a template into current editor |
| `Create Template from Selection` | Create a new template from selected text |
| `Insert Recent Template` | Quick access to recently used templates |
| `Test Notification` | Test notification and sound |
| `Open Settings` | Open extension settings |

## 🐛 Troubleshooting

<details>
<summary><b>Notifications Not Working</b></summary>

1. **Enable logging** and check output:
   ```json
   { "cursorHelper.enableLogging": true }
   ```
   View: **View → Output → Cursor Helper**

2. **Verify flag file exists:**
   ```bash
   # macOS/Linux
   ls -la ~/.cursor-notify.flag
   # Windows
   Test-Path $env:USERPROFILE\.cursor-notify.flag
   ```

3. **Test manually:**
   ```bash
   echo "test" > ~/.cursor-notify.flag
   ```

4. **Common issues:**
   - Network drives don't support file watching (use local paths)
   - Multiple notifications? Increase `debounceMs`
   - Rule not added to Cursor Settings?

</details>

<details>
<summary><b>Sound Not Playing</b></summary>

- **macOS**: Check `afplay` exists: `which afplay`
- **Linux**: Install audio utilities:
  ```bash
  sudo apt-get install pulseaudio-utils  # or alsa-utils
  ```
- **Windows**: PowerShell works by default
- **All**: Test custom path in settings

</details>

## 🔧 Development

**Build & Run:**
```bash
npm install              # Install dependencies
npm run build            # Build TypeScript
npm run watch            # Watch mode for development
npm run package          # Create .vsix package
```

**Debug:**
1. Open project in VS Code/Cursor
2. Press `F5` to launch Extension Development Host
3. Test commands via Command Palette
4. View logs: **View → Output → Cursor Helper**

**Architecture:**
```
src/
├── core/types.ts                    # Core interfaces
├── config/configManager.ts          # Settings management
├── watchers/                        # File watchers
├── notifiers/vscodeNotifier.ts      # Notification handler
├── sound/soundPlayer.ts             # Cross-platform audio
├── templates/                       # Prompt template library
└── extension.ts                     # Entry point
```

The codebase uses interfaces (`IWatcher`, `INotifier`, `ISoundPlayer`) making it easy to extend with new functionality.

## 🤝 Contributing

Contributions welcome! The extension is designed for extensibility.

**Quick Start:**
1. Fork & clone
2. `npm install` → Make changes → `npm run watch`
3. Press `F5` to test
4. Submit PR with clear description

**Contribution Ideas:**
- New watcher types (HTTP, logs, processes)
- Webhook notifications
- Rich notifications with actions
- Automated tests

**Standards:** TypeScript strict mode, interfaces over types, async/await, JSDoc for public APIs

## 📜 Changelog

**v0.7.1** (2025-10-02)
- 🗑️ **REMOVED**: Token tracking feature (was non-functional without automatic API integration)
- 🧹 Cleaned up codebase and reduced complexity
- ✨ Focus on core working features: notifications, templates, and monitoring

**v0.7.0** (2025-10-02)
- 📚 **NEW**: Prompt Template Library with variable substitution
- 🔄 Save and reuse effective prompts across projects
- 📂 Category organization and tag-based search
- 📊 Usage tracking and analytics
- 🔀 Import/Export templates for team sharing
- ⭐ 8 curated default templates included

**v0.6.1** (2025-10-02)
- 🐛 Fixed: Notifications now trigger only when Cursor is completely done, not on individual step success
- 📝 Updated Cursor Rule to be more explicit about end-of-turn timing

**v0.6.0** (2025-10-02)
- 🐛 Fixed notification timing (removed in v0.7.1)

**v0.5.0** (2025-10-01)
- 📝 File edit confirmation alerts

**v0.2.0** (2025-10-01)
- ⚠️ Context window monitoring

**v0.1.0** (2025-10-01)
- 🎉 Initial release with notifications & sounds

<details>
<summary>View full changelog</summary>

### [0.7.1] - Code Cleanup & Feature Removal
- Removed non-functional token tracking feature
- Token tracking required manual input and lacked automatic API integration
- Cleaned up 500+ lines of unused code and dependencies
- Improved codebase maintainability and focus
- Updated documentation to reflect current feature set

### [0.7.0] - Prompt Template Library
- Added comprehensive prompt template management system
- Variable substitution with `{{variable}}` syntax
- Category organization and tag-based search
- Import/Export templates for team collaboration
- 8 curated default templates included
- Usage tracking and analytics

### [0.6.1] - Bug Fix: Notification Timing
- Fixed notifications triggering on individual step success instead of completion
- Updated Cursor Rule to explicitly request end-of-turn execution
- Added UPDATE_RULE.md guide for users to update their rules
- Improved rule clarity with "At the END of your turn" phrasing

### [0.5.0] - File Confirmations
- File edit confirmation alerts
- FileConfirmationWatcher implementation
- Setup command and configuration options

### [0.2.0] - Context Monitoring
- Context window capacity monitoring
- Configurable threshold alerts
- Setup command and configuration

### [0.1.0] - Initial Release
- File-based task completion detection
- Cross-platform notifications and sounds
- Extensible architecture with interfaces
- Quick setup commands
- Configuration hot-reload

</details>

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Support

- **Issues**: [GitHub Issues](https://github.com/alieneclectic/cursor-helper/issues)
- **Discussions**: [GitHub Discussions](https://github.com/alieneclectic/cursor-helper/discussions)
- **Star**: If this helps you, please ⭐ star the repo!

Built with ❤️ for the Cursor AI community.

---

**Enjoy Cursor Helper!** 🎉
