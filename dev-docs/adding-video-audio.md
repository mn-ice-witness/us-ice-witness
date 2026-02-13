# Adding Media to Incidents

*For AI assistants helping users add video or image media to incidents.*

## Prerequisites

### System Tools

**ffmpeg and ffprobe** are required for all media processing (video compression, image optimization, OG image generation).

| Platform | Install Command |
|----------|----------------|
| macOS | `brew install ffmpeg` |
| Ubuntu | `sudo apt install ffmpeg` |
| Windows | `choco install ffmpeg` |

### Python Packages

The following packages must be installed in the Python environment configured in `~/.ice-witness.config`:

| Package | pip name | Import name | Purpose |
|---------|----------|-------------|---------|
| PyYAML | `pyyaml` | `yaml` | Config file parsing |
| Pillow | `pillow` | `PIL` | Site-level OG image generation |

Install both:
```bash
<python_exe> -m pip install pyyaml pillow
```

Where `<python_exe>` is the Python path from `~/.ice-witness.config`. For example:
```bash
/opt/homebrew/bin/python3 -m pip install pyyaml pillow
```

### Verifying Prerequisites

The config module validates everything. Run any script and it will error with clear messages if something is missing:
```bash
./us-ice-witness-repo/bin/run process_media.py
```

---

## How Media Matching Works

The system matches media files to incidents **by filename**. The raw media file's name (minus the `.raw` suffix and extension) must exactly match the incident file's name (minus `.md`).

| Incident File | Raw Media File | Processed Output |
|---------------|---------------|-----------------|
| `docs/incidents/2026-01/15/2026-01-15-aurora-arrest.md` | `raw_media/2026-01/15/2026-01-15-aurora-arrest.raw.mov` | `docs/media/2026-01/15/2026-01-15-aurora-arrest.mp4` |
| `docs/incidents/2026-01/15/2026-01-15-aurora-arrest.md` | `raw_media/2026-01/15/2026-01-15-aurora-arrest.raw.png` | `docs/media/2026-01/15/2026-01-15-aurora-arrest.jpg` |

There is NO `media` field in the incident frontmatter. The summary generator (`generate_summary.py`) automatically detects media by scanning `docs/media/` for files whose names match incident slugs.

---

## Procedure 1: Create the Folder and Name the File Manually

Use this when you know the incident ID and want full control over placement.

### Step-by-step

1. **Determine the incident ID (slug).** This is the incident filename without `.md`. Example: `2026-01-15-aurora-arrest`

2. **Extract date parts from the slug.** The slug always starts with `YYYY-MM-DD-`. From `2026-01-15-aurora-arrest`:
   - Year-month: `2026-01`
   - Day: `15`

3. **Create the target folder in `raw_media/`:**
   ```bash
   mkdir -p raw_media/2026-01/15
   ```

4. **Move/rename the raw file into the folder with the correct name.** The filename must be `<slug>.raw.<ext>`:
   ```bash
   mv "/path/to/source-video.mov" raw_media/2026-01/15/2026-01-15-aurora-arrest.raw.mov
   ```
   For images:
   ```bash
   mv "/path/to/screenshot.png" raw_media/2026-01/15/2026-01-15-aurora-arrest.raw.png
   ```

5. **Run the media pipeline:**
   ```bash
   ./us-ice-witness-repo/bin/run process_media.py
   ```
   This processes raw media into `docs/media/` and generates OG images for videos.

6. **Regenerate the summary** (so the site knows about the new media):
   ```bash
   ./us-ice-witness-repo/bin/run generate_summary.py
   ```

   Or run both steps at once with the pipeline script:
   ```bash
   ./us-ice-witness-repo/bin/run run-media-pipeline.py
   ```

7. **Verify** that these files were created:
   - `docs/media/2026-01/15/2026-01-15-aurora-arrest.mp4` (or `.jpg` for images)
   - `docs/media/2026-01/15/2026-01-15-aurora-arrest-og-2s-<mtime>.jpg` (for videos only)

### Example: Full walkthrough for a video

```bash
# Incident ID: 2026-02-10-denver-courthouse
mkdir -p raw_media/2026-02/10
mv ~/Downloads/courthouse-clip.mov raw_media/2026-02/10/2026-02-10-denver-courthouse.raw.mov
./us-ice-witness-repo/bin/run run-media-pipeline.py
```

### Example: Full walkthrough for an image

```bash
# Incident ID: 2026-02-10-denver-courthouse
mkdir -p raw_media/2026-02/10
mv ~/Downloads/courthouse-screenshot.png raw_media/2026-02/10/2026-02-10-denver-courthouse.raw.png
./us-ice-witness-repo/bin/run run-media-pipeline.py
```

---

## Procedure 2: Drop File in raw_media Root, Then Use Helper Script to Organize

Use this when you want to quickly drop files into `raw_media/` without manually creating date folders. The `folderize_media.py` script reads the date from each filename and moves it into the correct `YYYY-MM/DD/` subfolder.

### Step-by-step

1. **Rename the raw file to match the incident ID.** Place it directly in `raw_media/` (the root, not a subfolder). The filename must follow the pattern `<slug>.raw.<ext>`:
   ```bash
   mv "/path/to/source-video.mov" raw_media/2026-01-15-aurora-arrest.raw.mov
   ```

2. **Run the folderize script** to move it into the correct date-based subfolder:
   ```bash
   # Dry run first (shows what would happen, moves nothing):
   ./us-ice-witness-repo/bin/run folderize_media.py

   # Actually move files:
   ./us-ice-witness-repo/bin/run folderize_media.py --execute
   ```
   This moves `raw_media/2026-01-15-aurora-arrest.raw.mov` into `raw_media/2026-01/15/2026-01-15-aurora-arrest.raw.mov`.

3. **Run the media pipeline:**
   ```bash
   ./us-ice-witness-repo/bin/run run-media-pipeline.py
   ```

4. **Verify** that processed files appeared in `docs/media/`.

### How folderize_media.py works

- Scans files in the **top level** of `raw_media/` (and `docs/media/`)
- Extracts the date from each filename using the pattern `YYYY-MM-DD-*`
- Moves each file into `YYYY-MM/DD/` subfolder
- Files already in subfolders are untouched
- Files without a date pattern in their name are skipped
- **Default is dry-run** — you must pass `--execute` to actually move files

### Example: Multiple files at once

```bash
# Drop several raw files into raw_media/ root
mv ~/Downloads/clip1.mov raw_media/2026-02-10-denver-courthouse.raw.mov
mv ~/Downloads/clip2.mov raw_media/2026-02-12-springs-raid.raw.mov
mv ~/Downloads/screenshot.png raw_media/2026-02-12-springs-raid.raw.png

# Organize all of them into date folders at once
./us-ice-witness-repo/bin/run folderize_media.py --execute

# Process everything
./us-ice-witness-repo/bin/run run-media-pipeline.py
```

---

## Multi-Part Videos

When an incident has multiple video clips that should be concatenated into one video, use numbered suffixes with a colon separator.

### Naming convention

```
raw_media/2026-01/15/
├── 2026-01-15-aurora-arrest:01.raw.mov
├── 2026-01-15-aurora-arrest:02.raw.mov
└── 2026-01-15-aurora-arrest:03.raw.mov
```

Rules:
- Start numbering at `:01`
- No gaps allowed (`:01`, `:02`, `:03` — not `:01`, `:03`)
- All parts must have the same file extension
- Parts are concatenated in numerical order into a single output: `2026-01-15-aurora-arrest.mp4`

### Both video and image for same incident

An incident can have both a video and an image. Just name them with the same slug but different extensions:
```
raw_media/2026-01/15/
├── 2026-01-15-aurora-arrest.raw.mov
└── 2026-01-15-aurora-arrest.raw.png
```

---

## What the Media Pipeline Does

### Videos
- Compresses with H.264 codec (CRF 35, or CRF 30 for high-quality videos)
- Scales to 720p max height
- Crops 8px from all edges (removes screen recording artifacts)
- Caps at 30fps
- Normalizes audio to EBU R128 standard (-16 LUFS)
- Adds `faststart` flag for web streaming
- Generates an OG image (1200x630) from a frame at 2 seconds (customizable)

### Images
- Converts to optimized JPEG
- Scales to 1200px max width

### OG Images (automatic, for videos only)
- Extracts a frame from the video (default: 2 seconds in)
- Scales to 1200x630 with letterboxing for social media previews
- Filename includes timestamp and mtime for cache busting

---

## Customizing OG Image Timestamps

To change which frame is used for a video's OG image, edit `docs/data/og-tweaks.md`:

```markdown
# OG Image Timestamps

```
2026-01-15-aurora-arrest: 5.5
2026-02-10-denver-courthouse: 8.0
```
```

---

## High Quality Video Encoding

Videos that need less compression (e.g., documents, text closeups) can use CRF 30 instead of the default 35. List them in `docs/data/high-quality-videos.md`:

```markdown
# High Quality Videos

```
2026-01-15-document-closeup
```
```

---

## Custom OG Source Images

Instead of extracting a frame from the video, you can provide a custom image to use as the OG image. Name it with `.raw_og` before the extension:

```
raw_media/2026-01/15/2026-01-15-aurora-arrest.raw_og.png
```

This will be scaled to 1200x630 with letterboxing instead of extracting a frame from the video.

---

## Folder Structure Reference

```
raw_media/                              # NOT tracked by git (local only)
├── 2026-01/
│   └── 15/
│       ├── 2026-01-15-aurora-arrest.raw.mov
│       ├── 2026-01-15-aurora-arrest.raw.png
│       └── 2026-01-15-aurora-arrest.raw_og.png
└── 2026-02/
    └── 10/
        ├── 2026-02-10-denver-courthouse:01.raw.mov
        └── 2026-02-10-denver-courthouse:02.raw.mov

docs/media/                             # Tracked by git (deployed)
├── 2026-01/
│   └── 15/
│       ├── 2026-01-15-aurora-arrest.mp4
│       ├── 2026-01-15-aurora-arrest.jpg
│       └── 2026-01-15-aurora-arrest-og-2s-1234567890.jpg
└── 2026-02/
    └── 10/
        └── 2026-02-10-denver-courthouse.mp4
```

---

## Quick Reference for AI Assistants

### Given an incident ID and a raw file, add media:

```bash
# 1. Determine date parts from incident ID
#    Example: 2026-02-10-denver-courthouse -> year-month=2026-02, day=10

# 2. Create folder and move file
mkdir -p raw_media/2026-02/10
mv "/path/to/file.mov" raw_media/2026-02/10/2026-02-10-denver-courthouse.raw.mov

# 3. Process and generate summary
./us-ice-witness-repo/bin/run run-media-pipeline.py
```

### Given a raw file already in raw_media/ root with correct name:

```bash
# 1. Organize into date folder
./us-ice-witness-repo/bin/run folderize_media.py --execute

# 2. Process and generate summary
./us-ice-witness-repo/bin/run run-media-pipeline.py
```

### Force reprocess all media:

```bash
./us-ice-witness-repo/bin/run process_media.py --force
./us-ice-witness-repo/bin/run generate_summary.py
```
