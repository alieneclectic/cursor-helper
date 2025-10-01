# Cursor Helper — Development Task List

> Goal: Build a minimal, extensible Cursor/VS Code extension that fires a system notification and optional sound when a Cursor task finishes (triggered by a flag file or future hooks).

---

## 🗂 Project Setup
- [ ] Create repo `cursor-helper`
- [ ] Initialize Node/TypeScript project
  - [ ] `npm init -y`
  - [ ] `npm i -D typescript vscode @types/node vsce`
  - [ ] `npx tsc --init`
- [ ] Add base files
  - [ ] `package.json` (extension metadata, activationEvents, contributes.configuration, commands)
  - [ ] `tsconfig.json` (target es2020, outDir `out`, strict true)
  - [ ] `src/extension.ts`
  - [ ] `README.md`
  - [ ] `media/done.wav` (optional custom sound)
  - [ ] `.vscode/launch.json` for Extension Host debugging
- [ ] Configure scripts
  - [ ] `build`: `tsc -p ./`
  - [ ] `watch`: `tsc -w -p ./`
  - [ ] `vscode:prepublish`: `npm run build`
  - [ ] `package`: `vsce package`

---

## 🧩 Extension Scaffolding
- [ ] Define extension identity
  - [ ] `"name": "cursor-helper"`
  - [ ] `"displayName": "Cursor Helper"`
  - [ ] `"publisher": "Claritystorm"`
  - [ ] `"engines.vscode": "^1.85.0"` (adjust as needed for Cursor compatibility)
- [ ] Activation
  - [ ] `activationEvents: ["onStartupFinished"]`
  - [ ] `main: "./out/extension.js"`
- [ ] Contributes
  - [ ] Configuration keys:
    - [ ] `cursorHelper.flagFile` (default: `~/.cursor-notify.flag`)
    - [ ] `cursorHelper.message` (default: `"Cursor task complete"`)
    - [ ] `cursorHelper.playSound` (default: `true`)
    - [ ] `cursorHelper.customSoundPath` (default: `""`)
  - [ ] Commands:
    - [ ] `cursorHelper.testNotify` → manual test notification

---

## 🔌 Core Implementation (`src/extension.ts`)
- [ ] Implement config loading + home expansion helper
- [ ] Ensure flag file exists (create if missing)
- [ ] `fs.watch` parent dir; debounce events on target file
- [ ] On change → `vscode.window.showInformationMessage(config.message)`
- [ ] If `playSound` → platform-specific player:
  - [ ] macOS: `afplay` (system sound or custom path)
  - [ ] Windows: PowerShell `[console]::beep(...)` or `Media.SoundPlayer`
  - [ ] Linux: `paplay` or `aplay` fallback to `\a`
- [ ] Add `cursorHelper.testNotify` command for quick testing
- [ ] Handle runtime config changes (suggest window reload on path change)
- [ ] Clean up watchers on deactivate

---

## 🧪 Local Dev & Debug
- [ ] `npm run watch` and press **F5** (Extension Host) to test
- [ ] Use the **Command Palette** → “Cursor Helper: Test Notification”
- [ ] Validate notification and sound on your OS
- [ ] Test with missing/invalid custom sound path (graceful failure)

---

## 🧷 Cursor Rule Trigger (MVP)
- [ ] Add a **Cursor Rule** to update the flag file at task completion

**macOS/Linux Rule snippet:**
```text
<!run:sh -lc "echo \"$(date) :: CURSOR_DONE\" > $HOME/.cursor-notify.flag">
```

**Windows Rule snippet:**
```text
<!run:powershell -command "$d=Get-Date; Set-Content -Path $env:USERPROFILE\.cursor-notify.flag -Value $d;">
```

- [ ] Confirm extension fires upon file update
- [ ] Add README instructions for users to set rule text

---

## ✅ Acceptance Criteria (MVP)
- [ ] Extension shows notification when the flag file changes
- [ ] Optional sound plays successfully on macOS/Windows/Linux
- [ ] Manual test command works from Command Palette
- [ ] README contains clear setup + Cursor Rule instructions
- [ ] No uncaught exceptions when paths are missing or invalid

---

## 📦 Packaging & Install
- [ ] `npm run build`
- [ ] `npm run package` → produce `.vsix`
- [ ] Install via Cursor/VS Code Extensions → “Install from VSIX…”
- [ ] Verify settings appear under **Cursor Helper**

---

## 🧰 QA Matrix
- [ ] macOS (Intel/Apple Silicon)
  - [ ] Default sound (Glass.aiff)
  - [ ] Custom sound path (.aiff/.wav)
- [ ] Windows 11
  - [ ] Console beep fallback
  - [ ] `Media.SoundPlayer` custom WAV playback
- [ ] Linux (Ubuntu/Debian)
  - [ ] `paplay` available
  - [ ] `aplay` fallback
  - [ ] Terminal bell fallback
- [ ] Large write burst (debounce confirmed)
- [ ] Path with spaces (flag file & sound path)
- [ ] Read-only dir error handling

---

## 🚀 Nice-to-Haves (Backlog)
- [ ] Status bar item with spinner → checkmark on completion
- [ ] Watch **multiple** flag files with labels (Composer/Agent/Tests)
- [ ] Custom per-workspace settings override
- [ ] Output channel logging with timestamps
- [ ] HTTP webhook mode (internal mini server) instead of file watch
- [ ] Log file mode: tail `~/.cursor/logs/*` and regex `CURSOR_DONE`
- [ ] Rich notifications (action buttons: “Open log”, “Open file”)
- [ ] Cooldown / rate limiting for spammy events
- [ ] Cross-platform sound packaging (bundle a default WAV)
- [ ] E2E test suite with `vscode-extension-tester`

---

## 📘 README Essentials
- [ ] What it does + screenshot/gif
- [ ] Settings table + defaults
- [ ] Cursor Rule examples (macOS/Linux/Windows)
- [ ] Troubleshooting (permissions, missing players, path expansion)
- [ ] Privacy note (no telemetry, no external calls)
- [ ] License & contribution guide

---

## 📄 Licensing & Publishing
- [ ] Choose license (MIT recommended)
- [ ] Prepare `icon.png` (256x256) for marketplace
- [ ] Validate `vsce ls` (files included in package)
- [ ] Optional: Publish to VS Code Marketplace (requires publisher account)

---

## 🧭 Milestones
- [ ] **M1 (Scaffold)**: repo, build, activation, test command
- [ ] **M2 (Notify Core)**: file watcher + cross-platform sound
- [ ] **M3 (Cursor Rule)**: end-to-end working with real rule
- [ ] **M4 (Polish)**: README, settings UX, error handling
- [ ] **M5 (Ship)**: package VSIX, optional marketplace publish

---

### Notes
- Keep the **trigger** (flag file) decoupled from **actions** (notify/sound) to enable future hooks without refactoring.
- If Cursor later supports a first-class “task finished” event, add a second watcher/driver but keep this file driver as fallback.
