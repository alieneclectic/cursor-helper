# Quick Start Guide

Get Cursor Helper running in 5 minutes!

## 🚀 Installation

### Option 1: Development Mode (Recommended for Testing)

1. **Clone and setup:**
   ```bash
   cd /Volumes/EXT-Drive/Documents/GitHub/cursor-helper
   npm install
   npm run build
   ```

2. **Launch in VS Code/Cursor:**
   - Open the project in VS Code or Cursor
   - Press `F5` to open Extension Development Host
   - A new window opens with the extension activated

3. **Test it works:**
   - In the new window, press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Cursor Helper: Test Notification"
   - You should see a notification and hear a sound! 🎉

### Option 2: Install as VSIX

1. **Build the package:**
   ```bash
   npm install
   npm run build
   npm run package
   ```

2. **Install the VSIX:**
   - In VS Code/Cursor: **Extensions** → **...** → **Install from VSIX...**
   - Select `cursor-helper-0.1.0.vsix`
   - Reload the window

## ⚙️ Basic Configuration

1. Open Settings (`Cmd+,` or `Ctrl+,`)
2. Search for "Cursor Helper"
3. Customize:
   - **Flag File**: Where to watch for task completion
   - **Message**: Notification text
   - **Play Sound**: Enable/disable sounds
   - **Custom Sound Path**: Path to your sound file

## 🎯 Using with Cursor Rules

### macOS/Linux Setup

1. **Add Cursor Rule** (in your Cursor settings):
   ```text
   <!run:sh -lc "echo \"$(date) :: CURSOR_DONE\" > $HOME/.cursor-notify.flag">
   ```

2. **Test it:**
   - Ask Cursor AI to complete a task
   - When done, the rule updates the flag file
   - Extension detects the change and notifies you! ✅

### Windows Setup

1. **Add Cursor Rule:**
   ```text
   <!run:powershell -command "$d=Get-Date; Set-Content -Path $env:USERPROFILE\.cursor-notify.flag -Value $d;">
   ```

2. **Test it:**
   - Ask Cursor AI to complete a task
   - Notification appears when complete! ✅

## 🔍 Troubleshooting

### No notification appears

1. **Check the flag file path:**
   ```bash
   # macOS/Linux
   ls -la ~/.cursor-notify.flag
   
   # Windows PowerShell
   Test-Path $env:USERPROFILE\.cursor-notify.flag
   ```

2. **Enable logging:**
   - Set `"cursorHelper.enableLogging": true`
   - View Output: **View** → **Output** → Select "Cursor Helper"

3. **Manual test:**
   - Update the flag file manually:
     ```bash
     # macOS/Linux
     echo "test" > ~/.cursor-notify.flag
     
     # Windows
     echo "test" > %USERPROFILE%\.cursor-notify.flag
     ```
   - Should trigger a notification

### Sound not playing

1. **macOS:** Check `afplay` is available:
   ```bash
   which afplay
   afplay /System/Library/Sounds/Glass.aiff
   ```

2. **Linux:** Install sound utilities:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install pulseaudio-utils
   
   # Or ALSA
   sudo apt-get install alsa-utils
   ```

3. **Windows:** Ensure PowerShell is available (it should be by default)

### Still having issues?

1. Check the Output panel: **View → Output → Cursor Helper**
2. Try the test command: **Cursor Helper: Test Notification**
3. Check file permissions on the flag file directory
4. Try a different flag file path (e.g., in your home directory)

## 🎨 Customization Examples

### Custom Notification Message

```json
{
  "cursorHelper.message": "✅ Cursor AI finished the task!"
}
```

### Custom Sound (macOS)

```json
{
  "cursorHelper.customSoundPath": "/System/Library/Sounds/Hero.aiff"
}
```

### Longer Debounce (reduce duplicate notifications)

```json
{
  "cursorHelper.debounceMs": 2000
}
```

### Different Flag File Location

```json
{
  "cursorHelper.flagFile": "~/projects/.cursor-done"
}
```

## 🚀 Next Steps

1. **Customize** your settings to match your workflow
2. **Set up Cursor Rules** for automatic notifications
3. **Test** with real AI tasks in Cursor
4. **Explore** the code to add your own features!

## 📚 More Information

- [Full README](README.md) - Complete documentation
- [Architecture Overview](CONTRIBUTING.md) - Learn how to extend
- [Task List](docs/Cursor_Helper_Dev_Tasks.md) - Development roadmap

---

**Enjoy!** 🎉 You're all set to receive notifications when your Cursor AI tasks complete!

