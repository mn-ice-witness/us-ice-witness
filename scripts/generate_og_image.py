"""
generate_og_image.py - Create og-image.jpg from 5 source photos in a folder

Creates a 1200x630 collage:
- Dark navy background
- 5 photos with rotations, borders, and shadows
- Center image larger and overlapping corners

Usage: python-main scripts/generate_og_image.py <folder>
Example: python-main scripts/generate_og_image.py docs/og-image
"""

import sys
from pathlib import Path
from PIL import Image, ImageFilter

OG_WIDTH = 1200
OG_HEIGHT = 630
BACKGROUND_COLOR = (26, 43, 74)
BORDER_WIDTH = 6
BORDER_COLOR = (255, 255, 255, 230)
SHADOW_OFFSET = 8
SHADOW_BLUR = 15

OUTPUT_PATH = Path(__file__).parent.parent / "docs" / "assets" / "og-image.jpg"

PHOTO_CONFIGS = [
    {"file": "upper_left", "size": (420, 300), "position": (-40, 0), "rotation": -6},
    {"file": "upper_right", "size": (400, 300), "position": (820, 0), "rotation": 5},
    {"file": "lower_left", "size": (380, 280), "position": (-30, 340), "rotation": -4},
    {"file": "lower_right", "size": (400, 280), "position": (840, 340), "rotation": 4},
    {"file": "center", "size": (560, 330), "position": (320, 150), "rotation": 0},
]


def add_shadow(img, offset, blur_radius):
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    shadow_layer = Image.new("RGBA", img.size, (0, 0, 0, 150))
    shadow.paste(shadow_layer, mask=img.split()[3] if img.mode == "RGBA" else None)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur_radius))
    result = Image.new("RGBA", (img.width + offset * 2, img.height + offset * 2), (0, 0, 0, 0))
    result.paste(shadow, (offset, offset))
    result.paste(img, (0, 0), img if img.mode == "RGBA" else None)
    return result


def add_border(img, border_width, border_color):
    bordered = Image.new(
        "RGBA",
        (img.width + border_width * 2, img.height + border_width * 2),
        border_color,
    )
    bordered.paste(img, (border_width, border_width))
    return bordered


def process_photo(source_dir, config):
    base = config["file"]
    for ext in [".jpg", ".png", ".jpeg"]:
        img_path = source_dir / (base + ext)
        if img_path.exists():
            break
    img = Image.open(img_path).convert("RGB")

    target_w, target_h = config["size"]
    img_ratio = img.width / img.height
    target_ratio = target_w / target_h

    if img_ratio > target_ratio:
        new_h = target_h
        new_w = int(target_h * img_ratio)
    else:
        new_w = target_w
        new_h = int(target_w / img_ratio)

    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    img = img.crop((left, top, left + target_w, top + target_h))

    img = img.convert("RGBA")
    img = add_border(img, BORDER_WIDTH, BORDER_COLOR)

    if config["rotation"] != 0:
        img = img.rotate(-config["rotation"], expand=True, resample=Image.Resampling.BICUBIC)

    img = add_shadow(img, SHADOW_OFFSET, SHADOW_BLUR)

    return img, config["position"]


def generate_og_image(source_dir):
    canvas = Image.new("RGBA", (OG_WIDTH, OG_HEIGHT), BACKGROUND_COLOR + (255,))

    for config in PHOTO_CONFIGS:
        photo, position = process_photo(source_dir, config)
        canvas.paste(photo, position, photo)

    final = canvas.convert("RGB")
    final.save(OUTPUT_PATH, "JPEG", quality=90)
    print(f"Generated: {OUTPUT_PATH}")
    print(f"From: {source_dir}")
    print(f"Size: {OUTPUT_PATH.stat().st_size:,} bytes")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python-main scripts/generate_og_image.py <folder>")
        print("Example: python-main scripts/generate_og_image.py docs/og-image")
        sys.exit(1)

    source_dir = Path(sys.argv[1])
    if not source_dir.exists():
        print(f"Error: Folder not found: {source_dir}")
        sys.exit(1)

    generate_og_image(source_dir)
