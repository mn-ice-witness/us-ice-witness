#!/usr/bin/env python3
"""
Process raw media files for web delivery.
- Videos: Compress with H.264, normalize audio (EBU R128)
- Images: Convert to optimized JPEG
- OG Images: Generate social media preview images (1200x630) from videos

OG image timestamps can be customized via docs/data/og-tweaks.md. Default is 2.0 seconds.
OG filenames include the timestamp (e.g., incident-og-2.0s.jpg) so changes are tracked.

Supports multi-part videos with `:01`, `:02` suffixes - concatenates them in order.

Compares timestamps between raw_media/ and docs/media/ to process only new/updated files.
Use --force to reprocess all files regardless of timestamps.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path


DEFAULT_OG_TIMESTAMP = 2.0
DEFAULT_CRF = 35  # Higher = more compression, lower = better quality
HIGH_QUALITY_CRF = 30  # For videos marked as "high-quality"


# Video extensions to process
VIDEO_EXTENSIONS = {".mov", ".mp4", ".avi", ".mkv", ".webm", ".m4v", ".mv"}

# Pattern to match multi-part files: base:01.raw.mov, base:02.raw.mov, etc.
MULTIPART_PATTERN = re.compile(r"^(.+):(\d+)(\.raw)?$")

# Image extensions to process
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"}

# Pattern to match OG image files with timestamp: incident-og-2.0s.jpg
OG_FILENAME_PATTERN = re.compile(r"^(.+)-og-(\d+\.?\d*)s\.jpg$")

# Pattern to extract date from filename: YYYY-MM-DD-rest
DATE_PATTERN = re.compile(r"^(\d{4})-(\d{2})-(\d{2})-")


def get_date_folder(filename: str) -> str | None:
    """Extract YYYY-MM/DD folder path from filename."""
    match = DATE_PATTERN.match(filename)
    if match:
        year, month, day = match.groups()
        return f"{year}-{month}/{day}"
    return None


def load_og_tweaks(project_root: Path) -> dict[str, float]:
    """Load custom OG timestamps from docs/data/og-tweaks.md."""
    tweaks_path = project_root / "docs" / "data" / "og-tweaks.md"
    tweaks = {}

    if not tweaks_path.exists():
        return tweaks

    in_code_block = False
    for line in tweaks_path.read_text().splitlines():
        line = line.strip()
        if line == "```":
            in_code_block = not in_code_block
            continue
        if in_code_block and ":" in line and not line.startswith("#"):
            parts = line.split(":", 1)
            slug = parts[0].strip()
            try:
                timestamp = float(parts[1].strip())
                tweaks[slug] = timestamp
            except ValueError:
                pass

    return tweaks


def load_high_quality_videos(project_root: Path) -> set[str]:
    """Load list of videos that should use higher quality encoding from docs/data/high-quality-videos.md."""
    hq_path = project_root / "docs" / "data" / "high-quality-videos.md"
    high_quality = set()

    if not hq_path.exists():
        return high_quality

    in_code_block = False
    for line in hq_path.read_text().splitlines():
        line = line.strip()
        if line == "```":
            in_code_block = not in_code_block
            continue
        if in_code_block and line and not line.startswith("#"):
            high_quality.add(line)

    return high_quality


def parse_multipart_filename(path: Path) -> tuple[str, int] | None:
    """Parse a multi-part filename like 'base:01.raw.mov' -> ('base', 1) or None if not multi-part."""
    stem = path.stem
    match = MULTIPART_PATTERN.match(stem)
    if match:
        base = match.group(1)
        part_num = int(match.group(2))
        return (base, part_num)
    return None


def group_multipart_files(
    raw_files: list[Path],
) -> tuple[dict[str, list[Path]], list[Path]]:
    """
    Group multi-part files by base name, return singles separately.
    Returns: (multipart_groups, single_files)
    """
    groups: dict[str, list[tuple[int, Path]]] = {}
    singles: list[Path] = []

    for path in raw_files:
        parsed = parse_multipart_filename(path)
        if parsed:
            base, part_num = parsed
            key = f"{base}{path.suffix}"
            if key not in groups:
                groups[key] = []
            groups[key].append((part_num, path))
        else:
            singles.append(path)

    sorted_groups: dict[str, list[Path]] = {}
    for key, parts in groups.items():
        parts.sort(key=lambda x: x[0])
        sorted_groups[key] = [p[1] for p in parts]

    return sorted_groups, singles


def validate_multipart_sequence(base_name: str, parts: list[Path]) -> list[str]:
    """Validate a multi-part sequence is complete. Returns list of error messages."""
    errors = []
    part_numbers = []

    for path in parts:
        parsed = parse_multipart_filename(path)
        if parsed:
            part_numbers.append(parsed[1])

    part_numbers.sort()

    if part_numbers[0] != 1:
        errors.append(
            f"  {base_name}: Sequence must start at :01, found :{part_numbers[0]:02d}"
        )

    expected = list(range(1, len(part_numbers) + 1))
    if part_numbers != expected:
        missing = set(expected) - set(part_numbers)
        if missing:
            errors.append(
                f"  {base_name}: Missing parts: {', '.join(f':{n:02d}' for n in sorted(missing))}"
            )

    return errors


def get_video_dimensions(path: Path) -> tuple[int, int]:
    """Get video width and height using ffprobe."""
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height",
        "-of",
        "csv=p=0",
        str(path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    width, height = result.stdout.strip().split(",")
    return int(width), int(height)


def measure_loudnorm(input_path: Path) -> dict | None:
    """First pass of two-pass loudnorm: measure audio levels."""
    cmd = [
        "ffmpeg",
        "-i",
        str(input_path),
        "-af",
        "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
        "-f",
        "null",
        "-",
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        for line in result.stderr.split("\n"):
            if line.strip().startswith("{"):
                start = result.stderr.find("{", result.stderr.find(line))
                end = result.stderr.find("}", start) + 1
                json_str = result.stderr[start:end]
                return json.loads(json_str)
    except Exception:
        pass
    return None


def preprocess_video_part(input_path: Path, output_path: Path) -> bool:
    """Pre-process a video part: crop edges and normalize audio (two-pass loudnorm)."""
    print(f"    Pre-processing: {input_path.name}")

    measured = measure_loudnorm(input_path)
    if measured:
        loudnorm_filter = (
            f"loudnorm=I=-16:TP=-1.5:LRA=11:"
            f"measured_I={measured['input_i']}:"
            f"measured_TP={measured['input_tp']}:"
            f"measured_LRA={measured['input_lra']}:"
            f"measured_thresh={measured['input_thresh']}:"
            f"offset={measured['target_offset']}:"
            f"linear=true"
        )
        print(f"      Measured loudness: {measured['input_i']} LUFS")
    else:
        loudnorm_filter = "loudnorm=I=-16:TP=-1.5:LRA=11"
        print("      Using single-pass loudnorm (measurement failed)")

    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_path),
        "-vf",
        "crop=iw-16:ih-16:8:8,scale=-2:min(720\\,ih),fps=30",
        "-af",
        loudnorm_filter,
        "-c:v",
        "libx264",
        "-crf",
        "18",
        "-preset",
        "fast",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        str(output_path),
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"      Error: {result.stderr[:200]}")
            return False
        return True
    except FileNotFoundError:
        print("      Error: ffmpeg not found. Install with: brew install ffmpeg")
        return False


def concatenate_preprocessed_videos(
    input_paths: list[Path], output_path: Path, crf: int = DEFAULT_CRF
) -> bool:
    """Concatenate pre-processed videos with shadow boxing to match canvas size."""
    quality_note = " (high quality)" if crf < DEFAULT_CRF else ""
    print(
        f"  Concatenating {len(input_paths)} pre-processed parts into: {output_path.name}{quality_note}"
    )

    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    dimensions = [get_video_dimensions(p) for p in input_paths]
    canvas_width, canvas_height = dimensions[0]
    canvas_width += canvas_width % 2
    canvas_height += canvas_height % 2

    for i, (path, (w, h)) in enumerate(zip(input_paths, dimensions)):
        print(f"    Part {i + 1}: ({w}x{h})")
    print(f"    Target canvas (from part 1): {canvas_width}x{canvas_height}")

    inputs = []
    for path in input_paths:
        inputs.extend(["-i", str(path)])

    filter_parts = []
    for i in range(len(input_paths)):
        filter_parts.append(
            f"[{i}:v]scale={canvas_width}:{canvas_height}:force_original_aspect_ratio=decrease,"
            f"pad={canvas_width}:{canvas_height}:(ow-iw)/2:(oh-ih)/2:black[v{i}]"
        )

    concat_inputs = "".join(f"[v{i}][{i}:a]" for i in range(len(input_paths)))
    filter_parts.append(
        f"{concat_inputs}concat=n={len(input_paths)}:v=1:a=1[outv][outa]"
    )

    filter_complex = ";".join(filter_parts)

    cmd = [
        "ffmpeg",
        "-y",
        *inputs,
        "-filter_complex",
        filter_complex,
        "-map",
        "[outv]",
        "-map",
        "[outa]",
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        str(crf),
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
        str(output_path),
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"    Concat error: {result.stderr[:500]}")
            return False
        return True
    except FileNotFoundError:
        print("    Error: ffmpeg not found. Install with: brew install ffmpeg")
        return False


def get_output_path(raw_path: Path, output_dir: Path) -> Path:
    """Convert raw filename to output filename, using date-based folder structure."""
    stem = raw_path.stem
    # Remove .raw suffix if present
    if stem.endswith(".raw"):
        stem = stem[:-4]

    # Determine date folder from stem
    date_folder = get_date_folder(stem)
    if date_folder:
        target_dir = output_dir / date_folder
    else:
        target_dir = output_dir

    # Determine output extension based on input type
    suffix = raw_path.suffix.lower()
    if suffix in VIDEO_EXTENSIONS:
        return target_dir / f"{stem}.mp4"
    elif suffix in IMAGE_EXTENSIONS:
        return target_dir / f"{stem}.jpg"  # Use JPEG for compatibility
    return None


def get_multipart_output_path(base_name: str, output_dir: Path) -> Path:
    """Get output path for a multi-part video group (base name without :NN suffix)."""
    stem = base_name
    if stem.endswith(".raw"):
        stem = stem[:-4]
    # Remove the extension from the key (it was added for grouping)
    for ext in VIDEO_EXTENSIONS:
        if stem.endswith(ext):
            stem = stem[: -len(ext)]
            break

    # Determine date folder from stem
    date_folder = get_date_folder(stem)
    if date_folder:
        target_dir = output_dir / date_folder
    else:
        target_dir = output_dir

    return target_dir / f"{stem}.mp4"


def needs_processing(raw_path: Path, output_path: Path) -> bool:
    """Check if file needs processing (missing or outdated)."""
    if not output_path.exists():
        return True
    return raw_path.stat().st_mtime > output_path.stat().st_mtime


def multipart_needs_processing(parts: list[Path], output_path: Path) -> bool:
    """Check if any part of a multi-part group is newer than output."""
    if not output_path.exists():
        return True
    output_mtime = output_path.stat().st_mtime
    return any(p.stat().st_mtime > output_mtime for p in parts)


def process_video(input_path: Path, output_path: Path, crf: int = DEFAULT_CRF) -> bool:
    """Process video: compress with H.264, normalize audio, crop edges, optimize for web."""
    quality_note = " (high quality)" if crf < DEFAULT_CRF else ""
    print(f"  Processing video: {input_path.name}{quality_note}")

    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg",
        "-y",  # Overwrite output
        "-i",
        str(input_path),
        "-vcodec",
        "libx264",
        "-crf",
        str(crf),  # Quality (higher = smaller, lower = better quality)
        "-preset",
        "slow",  # Better compression
        "-vf",
        "crop=iw-16:ih-16:8:8,scale=-2:min(720\\,ih),fps=30",  # Crop 8px edges, max 720p height, 30fps
        "-af",
        "loudnorm=I=-16:TP=-1.5:LRA=11",  # EBU R128 audio normalization
        "-c:a",
        "aac",  # AAC audio codec
        "-b:a",
        "128k",  # Audio bitrate
        "-movflags",
        "+faststart",  # Web optimization
        str(output_path),
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"    Error: {result.stderr[:200]}")
            return False

        # Report compression
        input_size = input_path.stat().st_size / (1024 * 1024)
        output_size = output_path.stat().st_size / (1024 * 1024)
        ratio = (1 - output_size / input_size) * 100
        print(
            f"    Compressed: {input_size:.1f}MB -> {output_size:.1f}MB ({ratio:.0f}% reduction)"
        )
        return True
    except FileNotFoundError:
        print("    Error: ffmpeg not found. Install with: brew install ffmpeg")
        return False


def process_image(input_path: Path, output_path: Path) -> bool:
    """Process image: convert to optimized JPEG."""
    print(f"  Processing image: {input_path.name}")

    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg",
        "-y",  # Overwrite output
        "-i",
        str(input_path),
        "-vf",
        "scale=min(1200\\,iw):-1",  # Max width 1200, maintain aspect
        "-q:v",
        "3",  # JPEG quality (2-31, lower is better)
        str(output_path),
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"    Error: {result.stderr[:200]}")
            return False

        input_size = input_path.stat().st_size / 1024
        output_size = output_path.stat().st_size / 1024
        print(f"    Optimized: {input_size:.0f}KB -> {output_size:.0f}KB")
        return True
    except FileNotFoundError:
        print("    Error: ffmpeg not found. Install with: brew install ffmpeg")
        return False


def find_custom_og_source(slug: str, raw_dir: Path) -> Path | None:
    """Find a custom OG source image (slug.raw_og.png/jpg) in raw_media/."""
    # Determine date folder from slug
    date_folder = get_date_folder(slug)

    for ext in [".png", ".jpg", ".jpeg"]:
        # Check date-based folder first
        if date_folder:
            custom_path = raw_dir / date_folder / f"{slug}.raw_og{ext}"
            if custom_path.exists():
                return custom_path
        # Fall back to flat structure
        custom_path = raw_dir / f"{slug}.raw_og{ext}"
        if custom_path.exists():
            return custom_path
    return None


def process_custom_og_image(input_path: Path, og_path: Path) -> bool:
    """Process a custom OG image: scale to 1200x630 with letterboxing."""
    print(f"  Processing custom OG: {input_path.name} -> {og_path.name}")

    # Ensure output directory exists
    og_path.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_path),
        "-vf",
        "scale=1200:630:force_original_aspect_ratio=decrease,pad=1200:630:(ow-iw)/2:(oh-ih)/2:black",
        "-q:v",
        "2",
        str(og_path),
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"    Error: {result.stderr[:200]}")
            return False

        output_size = og_path.stat().st_size / 1024
        print(f"    Processed: {output_size:.0f}KB")
        return True
    except FileNotFoundError:
        print("    Error: ffmpeg not found. Install with: brew install ffmpeg")
        return False


def get_custom_og_path(video_output_path: Path, source_mtime: int) -> Path:
    """Get OG image path for a custom OG source (e.g., incident-og-custom-1769026840.jpg)."""
    return video_output_path.with_name(
        f"{video_output_path.stem}-og-custom-{source_mtime}.jpg"
    )


def generate_og_image(video_path: Path, og_path: Path, timestamp: float) -> bool:
    """Generate OG image (1200x630) from video at specified timestamp."""
    print(f"  Generating OG image: {og_path.name} (at {timestamp}s)")

    # Ensure output directory exists
    og_path.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg",
        "-y",
        "-ss",
        str(timestamp),
        "-i",
        str(video_path),
        "-vframes",
        "1",
        "-vf",
        "scale=1200:630:force_original_aspect_ratio=decrease,pad=1200:630:(ow-iw)/2:(oh-ih)/2:black",
        "-q:v",
        "2",
        str(og_path),
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"    Error: {result.stderr[:200]}")
            return False

        output_size = og_path.stat().st_size / 1024
        print(f"    Generated: {output_size:.0f}KB")
        return True
    except FileNotFoundError:
        print("    Error: ffmpeg not found. Install with: brew install ffmpeg")
        return False


def get_og_path(video_output_path: Path, timestamp: float, video_mtime: int) -> Path:
    """Get OG image path for a video with timestamp and mtime (e.g., incident-og-2s-1769026840.jpg)."""
    ts_str = f"{timestamp:.1f}".rstrip("0").rstrip(".")
    return video_output_path.with_name(
        f"{video_output_path.stem}-og-{ts_str}s-{video_mtime}.jpg"
    )


def find_existing_og_images(video_output_path: Path, output_dir: Path) -> list[Path]:
    """Find all existing OG images for a video (any timestamp/mtime)."""
    stem = video_output_path.stem
    # Match both old format (slug-og-2s.jpg) and new format (slug-og-2s-1234567890.jpg)
    pattern = f"{stem}-og-*.jpg"
    return list(output_dir.glob(pattern))


def cleanup_wrong_og_images(
    video_output_path: Path, correct_og_path: Path, output_dir: Path
) -> int:
    """Delete OG images with wrong timestamps. Returns count of deleted files."""
    deleted = 0
    existing = find_existing_og_images(video_output_path, output_dir)
    for og_file in existing:
        if og_file != correct_og_path:
            print(f"    Deleting old OG: {og_file.name}")
            og_file.unlink()
            deleted += 1
    # Also delete old-style OG images without timestamp
    old_style = output_dir / f"{video_output_path.stem}-og.jpg"
    if old_style.exists():
        print(f"    Deleting old OG: {old_style.name}")
        old_style.unlink()
        deleted += 1
    return deleted


def og_needs_processing(video_output_path: Path, og_path: Path) -> bool:
    """Check if OG image needs to be generated."""
    if not og_path.exists():
        return True
    if not video_output_path.exists():
        return False
    return video_output_path.stat().st_mtime > og_path.stat().st_mtime


def process_multipart_video(
    base_name: str,
    parts: list[Path],
    output_dir: Path,
    force: bool,
    crf: int = DEFAULT_CRF,
) -> tuple[int, int, int]:
    """Process a multi-part video: preprocess each part (crop + loudnorm), then concatenate."""
    output_path = get_multipart_output_path(base_name, output_dir)

    if not force and not multipart_needs_processing(parts, output_path):
        part_names = ", ".join(p.name for p in parts)
        print(f"  Skipping (up to date): {part_names}")
        return (0, 1, 0)

    quality_note = " (high quality)" if crf < DEFAULT_CRF else ""
    print(f"  Multi-part video: {base_name}{quality_note}")
    for i, p in enumerate(parts, 1):
        print(f"    Part {i}: {p.name}")

    preprocessed_paths = []
    try:
        for i, part_path in enumerate(parts, 1):
            tmp = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
            preprocessed_path = Path(tmp.name)
            tmp.close()

            if not preprocess_video_part(part_path, preprocessed_path):
                for p in preprocessed_paths:
                    p.unlink(missing_ok=True)
                return (0, 0, 1)
            preprocessed_paths.append(preprocessed_path)

        success = concatenate_preprocessed_videos(preprocessed_paths, output_path, crf)

    finally:
        for p in preprocessed_paths:
            p.unlink(missing_ok=True)

    if success:
        input_size = sum(p.stat().st_size for p in parts) / (1024 * 1024)
        output_size = output_path.stat().st_size / (1024 * 1024)
        ratio = (1 - output_size / input_size) * 100
        print(
            f"    Compressed: {input_size:.1f}MB -> {output_size:.1f}MB ({ratio:.0f}% reduction)"
        )
        return (1, 0, 0)
    return (0, 0, 1)


def main():
    parser = argparse.ArgumentParser(
        description="Process raw media files for web delivery"
    )
    parser.add_argument(
        "--force", action="store_true", help="Reprocess all files, ignoring timestamps"
    )
    args = parser.parse_args()

    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    raw_dir = project_root / "raw_media"
    output_dir = project_root / "docs" / "media"

    output_dir.mkdir(parents=True, exist_ok=True)

    if not raw_dir.exists():
        print(f"No raw_media directory found at {raw_dir}")
        print("Create it and add media files to process.")
        return

    all_extensions = VIDEO_EXTENSIONS | IMAGE_EXTENSIONS
    raw_files = [
        f
        for f in raw_dir.rglob("*")  # Recursively find all files in date folders
        if f.is_file()
        and f.suffix.lower() in all_extensions
        and not f.name.startswith("Screen")
        and ".raw_og" not in f.name  # Exclude custom OG sources (processed separately)
    ]

    if not raw_files:
        print("No media files found in raw_media/")
        return

    multipart_groups, single_files = group_multipart_files(raw_files)

    validation_errors = []
    for base_name, parts in multipart_groups.items():
        errs = validate_multipart_sequence(base_name, parts)
        validation_errors.extend(errs)

    if validation_errors:
        print("Multi-part sequence validation errors:")
        for err in validation_errors:
            print(err)
        print("\nFix these issues before processing.")
        return

    total_items = len(multipart_groups) + len(single_files)
    print(f"Found {len(raw_files)} media files in raw_media/")
    if multipart_groups:
        print(f"  {len(multipart_groups)} multi-part video(s)")
    print(f"  {len(single_files)} single file(s)")
    if args.force:
        print("Force mode: reprocessing all files")
    print()

    high_quality_videos = load_high_quality_videos(project_root)
    if high_quality_videos:
        print(
            f"High quality videos: {len(high_quality_videos)} configured (CRF {HIGH_QUALITY_CRF})"
        )
        print()

    processed = 0
    skipped = 0
    errors = 0
    video_outputs = []

    for base_name, parts in sorted(multipart_groups.items()):
        output_path = get_multipart_output_path(base_name, output_dir)
        slug = output_path.stem
        crf = HIGH_QUALITY_CRF if slug in high_quality_videos else DEFAULT_CRF
        p, s, e = process_multipart_video(base_name, parts, output_dir, args.force, crf)
        processed += p
        skipped += s
        errors += e
        video_outputs.append(output_path)

    for raw_path in sorted(single_files):
        output_path = get_output_path(raw_path, output_dir)
        if output_path is None:
            continue

        suffix = raw_path.suffix.lower()
        is_video = suffix in VIDEO_EXTENSIONS

        if not args.force and not needs_processing(raw_path, output_path):
            print(f"  Skipping (up to date): {raw_path.name}")
            skipped += 1
            if is_video:
                video_outputs.append(output_path)
            continue

        if is_video:
            slug = output_path.stem
            crf = HIGH_QUALITY_CRF if slug in high_quality_videos else DEFAULT_CRF
            success = process_video(raw_path, output_path, crf)
            video_outputs.append(output_path)
        else:
            success = process_image(raw_path, output_path)

        if success:
            processed += 1
        else:
            errors += 1

    print()
    print(f"Media: {processed} processed, {skipped} skipped, {errors} errors")

    og_tweaks = load_og_tweaks(project_root)
    if og_tweaks:
        print()
        print(f"Loaded {len(og_tweaks)} OG timestamp tweak(s)")

    og_processed = 0
    og_skipped = 0
    og_errors = 0
    og_cleaned = 0

    print()
    print("Generating OG images for videos...")

    for video_path in sorted(video_outputs):
        if not video_path.exists():
            continue

        slug = video_path.stem

        # Check for custom OG source first
        custom_og_source = find_custom_og_source(slug, raw_dir)
        if custom_og_source:
            source_mtime = int(custom_og_source.stat().st_mtime)
            og_path = get_custom_og_path(video_path, source_mtime)

            og_cleaned += cleanup_wrong_og_images(video_path, og_path, output_dir)

            if not args.force and og_path.exists():
                print(f"  Skipping OG (up to date): {og_path.name}")
                og_skipped += 1
                continue

            if process_custom_og_image(custom_og_source, og_path):
                og_processed += 1
            else:
                og_errors += 1
            continue

        # Fall back to extracting frame from video
        timestamp = og_tweaks.get(slug, DEFAULT_OG_TIMESTAMP)
        video_mtime = int(video_path.stat().st_mtime)
        og_path = get_og_path(video_path, timestamp, video_mtime)

        og_cleaned += cleanup_wrong_og_images(video_path, og_path, output_dir)

        # If og_path exists with correct mtime in name, it's up to date
        if not args.force and og_path.exists():
            print(f"  Skipping OG (up to date): {og_path.name}")
            og_skipped += 1
            continue

        if generate_og_image(video_path, og_path, timestamp):
            og_processed += 1
        else:
            og_errors += 1

    print()
    print(
        f"OG images: {og_processed} generated, {og_skipped} skipped, {og_cleaned} cleaned, {og_errors} errors"
    )


if __name__ == "__main__":
    main()
