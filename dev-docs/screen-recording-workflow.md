# Screen Recording Workflow

How to capture, process, and add video/image clips to incidents.

## Overview

When you clip a video from a source (social media, news site, etc.), you'll often take multiple attempts. The workflow:

1. Record screen clips (macOS saves them as "Screen Recording YYYY-MM-DD at HH.MM.SS AM/PM.mov")
2. Rename the file to match the incident slug and place in `raw_media/`
3. Run the media pipeline
4. Clean up failed attempts

## Quick Commands

```bash
# Rename and place file directly (Procedure 1)
mkdir -p raw_media/YYYY-MM/DD
mv "raw_media/Screen Recording.mov" raw_media/YYYY-MM/DD/INCIDENT_ID.raw.mov

# Or drop in raw_media root and folderize (Procedure 2)
mv "raw_media/Screen Recording.mov" raw_media/INCIDENT_ID.raw.mov
./us-ice-witness-repo/bin/run folderize_media.py --execute

# Run media pipeline after placing the file
./us-ice-witness-repo/bin/run run-media-pipeline.py
```

## Full Workflow

### Step 1: Capture the Clip

1. Find the source video/image
2. Use macOS screen recording (Cmd+Shift+5) or screenshot (Cmd+Shift+4)
3. **Save directly to `raw_media/`** (not Desktop or Downloads)
4. Take multiple attempts if needed — only keep the best one

### Step 2: Rename and Place the File

**Option A — Create the folder yourself:**

```bash
mkdir -p raw_media/2026-01/24
mv "raw_media/Screen Recording 2026-01-24 at 3.45.22 PM.mov" raw_media/2026-01/24/2026-01-24-nur-d-rapper-detained.raw.mov
```

**Option B — Drop in root and use folderize:**

```bash
mv "raw_media/Screen Recording 2026-01-24 at 3.45.22 PM.mov" raw_media/2026-01-24-nur-d-rapper-detained.raw.mov
./us-ice-witness-repo/bin/run folderize_media.py --execute
```

For screenshots/images, use the same process but with `.raw.png`:

```bash
mv "raw_media/Screenshot 2026-01-24 at 3.45.22 PM.png" raw_media/2026-01/24/2026-01-24-some-incident.raw.png
```

### Step 3: Run Media Pipeline

```bash
./us-ice-witness-repo/bin/run run-media-pipeline.py
```

This compresses the video/image and generates an OG image for social sharing. The summary generator automatically detects media by matching filenames to incident slugs — no need to update the incident file.

### Step 4: Verify

Check that:
- `docs/media/` contains the processed file
- The incident page shows the video/image

### Step 5: Clean Up

Delete leftover screen recording attempts:
```bash
rm raw_media/Screen*.mov
rm raw_media/Screen*.png
```

## Common Scenarios

### Multiple Video Clips for Same Incident

Use numbered suffixes:
```bash
mv "Screen Recording 1.mov" raw_media/2026-01/24/2026-01-24-incident-name:01.raw.mov
mv "Screen Recording 2.mov" raw_media/2026-01/24/2026-01-24-incident-name:02.raw.mov
```

### Both Video and Image for Same Incident

Just name them with the same slug but different extensions:
```bash
mv clip.mov raw_media/2026-01/24/2026-01-24-incident-name.raw.mov
mv screenshot.png raw_media/2026-01/24/2026-01-24-incident-name.raw.png
```

## Folder Structure

Raw media is organized by year-month and day:
```
raw_media/
├── 2026-01/
│   ├── 07/
│   │   ├── 2026-01-07-renee-good-shooting.raw.mov
│   │   └── 2026-01-07-renee-good-shooting.raw.png
│   ├── 24/
│   │   ├── 2026-01-24-alex-pretti-shooting:01.raw.mov
│   │   ├── 2026-01-24-alex-pretti-shooting:02.raw.mov
│   │   └── 2026-01-24-nur-d-rapper-detained.raw.mov
```

## Asking Claude to Do This

When asking Claude to process a screen recording, say:

> "Move the latest recording to raw for [INCIDENT_ID] and run the media pipeline"

or

> "Move latest screenshot for [INCIDENT_ID], run pipeline"

Claude will:
1. Rename and move the file to the correct `raw_media/YYYY-MM/DD/` folder
2. Run `./us-ice-witness-repo/bin/run run-media-pipeline.py`
