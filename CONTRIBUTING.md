# Contributing to Cursor Helper

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## 🏗️ Architecture Overview

Cursor Helper is built with extensibility as a core principle. The codebase is organized into modular components:

### Core Interfaces (`src/core/types.ts`)

All major components implement interfaces:
- `IWatcher` - For different event sources (file, HTTP, logs)
- `INotifier` - For different notification types (VS Code, webhooks, etc.)
- `ISoundPlayer` - For platform-specific sound playback
- `ILogger` - For logging implementations

### Component Directories

```
src/
├── core/           # Interfaces and types
├── config/         # Configuration management
├── watchers/       # Event source implementations
├── notifiers/      # Notification implementations
├── sound/          # Sound player implementations
├── utils/          # Shared utilities
└── extension.ts    # Main orchestration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- VS Code or Cursor IDE
- Git

### Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/your-username/cursor-helper.git
   cd cursor-helper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Start development:
   ```bash
   npm run watch
   ```

5. Press `F5` in VS Code to launch the Extension Development Host

## 🔧 Development Workflow

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the coding standards

3. Test your changes in the Extension Development Host

4. Build and verify:
   ```bash
   npm run build
   npm run lint
   ```

### Testing

1. Press `F5` to launch Extension Development Host
2. Use **Command Palette → Cursor Helper: Test Notification**
3. Test with actual flag file updates
4. Verify on multiple platforms if possible

## 🎯 Adding New Features

### Adding a New Watcher

1. Create a new file in `src/watchers/`
2. Implement the `IWatcher` interface:

```typescript
import { IWatcher, TaskCompleteEvent } from '../core/types';
import { ILogger } from '../core/types';

export class MyNewWatcher implements IWatcher {
    constructor(private logger: ILogger) {}

    async start(): Promise<void> {
        // Start watching
    }

    stop(): void {
        // Stop watching
    }

    isActive(): boolean {
        return this.active;
    }
}
```

3. Register in `extension.ts`

### Adding a New Notifier

1. Create a new file in `src/notifiers/`
2. Implement the `INotifier` interface:

```typescript
import { INotifier } from '../core/types';

export class MyNewNotifier implements INotifier {
    async notify(message: string): Promise<void> {
        // Send notification
    }
}
```

### Adding a New Sound Player

1. Add to `src/sound/soundPlayer.ts`
2. Implement the `ISoundPlayer` interface
3. Add platform detection in `SoundPlayerFactory`

## 📝 Coding Standards

### TypeScript

- Use strict TypeScript mode
- Prefer interfaces over types for extensibility
- Use async/await over callbacks
- Document public APIs with JSDoc comments

### Naming Conventions

- Classes: `PascalCase`
- Interfaces: `IPascalCase` (with I prefix)
- Files: `camelCase.ts`
- Constants: `UPPER_SNAKE_CASE`

### Code Style

- Use 4 spaces for indentation
- Single quotes for strings
- Semicolons required
- Run `npm run lint` before committing

### Comments

```typescript
/**
 * Public API documentation
 * @param message The message to display
 */
public async notify(message: string): Promise<void> {
    // Implementation comments when needed
}
```

## 🧪 Testing Guidelines

- Test on macOS, Windows, and Linux when possible
- Test with different flag file paths (home dir, custom paths, paths with spaces)
- Test configuration changes (hot reload)
- Test error conditions (missing files, permissions, etc.)

## 📦 Pull Request Process

1. Update README.md if adding new features
2. Update CHANGELOG.md with your changes
3. Ensure all tests pass and linting is clean
4. Create a Pull Request with:
   - Clear description of changes
   - Screenshots/GIFs for UI changes
   - Platform testing notes

## 🐛 Reporting Bugs

Include:
- Extension version
- OS and version
- Steps to reproduce
- Expected vs actual behavior
- Relevant logs from Output panel

## 💡 Feature Requests

We welcome feature ideas! Please:
- Check existing issues first
- Describe the use case
- Explain how it fits the extension's purpose
- Consider if it can be implemented via existing extension points

## 🎯 Good First Issues

Look for issues labeled `good-first-issue` for beginner-friendly tasks:
- Documentation improvements
- Additional sound file support
- Error message improvements
- Cross-platform testing

## 📋 Future Enhancement Ideas

- Status bar integration
- Multiple flag file support
- HTTP webhook mode
- Log file tailing
- Rich notifications with actions
- Rate limiting
- Bundled default sounds
- E2E test suite

## 🙏 Questions?

Open an issue for questions or reach out to maintainers.

Thank you for contributing! 🎉

