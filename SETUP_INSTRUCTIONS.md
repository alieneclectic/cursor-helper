# Setup Instructions

Complete step-by-step guide to get Cursor Helper running.

## 📋 Prerequisites

- **Node.js**: v16.x or higher ([Download](https://nodejs.org/))
- **npm**: v7.x or higher (comes with Node.js)
- **VS Code or Cursor IDE**: Latest version
- **Git**: For version control (optional)

## 🚀 Installation Methods

### Method 1: Development Mode (Recommended for Testing)

This method runs the extension in a development environment where you can make changes.

#### Step 1: Install Dependencies

```bash
cd /Volumes/EXT-Drive/Documents/GitHub/cursor-helper
npm install
```

This will install:
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions
- `@types/vscode` - VS Code API type definitions
- `@typescript-eslint/*` - Linting tools
- `@vscode/vsce` - Extension packaging tool

#### Step 2: Build the Extension

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `out/` directory.

#### Step 3: Launch Extension Development Host

Open the project in VS Code or Cursor:

```bash
# If using VS Code
code .

# If using Cursor
cursor .
```

Then press **F5** to launch the Extension Development Host.

A new window will open with the extension activated. This window has "[Extension Development Host]" in its title.

#### Step 4: Test It Works

In the Extension Development Host window:

1. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: "Cursor Helper: Test Notification"
3. Press Enter

You should see:
- ✅ A notification message
- 🔊 A sound (if your system supports it)

**Success!** The extension is now running. 🎉

---

### Method 2: Install as VSIX Package

This method installs the extension permanently in VS Code/Cursor.

#### Step 1: Build and Package

```bash
npm install
npm run build
npm run package
```

This creates a file: `cursor-helper-0.1.0.vsix`

#### Step 2: Install the VSIX

In VS Code or Cursor:

1. Open **Extensions** panel (`Cmd+Shift+X` or `Ctrl+Shift+X`)
2. Click the **...** menu (top right of Extensions panel)
3. Select **Install from VSIX...**
4. Browse to `cursor-helper-0.1.0.vsix`
5. Click **Install**
6. Reload the window when prompted

The extension is now permanently installed!

---

## ⚙️ Configuration

### Open Settings

Two ways to access settings:

1. **Command Palette**:
   - Press `Cmd+Shift+P` / `Ctrl+Shift+P`
   - Type: "Cursor Helper: Open Settings"

2. **Manual**:
   - Open Settings (`Cmd+,` / `Ctrl+,`)
   - Search for "Cursor Helper"

### Configure Basic Settings

```json
{
  // Path to flag file (supports ~ for home directory)
  "cursorHelper.flagFile": "~/.cursor-notify.flag",
  
  // Message to show in notification
  "cursorHelper.message": "Cursor task complete",
  
  // Enable or disable sound
  "cursorHelper.playSound": true,
  
  // Path to custom sound file (empty = use system default)
  "cursorHelper.customSoundPath": "",
  
  // Debounce time to prevent duplicate notifications (ms)
  "cursorHelper.debounceMs": 500,
  
  // Enable detailed logging to output channel
  "cursorHelper.enableLogging": false
}
```

### Platform-Specific Sound Paths

**macOS** (system sounds):
```json
{
  "cursorHelper.customSoundPath": "/System/Library/Sounds/Hero.aiff"
}
```

Available sounds: Glass, Hero, Ping, Pop, Purr, Submarine, etc.
Browse: `/System/Library/Sounds/`

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

---

## 🎯 Cursor Integration

### Add Cursor Rule for Automatic Notifications

To automatically trigger notifications when Cursor AI completes tasks, add a Cursor Rule.

#### For macOS/Linux:

1. Open Cursor Settings
2. Go to **Rules** section
3. Add this rule:

```text
<!run:sh -lc "echo \"$(date) :: CURSOR_DONE\" > $HOME/.cursor-notify.flag">
```

#### For Windows:

1. Open Cursor Settings
2. Go to **Rules** section
3. Add this rule:

```text
<!run:powershell -command "$d=Get-Date; Set-Content -Path $env:USERPROFILE\.cursor-notify.flag -Value $d;">
```

### How It Works

1. You ask Cursor AI to complete a task
2. When the AI finishes, the rule executes
3. The rule updates the flag file with the current timestamp
4. Cursor Helper detects the file change
5. You get a notification and sound! 🎉

### Test the Integration

1. Make sure the extension is running
2. Manually update the flag file:

**macOS/Linux:**
```bash
echo "test" > ~/.cursor-notify.flag
```

**Windows:**
```powershell
echo "test" > $env:USERPROFILE\.cursor-notify.flag
```

You should immediately get a notification!

---

## 🔍 Troubleshooting

### Issue: No notification appears

**Solution 1: Check the flag file**

```bash
# macOS/Linux
ls -la ~/.cursor-notify.flag

# Windows PowerShell
Test-Path $env:USERPROFILE\.cursor-notify.flag
```

The file should exist. If not, the extension creates it automatically when it starts.

**Solution 2: Enable logging**

1. Set `"cursorHelper.enableLogging": true` in settings
2. Open Output panel: **View → Output**
3. Select "Cursor Helper" from dropdown
4. Watch for log messages when updating the flag file

**Solution 3: Manually trigger test**

Use Command Palette: "Cursor Helper: Test Notification"

If this works, the extension is functioning correctly and the issue is with the flag file.

### Issue: Sound not playing

**macOS:**
```bash
# Check if afplay is available
which afplay

# Test system sound
afplay /System/Library/Sounds/Glass.aiff
```

**Windows:**
PowerShell should be available by default. Try the test command first.

**Linux:**
```bash
# Check for sound utilities
which paplay
which aplay

# Install if missing (Ubuntu/Debian)
sudo apt-get install pulseaudio-utils

# Or ALSA
sudo apt-get install alsa-utils
```

### Issue: Extension not activating

1. Check the extension is installed:
   - **Extensions** panel → Search "Cursor Helper"

2. Check for errors:
   - **Help → Toggle Developer Tools**
   - Look for errors in Console tab

3. Reload the window:
   - Command Palette → "Developer: Reload Window"

### Issue: Flag file path with spaces

Use quotes in the configuration:

```json
{
  "cursorHelper.flagFile": "~/My Documents/cursor-notify.flag"
}
```

The extension automatically handles spaces in paths.

### Issue: Permission denied

The flag file directory must be writable. Try a different location:

```json
{
  "cursorHelper.flagFile": "~/.config/cursor-notify.flag"
}
```

---

## 🔧 Development Setup

### For Contributors

If you want to modify the extension:

#### 1. Fork and Clone

```bash
git clone https://github.com/your-username/cursor-helper.git
cd cursor-helper
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Open in VS Code

```bash
code .
```

#### 4. Start Watch Mode

```bash
npm run watch
```

This automatically rebuilds when you save changes.

#### 5. Debug

Press **F5** to launch Extension Development Host. Set breakpoints in TypeScript files.

#### 6. Make Changes

Edit files in `src/` directory. The watch mode will rebuild automatically.

#### 7. Test Changes

The Extension Development Host automatically reloads when files change.

---

## 📊 Verification Checklist

After installation, verify:

- [ ] Extension appears in Extensions panel
- [ ] Test command works (shows notification + sound)
- [ ] Flag file exists at configured path
- [ ] Manually updating flag file triggers notification
- [ ] Cursor Rule (if configured) triggers notification
- [ ] Settings can be changed and take effect
- [ ] Output channel shows logs (if logging enabled)

---

## 🎓 Next Steps

1. ✅ **Test the basic functionality** with the test command
2. ✅ **Configure your preferred settings** (message, sound, etc.)
3. ✅ **Add Cursor Rule** for automatic notifications
4. ✅ **Use it!** Get notified when Cursor tasks complete
5. 🚀 **Explore the code** to add your own features
6. 🤝 **Contribute** improvements back to the project

---

## 📚 Additional Resources

- **README.md** - Complete feature documentation
- **QUICKSTART.md** - 5-minute quick start
- **CONTRIBUTING.md** - How to contribute
- **docs/ARCHITECTURE.md** - Technical architecture
- **PROJECT_SUMMARY.md** - Project overview

---

## 🆘 Getting Help

1. Check **Output panel** (View → Output → Cursor Helper)
2. Review **Troubleshooting** section above
3. Check existing GitHub Issues
4. Create a new GitHub Issue with:
   - Extension version
   - OS and version
   - Steps to reproduce
   - Logs from Output panel

---

**Enjoy using Cursor Helper!** 🎉

If you find it useful, please ⭐ star the repository and share it with others!

