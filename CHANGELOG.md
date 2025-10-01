# Changelog

All notable changes to the Cursor Helper extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-10-01

### Added
- Initial release of Cursor Helper extension
- File-based task completion detection via flag file
- Cross-platform desktop notifications (VS Code information messages)
- Cross-platform sound playback:
  - macOS: `afplay` support with system sounds
  - Windows: PowerShell beep and WAV playback
  - Linux: `paplay` and `aplay` support with fallbacks
- Configurable settings:
  - Custom flag file path with `~` expansion
  - Custom notification messages
  - Optional sound playback
  - Custom sound file paths
  - Configurable debounce time
  - Optional detailed logging
- Command Palette commands:
  - Test Notification command
  - Open Settings command
- Extensible architecture:
  - Interface-based watchers (`IWatcher`)
  - Interface-based notifiers (`INotifier`)
  - Interface-based sound players (`ISoundPlayer`)
  - Modular component structure
- File watcher with debouncing for reliable event detection
- Automatic flag file creation if missing
- Output channel logging for debugging
- Hot-reload configuration support
- Comprehensive error handling
- MIT License
- Complete documentation (README, CONTRIBUTING)

### Features for Future Releases
- Status bar integration
- Multiple flag file support with labels
- HTTP webhook notification mode
- Log file tailing mode
- Rich notifications with action buttons
- Rate limiting and cooldown
- Bundled default sound files
- E2E test suite
- VS Code Marketplace publication

[Unreleased]: https://github.com/your-username/cursor-helper/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-username/cursor-helper/releases/tag/v0.1.0

