#!/usr/bin/env python3
"""
Generate incidents-summary.json from markdown incident files.
This creates a single JSON file with all metadata needed for table rendering,
eliminating the need to fetch individual markdown files on page load.
"""

from __future__ import annotations

import json
import re
import subprocess
import time
from pathlib import Path


# Media extensions for detecting local media
VIDEO_EXTENSIONS = {".mp4", ".webm"}
IMAGE_EXTENSIONS = {".webp", ".jpg", ".jpeg", ".png"}

# Pattern to extract date from filename: YYYY-MM-DD-rest
DATE_PATTERN = re.compile(r"^(\d{4})-(\d{2})-(\d{2})-")


def get_date_folder(slug: str) -> str | None:
    """Extract YYYY-MM/DD folder path from slug."""
    match = DATE_PATTERN.match(slug)
    if match:
        year, month, day = match.groups()
        return f"{year}-{month}/{day}"
    return None


def get_media_aspect_ratio(file_path: Path):
    """Get aspect ratio (width/height) of a media file using ffprobe."""
    try:
        result = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-select_streams",
                "v:0",
                "-show_entries",
                "stream=width,height",
                "-of",
                "csv=p=0",
                str(file_path),
            ],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode == 0 and result.stdout.strip():
            parts = result.stdout.strip().split(",")
            if len(parts) >= 2:
                width, height = int(parts[0]), int(parts[1])
                if height > 0:
                    return width / height
    except (subprocess.TimeoutExpired, FileNotFoundError, ValueError):
        pass
    return None


def find_og_image(slug: str, media_dir: Path):
    """Find OG image for a video using pattern (e.g., slug-og-2s-1234567890.jpg)."""
    date_folder = get_date_folder(slug)
    pattern = f"{slug}-og-*.jpg"

    # Check date-based folder first
    if date_folder:
        folder_path = media_dir / date_folder
        if folder_path.exists():
            matches = list(folder_path.glob(pattern))
            if matches:
                matches.sort(key=lambda p: p.stat().st_mtime, reverse=True)
                return f"media/{date_folder}/{matches[0].name}"

    # Fall back to flat structure
    matches = list(media_dir.glob(pattern))
    if matches:
        matches.sort(key=lambda p: p.stat().st_mtime, reverse=True)
        return f"media/{matches[0].name}"
    return None


def get_local_media(slug: str, media_dir: Path) -> dict:
    """Check for local media files matching the incident slug."""
    result = {
        "hasLocalMedia": False,
        "localMediaType": None,
        "localMediaPath": None,
        "localMediaOgPath": None,
        "localMediaFiles": [],
        "aspectRatio": None,
        "mediaVersion": None,
    }

    if not media_dir.exists():
        return result

    # Determine the search directory and path prefix
    date_folder = get_date_folder(slug)
    if date_folder:
        folder_path = media_dir / date_folder
        if folder_path.exists():
            search_dir = folder_path
            path_prefix = f"media/{date_folder}"
        else:
            # Fall back to flat structure
            search_dir = media_dir
            path_prefix = "media"
    else:
        search_dir = media_dir
        path_prefix = "media"

    media_files = []

    # Collect all matching video files
    for ext in VIDEO_EXTENSIONS:
        media_path = search_dir / f"{slug}{ext}"
        if media_path.exists():
            media_files.append(
                {"type": "video", "path": f"{path_prefix}/{slug}{ext}", "file": media_path}
            )

    # Collect all matching image files
    for ext in IMAGE_EXTENSIONS:
        media_path = search_dir / f"{slug}{ext}"
        if media_path.exists():
            media_files.append(
                {"type": "image", "path": f"{path_prefix}/{slug}{ext}", "file": media_path}
            )

    if media_files:
        result["hasLocalMedia"] = True
        result["localMediaFiles"] = [
            {"type": m["type"], "path": m["path"]} for m in media_files
        ]
        # Primary media (video preferred) for backwards compatibility
        primary = next((m for m in media_files if m["type"] == "video"), media_files[0])
        result["localMediaType"] = primary["type"]
        result["localMediaPath"] = primary["path"]
        # Get aspect ratio for primary media
        result["aspectRatio"] = get_media_aspect_ratio(primary["file"])
        # Per-video cache version based on file mtime
        result["mediaVersion"] = int(primary["file"].stat().st_mtime)
        # Find OG image for videos (timestamp-based naming: slug-og-2s.jpg)
        if primary["type"] == "video":
            result["localMediaOgPath"] = find_og_image(slug, media_dir)

    return result


def parse_frontmatter(content):
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return {}, content

    frontmatter_text = match.group(1)
    body = content[match.end() :].strip()

    meta = {}
    for line in frontmatter_text.split("\n"):
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        meta[key.strip()] = value.strip()

    return meta, body


def extract_title(body):
    match = re.search(r"^# (.+)$", body, re.MULTILINE)
    return match.group(1).strip() if match else "Untitled Incident"


def extract_summary(body):
    match = re.search(r"## Summary\n+([\s\S]*?)(?=\n## |$)", body)
    if match:
        return match.group(1).strip().split("\n")[0]
    return ""


def extract_latest_update(body):
    """Extract the most recent update text from ## Updates section."""
    match = re.search(r"## Updates\n+- \*\*[^*]+\*\* - (.+?)(?:\n|$)", body)
    if match:
        return match.group(1).strip()
    return None


def parse_type(type_value):
    if "," in type_value:
        return [t.strip() for t in type_value.split(",")]
    return type_value


def count_media(content):
    videos = len(re.findall(r"\*\*Video:\*\*", content, re.IGNORECASE))
    photos = len(re.findall(r"\*\*Photo:\*\*", content, re.IGNORECASE))
    analysis = len(re.findall(r"\*\*Analysis:\*\*", content, re.IGNORECASE))
    return videos + photos + analysis


REQUIRED_FIELDS = ["date", "type", "status", "trustworthiness", "created", "last_updated"]

VALID_STATUS = {"ongoing", "resolved", "under-investigation"}
VALID_INJURIES = {"none", "minor", "serious", "fatal"}
VALID_TRUSTWORTHINESS = {"high", "medium", "low", "unverified"}
VALID_TYPES = {"citizens", "observers", "immigrants", "schools-hospitals", "response"}
VALID_CITIZENSHIP = {"us-citizen", "legal-resident", "asylum-seeker", "undocumented", "unknown", "n/a", "various"}


def validate_frontmatter(meta, file_path):
    errors = []

    missing = [field for field in REQUIRED_FIELDS if not meta.get(field)]
    if missing:
        errors.append(f"missing required fields: {', '.join(missing)}")

    status = meta.get("status", "").strip().lower()
    if status and status not in VALID_STATUS:
        errors.append(f"invalid status '{status}' (must be: {', '.join(sorted(VALID_STATUS))})")

    injuries = meta.get("injuries", "").strip().lower()
    if injuries and injuries not in VALID_INJURIES:
        errors.append(f"invalid injuries '{injuries}' (must be: {', '.join(sorted(VALID_INJURIES))})")

    trust = meta.get("trustworthiness", "").strip().lower()
    if trust and trust not in VALID_TRUSTWORTHINESS:
        errors.append(f"invalid trustworthiness '{trust}' (must be: {', '.join(sorted(VALID_TRUSTWORTHINESS))})")

    type_value = meta.get("type", "").strip().lower()
    if type_value:
        types = [t.strip() for t in type_value.split(",")]
        for t in types:
            if t not in VALID_TYPES:
                errors.append(f"invalid type '{t}' (must be: {', '.join(sorted(VALID_TYPES))})")

    citizenship = meta.get("affected_individual_citizenship", "").strip().lower()
    if citizenship and citizenship not in VALID_CITIZENSHIP:
        errors.append(f"invalid citizenship '{citizenship}' (must be: {', '.join(sorted(VALID_CITIZENSHIP))})")

    if errors:
        raise ValueError(f"{file_path.name}: " + "; ".join(errors))


def process_incident(file_path, docs_dir, media_dir):
    content = file_path.read_text()
    meta, body = parse_frontmatter(content)

    validate_frontmatter(meta, file_path)

    relative_path = str(file_path.relative_to(docs_dir))

    # Extract slug from filename (without .md)
    slug = file_path.stem

    notable_value = meta.get("notable", "false").lower()
    is_notable = notable_value in ("true", "yes", "1")

    # Check for local media
    local_media = get_local_media(slug, media_dir)

    return {
        "filePath": relative_path,
        "title": extract_title(body),
        "summary": extract_summary(body),
        "latestUpdate": extract_latest_update(body),
        "date": meta.get("date", "Unknown"),
        "time": meta.get("time", "unknown"),
        "location": meta.get("location", "Unknown location"),
        "city": meta.get("city", "Minneapolis"),
        "type": parse_type(meta.get("type", "unknown")),
        "status": meta.get("status", "unknown"),
        "affectedIndividualCitizenship": meta.get("affected_individual_citizenship", "unknown"),
        "injuries": meta.get("injuries", "unknown"),
        "trustworthiness": meta.get("trustworthiness", "unverified"),
        "created": meta["created"],
        "lastUpdated": meta["last_updated"],
        "mediaCount": count_media(content),
        "notable": is_notable,
        "hasLocalMedia": local_media["hasLocalMedia"],
        "localMediaType": local_media["localMediaType"],
        "localMediaPath": local_media["localMediaPath"],
        "localMediaOgPath": local_media["localMediaOgPath"],
        "localMediaFiles": local_media["localMediaFiles"],
        "aspectRatio": local_media["aspectRatio"],
        "mediaVersion": local_media["mediaVersion"],
    }


def extract_slug_from_filename(filename):
    """Extract slug from filename, removing date prefix (YYYY-MM-DD-)."""
    stem = Path(filename).stem
    # Remove date prefix if present (e.g., 2026-01-11-speedway-st-paul -> speedway-st-paul)
    if re.match(r"^\d{4}-\d{2}-\d{2}-", stem):
        return stem[11:]
    return stem


def update_media_order(incidents_with_media, data_dir):
    """Update media-order.md with any new media items."""
    order_file = data_dir / "media-order.md"

    existing_slugs = []
    header_lines = []

    if order_file.exists():
        lines = order_file.read_text().strip().split("\n")
        for line in lines:
            stripped = line.strip()
            if stripped.startswith("#") or not stripped:
                header_lines.append(line)
            else:
                existing_slugs.append(stripped)

    media_slugs = set()
    for incident in incidents_with_media:
        slug = extract_slug_from_filename(incident["filePath"])
        media_slugs.add(slug)

    new_slugs = [s for s in media_slugs if s not in existing_slugs]
    new_slugs.sort()

    if new_slugs:
        all_slugs = existing_slugs + new_slugs
        content = "\n".join(header_lines) + "\n\n" + "\n".join(all_slugs) + "\n"
        order_file.write_text(content)


def main():
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    docs_dir = project_root / "docs"
    incidents_dir = docs_dir / "incidents"
    media_dir = docs_dir / "media"
    output_file = docs_dir / "data" / "incidents-summary.json"

    output_file.parent.mkdir(parents=True, exist_ok=True)

    incidents = []
    for md_file in incidents_dir.rglob("*.md"):
        # Skip files starting with underscore (commented out/draft incidents)
        if md_file.name.startswith("_"):
            continue
        incident = process_incident(md_file, docs_dir, media_dir)
        incidents.append(incident)

    incidents.sort(key=lambda x: x["date"], reverse=True)

    # Count media for summary
    incidents_with_media = [i for i in incidents if i["hasLocalMedia"]]
    media_count = len(incidents_with_media)

    # Update media order file with new items
    update_media_order(incidents_with_media, docs_dir / "data")

    # Output incidents (each has its own mediaVersion based on file mtime)
    output_data = {"incidents": incidents}

    output_file.write_text(json.dumps(output_data, indent=2))

    print(
        f"Generated {output_file} with {len(incidents)} incidents ({media_count} with local media)"
    )


if __name__ == "__main__":
    main()
