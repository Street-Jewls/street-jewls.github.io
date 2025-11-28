# Street Jewls Slideshow System

## How Slideshows Work

The slideshow system automatically detects images in the slideshow directories and generates slides at build time.

## Slideshow Directories

Drop your images into these folders:

```
assets/images/slideshows/
├── roman-rollers/      ← 10 images (Homepage)
├── coca-cola/          ← 15 images (Homepage)
└── turbo-brz/          ← 12 images (Jewls page)
```

## Your File Naming

The system supports your exact naming format:

- `[BRZ] Coca Cola-01.jpg` through `[BRZ] Coca Cola-15.jpg`
- `[BRZ] Roman Rollers (Edited)-01.jpg` through `[BRZ] Roman Rollers (Edited)-10.jpg`
- `[BRZ] Turbo Reveal (Edited)-01.jpg` through `[BRZ] Turbo Reveal (Edited)-12.jpg`

**Brackets, spaces, and parentheses are all handled automatically!**

## Supported Image Formats

- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.webp`
- `.avif`

## Quick Start

1. **Copy your images** into the appropriate folder
2. **Optimize (optional but recommended):**
   ```bash
   npm run optimize
   ```
3. **Build the site:**
   ```bash
   npm run build
   ```
4. **Deploy** the `dist/` folder

Or do both in one step:
```bash
npm run optimize:build
```

## Image Optimization

Run `npm run optimize` to:
- **Resize** large images to max 1920×1080
- **Compress** JPGs to 80% quality (-30-50% file size)
- **Generate WebP** versions (-50-70% file size)
- **Create blur placeholders** for instant loading

### Example Output

```
🖼️  Street Jewls Image Optimizer

📁 roman-rollers/
  ✅ [BRZ] Roman Rollers (Edited)-01.jpg
      Optimized: 2.1 MB → 210 KB (-90%)
      WebP: 154 KB (-93%)
      HD saved: 383 KB
  ...

📊 Summary:
   Original size: 15.2 MB
   Optimized size: 2.8 MB
   Total savings: 82%
```

### HD Mode

When you click the **HD** button (top-right of slideshow) or press **H**, the slideshow loads the full-resolution version of the current image.

- HD versions are saved as `*-hd.jpg` and `*-hd.webp`
- The button turns cyan when HD mode is active
- HD images are loaded on-demand (not preloaded)
- Once loaded, HD images are cached for that session

### WebP Support

After optimization, the build script automatically uses `<picture>` elements:

```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="...">
</picture>
```

Browsers that support WebP (Chrome, Firefox, Edge, Safari 14+) get the smaller file. Older browsers fall back to JPG.

## Build Output

When you run `npm run build`, you'll see:

```
📄 Building index.html
   🖼️  roman-rollers: 10 images
   🖼️  coca-cola: 15 images
📄 Building pages/jewls.html
   🖼️  turbo-brz: 12 images
```

## Slideshow Features

- **Auto-advances** every 5 seconds
- **Prev/Next buttons** appear on hover
- **Progress bar** shows time until next slide
- **Counter** shows "3 / 10" position
- **Fullscreen mode** (click button or press F)
- **HD mode** (click HD button or press H) - loads full resolution
- **Touch swipe** support for mobile
- **Keyboard navigation** (arrow keys, space to pause)
- **Pauses on hover**

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ← → | Previous / Next slide |
| Space | Pause / Resume |
| F | Toggle fullscreen |
| H | Toggle HD mode |
| Escape | Exit fullscreen |

## Sort Order

Images are sorted naturally by filename:
- `01.jpg`, `02.jpg`, ... `10.jpg`, `11.jpg` (correct order)
- NOT `1.jpg`, `10.jpg`, `11.jpg`, `2.jpg` (wrong order)

Your `01`, `02` etc. naming will sort correctly!

## Troubleshooting

**Images not appearing?**
- Make sure images are in the correct folder
- Run `npm run build` after adding images
- Check the build output for error messages

**Images loading slowly?**
- Run `npm run optimize` before building
- This can reduce file sizes by 50-90%

**Wrong order?**
- Use zero-padded numbers: `01`, `02`, not `1`, `2`

**Special characters in filenames?**
- Brackets `[]`, parentheses `()`, and spaces are all supported
- The build script URL-encodes filenames automatically
