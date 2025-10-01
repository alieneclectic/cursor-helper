# Media Assets

This directory is reserved for media assets used by the Cursor Helper extension.

## Sound Files

Place custom sound files here for easy reference. The extension supports:

- **macOS**: `.aiff`, `.wav` files
- **Windows**: `.wav` files
- **Linux**: `.wav`, `.oga` files

### Example Usage

```json
{
  "cursorHelper.customSoundPath": "${workspaceFolder}/media/done.wav"
}
```

## Future Assets

- Extension icon (`icon.png` - 256x256px)
- Demo screenshots for README
- Demo GIFs showing the extension in action

## Notes

- Sound files are not bundled with the extension by default
- Users can reference their own sound files via the `customSoundPath` setting
- For bundled sounds in future releases, place them here

