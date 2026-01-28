# Custom OG Images Procedure

How to replace auto-generated OG (Open Graph) images with custom ones for better social media previews.

## Why Custom OG Images

Auto-generated OG images are extracted from video at a specific timestamp (usually 2 seconds in). These may not always be the most compelling frame for social sharing. Custom OG images allow you to select a more impactful frame or use an entirely different image.

## Procedure

### 1. Place Your Screenshot in raw_media

Put your custom image (PNG or JPG) in the `raw_media/` folder. Any filename works.

```
raw_media/Screenshot 2026-01-23 at 1.27.20 PM.png
```

### 2. Convert to JPG and Name Correctly

The OG image must follow the naming pattern: `{incident-slug}-og-{identifier}.jpg`

**Example:** For incident `2026-01-07-teenager-tackled-snow.md`:

```bash
# Copy to temp location (handles special characters in filenames)
cd raw_media && cp Screenshot*.png /tmp/screenshot.png

# Convert PNG to JPG with correct naming
cd /Users/ajcarter/workspace/GIT_MN_ICE_FILES
sips -s format jpeg /tmp/screenshot.png --out docs/media/2026-01-07-teenager-tackled-snow-og-custom.jpg
```

The `{identifier}` can be:
- `custom` - for manually selected images
- `2s-{timestamp}` - auto-generated format (2 seconds into video)
- Any other identifier

### 3. Remove Auto-Generated OG Image

Delete the auto-generated one so only your custom image remains:

```bash
rm docs/media/2026-01-07-teenager-tackled-snow-og-2s-*.jpg
```

### 4. Clean Up Source File

Remove the source screenshot from raw_media:

```bash
rm raw_media/Screenshot*.png
```

### 5. Verify and Commit

Check that the custom OG image is picked up:

```bash
ls docs/media/{incident-slug}-og*
# Should show only your custom image
```

Commit and push:

```bash
git add docs/media/{incident-slug}-og-custom.jpg
git commit -m "Add custom OG image for {incident description}"
git push
```

## How It Works

The `scripts/generate_summary.py` script looks for OG images using the glob pattern:

```python
pattern = f"{slug}-og-*.jpg"
```

This matches any file like:
- `2026-01-07-teenager-tackled-snow-og-custom.jpg` ✓
- `2026-01-07-teenager-tackled-snow-og-2s-1769196137.jpg` ✓

As long as only one OG image exists per incident, the system will use it.

## Quick Reference

| Step | Command |
|------|---------|
| Copy screenshot | `cd raw_media && cp Screenshot*.png /tmp/screenshot.png` |
| Convert to JPG | `sips -s format jpeg /tmp/screenshot.png --out docs/media/{slug}-og-custom.jpg` |
| Remove auto-generated | `rm docs/media/{slug}-og-2s-*.jpg` |
| Clean up source | `rm raw_media/Screenshot*.png` |
