#!/usr/bin/env python3
"""
Reorganize media files into date-based folder structure.

Moves files from flat structure to YYYY-MM/DD/ folders:
  2026-01-25-filename.mp4 -> 2026-01/25/2026-01-25-filename.mp4

Works on both docs/media/ and raw_media/ directories.
"""

from __future__ import annotations

import argparse
import re
import shutil
from pathlib import Path

# Pattern to extract date from filename: YYYY-MM-DD-rest
DATE_PATTERN = re.compile(r"^(\d{4})-(\d{2})-(\d{2})-")


def get_date_folder(filename: str) -> str | None:
    """Extract YYYY-MM/DD folder path from filename."""
    match = DATE_PATTERN.match(filename)
    if match:
        year, month, day = match.groups()
        return f"{year}-{month}/{day}"
    return None


def folderize_directory(directory: Path, dry_run: bool = True) -> tuple[int, int]:
    """
    Move files in directory into date-based subfolders.
    Returns (moved_count, skipped_count).
    """
    if not directory.exists():
        print(f"Directory not found: {directory}")
        return (0, 0)

    moved = 0
    skipped = 0

    # Get all files in the top level (not in subdirectories)
    files = [f for f in directory.iterdir() if f.is_file()]

    for file_path in sorted(files):
        folder = get_date_folder(file_path.name)
        if folder is None:
            print(f"  Skipping (no date pattern): {file_path.name}")
            skipped += 1
            continue

        target_dir = directory / folder
        target_path = target_dir / file_path.name

        if target_path.exists():
            print(f"  Skipping (already exists): {target_path}")
            skipped += 1
            continue

        if dry_run:
            print(f"  Would move: {file_path.name} -> {folder}/{file_path.name}")
        else:
            target_dir.mkdir(parents=True, exist_ok=True)
            shutil.move(str(file_path), str(target_path))
            print(f"  Moved: {file_path.name} -> {folder}/{file_path.name}")
        moved += 1

    return (moved, skipped)


def main():
    parser = argparse.ArgumentParser(
        description="Reorganize media files into date-based folders"
    )
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Actually move files (default is dry-run)",
    )
    args = parser.parse_args()

    dry_run = not args.execute

    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    docs_media = project_root / "docs" / "media"
    raw_media = project_root / "raw_media"

    if dry_run:
        print("=== DRY RUN (use --execute to actually move files) ===\n")

    print(f"Processing docs/media/ ({docs_media})...")
    docs_moved, docs_skipped = folderize_directory(docs_media, dry_run)
    print(f"  Total: {docs_moved} to move, {docs_skipped} skipped\n")

    print(f"Processing raw_media/ ({raw_media})...")
    raw_moved, raw_skipped = folderize_directory(raw_media, dry_run)
    print(f"  Total: {raw_moved} to move, {raw_skipped} skipped\n")

    if dry_run:
        print("=== DRY RUN COMPLETE ===")
        print("Run with --execute to actually move files.")
    else:
        print("=== DONE ===")
        print(f"Moved {docs_moved + raw_moved} files total.")
        print("\nNext steps:")
        print("1. Run: python scripts/generate_summary.py")
        print("2. Verify the site works locally")


if __name__ == "__main__":
    main()
