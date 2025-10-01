# Extension Icon Guide

## 📐 Icon Specifications

Your extension icon should be:

- **Format**: PNG (required by VS Code)
- **Size**: 256x256 pixels (recommended)
  - Minimum: 128x128 px
  - Will be scaled down for different contexts
- **Background**: Transparent or solid color
- **Style**: Simple, flat design works best at small sizes

## 📍 Location

Place your icon file at:
```
/Volumes/EXT-Drive/Documents/GitHub/cursor-helper/icon.png
```

The icon is already referenced in `package.json`:
```json
{
  "icon": "icon.png"
}
```

## 🎨 Design Suggestions for Cursor Helper

Since this extension is about notifications and task completion, consider:

### Theme Ideas:
- 🔔 Bell icon (notification theme)
- ✅ Checkmark (task completion theme)
- 🎯 Target/bullseye (helper/assistant theme)
- 🔊 Sound wave (audio notification theme)
- 💬 Speech bubble with checkmark (notification + completion)

### Color Palette:
- **Primary**: Blue (#007ACC - VS Code blue)
- **Accent**: Green (#4EC9B0 - success/completion)
- **Alternative**: Orange/Yellow (attention/notification)

### Design Tips:
1. **Keep it simple** - Icon will be displayed at 48x48, 32x32, and smaller
2. **High contrast** - Should be visible on light and dark backgrounds
3. **Avoid text** - Icons are too small for readable text
4. **Test at small sizes** - Preview at 32x32 to ensure clarity

## 🛠️ Creating Your Icon

### Option 1: Design Tools
- **Figma** (free, web-based)
- **Adobe Illustrator** (professional)
- **Sketch** (macOS)
- **Inkscape** (free, open source)
- **Canva** (easy templates)

### Option 2: Icon Generators
- **IconKitchen** - https://icon.kitchen/
- **Figma Templates** - Search "VS Code extension icon template"

### Option 3: Use Free Icons
1. Find an icon on:
   - https://www.flaticon.com/
   - https://icons8.com/
   - https://www.iconfinder.com/
   - https://iconmonstr.com/
2. Download as PNG, 256x256
3. Ensure license allows commercial use
4. Customize colors if needed

## 📝 Quick Template (SVG to PNG)

If you have SVG design skills, create your icon as SVG first, then export to PNG:

```svg
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" rx="64" fill="#007ACC"/>
  <path d="M128 64 L192 128 L128 192 L64 128 Z" fill="white"/>
  <circle cx="128" cy="128" r="24" fill="#4EC9B0"/>
</svg>
```

Export this to PNG at 256x256 pixels.

## ✅ Testing Your Icon

After adding `icon.png`:

1. **Build the extension**:
   ```bash
   npm run package
   ```

2. **Check the VSIX**:
   - The icon should be included in the package
   - You can extract .vsix (it's a ZIP) to verify

3. **Install and view**:
   - Install the .vsix
   - Check Extensions panel - your icon should appear

4. **Preview locations**:
   - Extensions sidebar (48x48)
   - Extensions list (32x32)
   - Marketplace listing (128x128)

## 🚨 Common Issues

### Icon not showing
- Verify file is named exactly `icon.png`
- Check file is in project root (same level as package.json)
- Ensure package.json has `"icon": "icon.png"`
- Rebuild: `npm run package`

### Icon looks blurry
- Use 256x256 size minimum
- Ensure crisp edges (no anti-aliasing issues)
- Test at smaller sizes during design

### Icon has wrong colors
- Check on both light and dark backgrounds
- Use high contrast colors
- Avoid pure white or pure black backgrounds (use slight tint)

## 📦 Before Publishing

Make sure:
- [ ] Icon file exists: `icon.png`
- [ ] Referenced in package.json: `"icon": "icon.png"`
- [ ] Size is 256x256 pixels minimum
- [ ] Format is PNG (not JPG, SVG, etc.)
- [ ] File size is reasonable (<100KB)
- [ ] Looks good at small sizes (32x32)
- [ ] Works on light and dark backgrounds
- [ ] Not included in .vscodeignore (should be packaged!)

## 🎨 Sample Icon Code (for developers)

If you want to generate an icon programmatically using Node.js:

```javascript
// Use 'canvas' package
const { createCanvas } = require('canvas');
const fs = require('fs');

const canvas = createCanvas(256, 256);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#007ACC';
ctx.fillRect(0, 0, 256, 256);

// Bell icon (simple)
ctx.fillStyle = 'white';
ctx.beginPath();
ctx.arc(128, 120, 60, Math.PI, 0, false);
ctx.lineTo(150, 180);
ctx.lineTo(106, 180);
ctx.closePath();
ctx.fill();

// Save
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('./icon.png', buffer);
```

---

**Next Steps:**
1. Create or download a 256x256 PNG icon
2. Save it as `icon.png` in the project root
3. Rebuild: `npm run package`
4. Your extension will now have a professional icon! 🎉


