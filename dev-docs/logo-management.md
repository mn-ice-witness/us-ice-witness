# Logo Management

How to create, switch, and manage logos for MN ICE Witness.

## Directory Structure

```
logos/
├── camera_eye_logo/     # Original camera eye design (archived)
├── star_camera_logo/    # Camera with MN star (archived)
├── phone_eye_logo/      # Current phone eye design
│   ├── source.png       # Original high-res source
│   ├── icon-512.png     # PWA/install icon
│   ├── icon-192.png     # Android/PWA icon
│   ├── apple-touch-icon.png  # iOS home screen (180x180)
│   ├── favicon-48x48.png
│   ├── favicon-32x32.png
│   ├── favicon-16x16.png
│   ├── favicon.ico      # Multi-resolution .ico
│   ├── sm-logo.png      # Social media profile pic
│   └── [variants]/      # cropped-, trans- prefixed variants
│
raw_logo_files/          # Source files from designers
├── logo.png             # Camera eye source
├── star_logo.png        # Star camera source
└── phone_eye.png        # Phone eye source

docs/assets/             # DEPLOYED logo files (copy from logos/)
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── favicon-48x48.png
├── apple-touch-icon.png
├── icon-192.png
├── icon-512.png
├── sm-logo.png
└── og-image.jpg         # Social sharing preview
```

## Creating Logo Files from Source

### Prerequisites
```bash
brew install imagemagick
```

### Process New Logo

1. **Add source to raw_logo_files/**
   ```bash
   cp /path/to/new-logo.png raw_logo_files/
   ```

2. **Create logo directory**
   ```bash
   mkdir -p logos/new_logo_name/
   cp raw_logo_files/new-logo.png logos/new_logo_name/source.png
   ```

3. **Generate all sizes**
   ```bash
   cd logos/new_logo_name

   # Basic favicon sizes
   magick source.png -resize 512x512 icon-512.png
   magick source.png -resize 192x192 icon-192.png
   magick source.png -resize 180x180 apple-touch-icon.png
   magick source.png -resize 48x48 favicon-48x48.png
   magick source.png -resize 32x32 favicon-32x32.png
   magick source.png -resize 16x16 favicon-16x16.png

   # Create multi-resolution .ico
   magick favicon-16x16.png favicon-32x32.png favicon-48x48.png favicon.ico

   # Social media logo
   cp icon-512.png sm-logo.png
   ```

### Optional: Crop or Extract Circle

If the logo has extra background you want to remove:

```bash
# Crop center region (adjust dimensions as needed)
magick source.png -gravity center -crop 1850x1850+0+0 +repage cropped.png

# Extract circular region with transparent background
magick source.png \
  \( +clone -threshold -1 -negate -fill white -draw "circle 925,925 925,50" \) \
  -alpha off -compose copy_opacity -composite \
  circle-transparent.png
```

Then generate sizes from the cropped/extracted version.

## Switching Active Logo

To deploy a different logo to the site:

```bash
# Copy logo files to docs/assets/
cp logos/phone_eye_logo/favicon.ico docs/assets/
cp logos/phone_eye_logo/favicon-16x16.png docs/assets/
cp logos/phone_eye_logo/favicon-32x32.png docs/assets/
cp logos/phone_eye_logo/favicon-48x48.png docs/assets/
cp logos/phone_eye_logo/apple-touch-icon.png docs/assets/
cp logos/phone_eye_logo/icon-192.png docs/assets/
cp logos/phone_eye_logo/icon-512.png docs/assets/
cp logos/phone_eye_logo/sm-logo.png docs/assets/
```

**Important:** After switching logos, update the cache-busting version in `docs/index.html`:
```html
<link rel="icon" type="image/x-icon" href="/assets/favicon.ico?v=NEW_TIMESTAMP">
```

## Preview Page

View all logo variants and compare at different sizes:
```
docs/logo-preview.html
```

Run local server and visit `/logo-preview.html` to compare.

## Required Files for Deployment

| File | Size | Purpose |
|------|------|---------|
| favicon.ico | 16+32+48 | Legacy browsers |
| favicon-16x16.png | 16x16 | Browser tab |
| favicon-32x32.png | 32x32 | Bookmarks, shortcuts |
| favicon-48x48.png | 48x48 | Windows taskbar |
| apple-touch-icon.png | 180x180 | iOS home screen |
| icon-192.png | 192x192 | Android/PWA |
| icon-512.png | 512x512 | PWA splash/install |
| sm-logo.png | 512x512 | Social media profiles |

## Current Logos

| Name | Description | Status |
|------|-------------|--------|
| camera_eye_logo | Camera with eye lens | Archived |
| star_camera_logo | Camera with MN star | Archived |
| phone_eye_logo | Phone with eye/star | **Active** |

## Tips for Small Favicons

At 16x16 and 32x32, logos need to be very simple to be recognizable:

- **Reduce detail** - Fine lines disappear at small sizes
- **Increase contrast** - Dark outlines help definition
- **Test on both light and dark backgrounds**
- **Consider transparency** - Allows logo to work on any background
- **The transparent circle variant** often works best for favicon sizes

## Troubleshooting

### Favicon not updating?
1. Browser cache - try hard refresh (Cmd+Shift+R)
2. Update version query string in index.html: `?v=TIMESTAMP`
3. Clear browser favicon cache completely

### Logo looks blurry at small sizes?
- Create a simplified version specifically for small sizes
- Use the `-filter Point` option in ImageMagick for pixel-perfect scaling:
  ```bash
  magick source.png -filter Point -resize 16x16 favicon-16x16.png
  ```
