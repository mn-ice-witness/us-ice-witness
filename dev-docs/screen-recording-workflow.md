# Screen Recording Workflow

How to capture, process, and add video/image clips to incidents.

## Overview

When you clip a video from a source (social media, news site, etc.), you'll often take multiple attempts. The workflow:

1. Record screen clips to `raw_media/` (macOS names them "Screen Recording YYYY-MM-DD at HH.MM.SS AM/PM.mov")
2. Use the script to move the latest one to the correct folder with the proper name
3. Run the media pipeline
4. Clean up failed attempts

## Quick Commands

```bash
# Move latest screen recording for an incident (video)
./scripts/move-screen-recording.sh --type mov INCIDENT_ID

# Move latest screen recording for an incident (image/screenshot)
./scripts/move-screen-recording.sh --type png INCIDENT_ID

# Run media pipeline after moving
python-main bin/run-media-pipeline.py INCIDENT_ID
```

## Full Workflow

### Step 1: Capture the Clip

1. Find the source video/image
2. Use macOS screen recording (Cmd+Shift+5) or screenshot (Cmd+Shift+4)
3. **Save directly to `raw_media/`** (not Desktop or Downloads)
4. Take multiple attempts if needed - only the latest one will be kept

### Step 2: Move and Rename

Run the script with the incident ID:

```bash
./scripts/move-screen-recording.sh --type mov 2026-01-24-nur-d-rapper-detained
```

This will:
- Find the latest `Screen Recording*.mov` in `raw_media/`
- Create `raw_media/2026-01/24/` if needed
- Move and rename to `raw_media/2026-01/24/2026-01-24-nur-d-rapper-detained.raw.mov`
- Delete all other `Screen Recording*.mov` files in `raw_media/`

For screenshots/images, use `--type png`:

```bash
./scripts/move-screen-recording.sh --type png 2026-01-24-some-incident
```

### Step 3: Run Media Pipeline

```bash
python-main bin/run-media-pipeline.py INCIDENT_ID
```

This compresses the video/image and generates an OG image for social sharing. The summary generator automatically detects media by matching filenames to incident slugs — no need to update the incident file.

### Step 4: Verify

Check that:
- `docs/media/` contains the processed file
- `docs/og/` contains the OG image (for videos)
- The incident page shows the video/image

## Script Details

**Location:** `scripts/move-screen-recording.sh`

**Arguments:**
- `--type mov|png` (required) - File type to process
- `INCIDENT_ID` (required) - Must be in format `YYYY-MM-DD-name`

**What it does:**
1. Validates the incident ID format
2. Extracts date parts to determine target folder
3. Finds the latest Screen Recording of the specified type
4. Creates target directory if needed
5. Moves and renames the file
6. Deletes all other Screen Recording files of that type

**Error handling:**
- Exits if no Screen Recording files found
- Exits if incident ID format is invalid
- Shows helpful error messages

## Common Scenarios

### Multiple Video Clips for Same Incident

Use numbered suffixes:
```bash
# First clip
./scripts/move-screen-recording.sh --type mov 2026-01-24-incident-name
# Then manually rename to: 2026-01-24-incident-name:01.raw.mov

# Second clip
./scripts/move-screen-recording.sh --type mov 2026-01-24-incident-name
# Then manually rename to: 2026-01-24-incident-name:02.raw.mov
```

### Both Video and Image for Same Incident

Run the script twice with different types:
```bash
./scripts/move-screen-recording.sh --type mov 2026-01-24-incident-name
./scripts/move-screen-recording.sh --type png 2026-01-24-incident-name
```

### Cleanup Without Moving

If you just want to delete all Screen Recording files:
```bash
rm raw_media/Screen*.mov
rm raw_media/Screen*.png
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

> "Move the latest mov to raw for [INCIDENT_ID] and run the media pipeline"

or

> "Move latest png for [INCIDENT_ID], run pipeline"

Claude will:
1. Run `./scripts/move-screen-recording.sh --type mov|png INCIDENT_ID`
2. Run `python-main bin/run-media-pipeline.py INCIDENT_ID`
3. Update the incident file's `media` field if needed
