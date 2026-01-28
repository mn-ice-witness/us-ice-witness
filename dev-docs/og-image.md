# OG Image Generation

This document describes how to create and update the site's Open Graph image (`og-image.jpg`), which appears when the site is shared on social media.

## Overview

The og-image is a 1200x630 pixel collage of 5 photos arranged on a dark navy background. The center image is larger and overlaps the four corner images.

**Current og-image location:** `docs/assets/og-image.jpg`

## Folder Structure

```
docs/
├── assets/
│   └── og-image.jpg          # Generated output (1200x630)
├── og-image/                  # Current source images
│   ├── upper_left.jpg
│   ├── upper_right.png
│   ├── lower_left.jpg
│   ├── lower_right.jpg
│   └── center.jpg
└── og-image-a/                # Backup/alternate set
    └── (same structure)
```

## Source Image Naming

Images in source folders must use these exact names (extension can be .jpg, .png, or .jpeg):

| Position | Filename | Location in collage |
|----------|----------|---------------------|
| `upper_left` | upper_left.jpg | Top-left, rotated -6° |
| `upper_right` | upper_right.png | Top-right, rotated 5° |
| `lower_left` | lower_left.jpg | Bottom-left, rotated -4° |
| `lower_right` | lower_right.jpg | Bottom-right, rotated 4° |
| `center` | center.jpg | Center, no rotation, largest |

## Generating the OG Image

```bash
python-main scripts/generate_og_image.py <source-folder>
```

**Examples:**
```bash
# Generate from main folder
python-main scripts/generate_og_image.py docs/og-image

# Generate from alternate folder
python-main scripts/generate_og_image.py docs/og-image-a

# Generate and open to preview
python-main scripts/generate_og_image.py docs/og-image && open docs/assets/og-image.jpg
```

## Updating Photos

To update a photo in the collage:

1. Copy the new image to `docs/og-image/` with the appropriate position name
2. Run the generator script
3. Preview the result

**Example - Replace the center image:**
```bash
cp /path/to/new-photo.jpg docs/og-image/center.jpg
python-main scripts/generate_og_image.py docs/og-image
open docs/assets/og-image.jpg
```

## Creating a New Set

To create a completely new og-image set:

1. Create a new folder: `mkdir docs/og-image-b`
2. Add 5 images with the position names listed above
3. Generate: `python-main scripts/generate_og_image.py docs/og-image-b`
4. If satisfied, optionally rename folders to make it the main set

## Current Main OG Image (Jan 2026)

The current production og-image uses these photos:

| Position | Description |
|----------|-------------|
| upper_left | Man with broken car window (Christian Molina) |
| upper_right | Agents pinning person to ground, kneeing him in face |
| lower_left | Car interior with blood and toys (Renee Good shooting) |
| lower_right | Man pinned down, pepper sprayed in face |
| center | Woman being detained by HSI agents |

## Technical Details

**Output specifications:**
- Size: 1200 x 630 pixels (standard OG image dimensions)
- Format: JPEG, quality 90
- Background: Dark navy (#1a2b4a)

**Image processing:**
- Photos are resized and cropped to fit their target dimensions
- White border (6px) added around each photo
- Drop shadow applied
- Corner images rotated at slight angles
- Center image rendered last (appears on top)

**Script location:** `scripts/generate_og_image.py`

## Future: Auto-Generate from Incidents

*Planned feature:* When requesting a summary of specific incidents, automatically generate an og-image using media from those incidents.

This would:
1. Extract thumbnail/og images from the specified incidents
2. Place them in a temporary og-image folder
3. Generate the collage
4. Allow review before setting as main og-image
