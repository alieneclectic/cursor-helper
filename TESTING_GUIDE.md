# Testing Guide for Cursor Helper

## ✅ Build Status
Your extension has been successfully built and is ready to test!

---

## 🚀 Method 1: F5 Debug Mode (Fastest)

This launches a new VS Code/Cursor window with your extension running.

### Steps:

1. **Open the project in Cursor or VS Code**:
   ```bash
   cursor /Volumes/EXT-Drive/Documents/GitHub/cursor-helper
   # OR
   code /Volumes/EXT-Drive/Documents/GitHub/cursor-helper
   ```

2. **Press F5** (or Run → Start Debugging)
   - A new window opens titled **"[Extension Development Host]"**
   - Your extension is now active in this window!

3. **Test the notification**:
   - In the Extension Development Host window
   - Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
   - Type: `Cursor Helper: Test Notification`
   - Press Enter
   - **You should see**: 
     - ✅ A notification popup saying "Cursor task complete"
     - 🔊 A sound plays (system default)

4. **View logs** (optional):
   - In Extension Development Host window
   - Go to: **View → Output**
   - Select "Cursor Helper" from dropdown
   - You'll see extension activity logs

### Making Changes:

While in debug mode:
- Edit any `.ts` file in `src/`
- The extension will auto-rebuild (if you ran `npm run watch`)
- Press `Cmd+R` or `Ctrl+R` in Extension Development Host to reload
- Test your changes immediately

---

## 🧪 Method 2: Test Flag File Watching

Test the core functionality - watching the flag file for changes.

### Steps:

1. **Launch Extension Development Host** (F5 as above)

2. **Open a terminal** and run:
   ```bash
   # This triggers the extension by updating the flag file
   echo "$(date) :: CURSOR_DONE" > ~/.cursor-notify.flag
   ```

3. **You should see**:
   - ✅ Notification appears immediately
   - 🔊 Sound plays
   - Check logs in Output panel for "File change detected"

4. **Test rapid updates** (debouncing):
   ```bash
   # Send multiple updates quickly
   for i in {1..5}; do
     echo "$(date) :: TEST $i" > ~/.cursor-notify.flag
     sleep 0.1
   done
   ```
   
   **Expected**: Only ONE notification (debouncing works!)

---

## ⚙️ Method 3: Test Configuration Changes

Test that settings work correctly.

### Steps:

1. **Launch Extension Development Host** (F5)

2. **Open Settings**: `Cmd+,` or `Ctrl+,`

3. **Search for**: "Cursor Helper"

4. **Test different settings**:

   **A. Change notification message:**
   - Set `Cursor Helper: Message` to: "🎉 Task finished!"
   - Run test command again
   - Should show new message

   **B. Disable sound:**
   - Set `Cursor Helper: Play Sound` to `false`
   - Update flag file: `echo "test" > ~/.cursor-notify.flag`
   - Should see notification but NO sound

   **C. Enable logging:**
   - Set `Cursor Helper: Enable Logging` to `true`
   - Open Output panel (View → Output → Cursor Helper)
   - Update flag file: `echo "test" > ~/.cursor-notify.flag`
   - Should see detailed logs

   **D. Change debounce time:**
   - Set `Cursor Helper: Debounce Ms` to `2000`
   - Rapidly update flag file
   - Should wait 2 seconds before notifying

---

## 📦 Method 4: Install as VSIX (Full Integration Test)

Test as if you're an end user installing the extension.

### Steps:

1. **Package the extension**:
   ```bash
   cd /Volumes/EXT-Drive/Documents/GitHub/cursor-helper
   npm run package
   ```
   
   This creates: `cursor-helper-0.1.0.vsix`

2. **Install the VSIX**:
   - In Cursor/VS Code: **Extensions** panel (`Cmd+Shift+X`)
   - Click **...** menu (top right)
   - Select **Install from VSIX...**
   - Navigate to and select `cursor-helper-0.1.0.vsix`
   - Click **Install**

3. **Reload the window** when prompted

4. **Test it works**:
   - `Cmd+Shift+P` → "Cursor Helper: Test Notification"
   - Should work in your main Cursor window (not just Extension Development Host)

5. **Uninstall when done**:
   - Extensions panel → Find "Cursor Helper"
   - Click gear icon → Uninstall

---

## 🎯 Method 5: Test with Real Cursor Usage

Test the real-world workflow with Cursor AI.

### Steps:

1. **Launch Extension** (F5 or install VSIX)

2. **Add Cursor Rule**:
   - Open Cursor Settings
   - Add this rule:
   ```
   <!run:sh -lc "echo \"$(date) :: CURSOR_DONE\" > $HOME/.cursor-notify.flag">
   ```

3. **Use Cursor AI**:
   - Ask Cursor to perform a task
   - When AI completes, the rule should trigger
   - **You should get notified!** ✅

4. **Verify in logs**:
   - Check Output panel for "Task complete event"

---

## 🔍 Testing Checklist

Run through this checklist to verify everything works:

### Basic Functionality
- [ ] Extension activates without errors
- [ ] Test command shows notification
- [ ] Test command plays sound
- [ ] Flag file is created automatically at `~/.cursor-notify.flag`

### File Watching
- [ ] Updating flag file triggers notification
- [ ] Debouncing works (multiple rapid updates = 1 notification)
- [ ] Watching survives file deletion and recreation

### Configuration
- [ ] Can change notification message (takes effect immediately)
- [ ] Can disable sound (no sound plays)
- [ ] Can enable logging (logs appear in Output panel)
- [ ] Can change debounce time (affects timing)
- [ ] Can change flag file path (watches new location)

### Sound Playback
- [ ] Default sound plays on macOS
- [ ] Custom sound path works (if configured)
- [ ] No errors when sound file missing (graceful fallback)

### Error Handling
- [ ] Extension handles missing flag file directory
- [ ] Extension handles permission errors gracefully
- [ ] Extension logs errors to Output panel
- [ ] No crashes on invalid configuration

### Developer Experience
- [ ] F5 launches Extension Development Host
- [ ] Logs appear in Output panel
- [ ] Hot-reload works (reload Extension Development Host)
- [ ] Can set breakpoints and debug

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module 'vscode'"

**Solution**: Make sure dependencies are installed:
```bash
npm install
```

### Issue: Extension doesn't activate

**Solution**: 
1. Check for errors in Debug Console (View → Debug Console)
2. Look for TypeScript compilation errors
3. Try: `npm run build` then F5 again

### Issue: No notification appears

**Solution**:
1. Enable logging: Set `cursorHelper.enableLogging` to `true`
2. Check Output panel for errors
3. Verify flag file exists: `ls -la ~/.cursor-notify.flag`
4. Try test command first: `Cursor Helper: Test Notification`

### Issue: Sound doesn't play

**Solution**:
- **macOS**: Test `afplay /System/Library/Sounds/Glass.aiff` in terminal
- **Windows**: PowerShell should work by default
- **Linux**: Install `pulseaudio-utils` or `alsa-utils`

### Issue: Build fails

**Solution**:
```bash
# Clean and rebuild
rm -rf out node_modules
npm install
npm run build
```

### Issue: Hot-reload not working

**Solution**:
1. Stop the Extension Development Host
2. Run: `npm run watch` in terminal
3. Press F5 again
4. Changes should now auto-rebuild

---

## 🎓 Advanced Testing

### Test with Custom Sound

1. Download a WAV or AIFF file
2. Set `Cursor Helper: Custom Sound Path` to your file path
3. Update flag file
4. Your custom sound should play

### Test Multiple Rapid Events

```bash
# Spam the flag file
while true; do 
  echo "$(date)" > ~/.cursor-notify.flag
  sleep 0.05
done
# Press Ctrl+C to stop
```

**Expected**: Only periodic notifications (debouncing works)

### Test Path with Spaces

```bash
mkdir -p ~/Library/Application\ Support/CursorHelper
```

Set flag file to: `~/Library/Application Support/CursorHelper/notify.flag`

Should work correctly with spaces in path.

### Test Flag File in Different Locations

Try these paths:
- `~/.cursor-notify.flag` (default)
- `~/.config/cursor-notify.flag`
- `~/Desktop/cursor-notify.flag`
- `/tmp/cursor-notify.flag`

All should work after changing the setting.

---

## 📊 Performance Testing

### Check Extension Activation Time

1. Launch Extension Development Host (F5)
2. Check Debug Console for activation message
3. Should activate in < 1 second

### Check Memory Usage

1. Launch Extension Development Host
2. Help → Toggle Developer Tools
3. Go to Memory tab
4. Extension should use minimal memory (< 50MB)

### Check File Watcher Efficiency

1. Enable logging
2. Update flag file 100 times quickly
3. Check logs - should show debounced events
4. No CPU spikes, no memory leaks

---

## ✅ Final Verification

Before considering the extension ready:

1. ✅ All checklist items pass
2. ✅ No errors in Debug Console
3. ✅ Logs show expected behavior
4. ✅ Works as end-user (VSIX install)
5. ✅ Cursor Rule integration works
6. ✅ All platforms tested (if possible)

---

## 🎉 You're Ready!

Once all tests pass, your extension is ready to:
- Use daily with Cursor
- Share with others
- Publish to VS Code Marketplace (optional)

**Happy testing!** 🚀

