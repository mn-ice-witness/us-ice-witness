# Media

## Requirements

### ffmpeg

Required for all media processing (video compression, image optimization, OG images).

| Platform | Command |
|----------|---------|
| macOS | `brew install ffmpeg` |
| Ubuntu | `sudo apt install ffmpeg` |
| Windows | `choco install ffmpeg` |

### Python Packages

Install these in the Python environment from `~/.ice-witness.config`:

```bash
<your-python> -m pip install pyyaml pillow
```

| Package | pip name | Purpose |
|---------|----------|---------|
| PyYAML | `pyyaml` | Config file parsing |
| Pillow | `pillow` | Site-level OG image generation |

---

## Audio Capture (macOS)

macOS screen recording does not capture system audio by default. Install BlackHole to route audio.

### Setup

```bash
brew install blackhole-2ch
```

Reboot after installing.

### Create Multi-Output Device

So you can hear audio while recording:

1. Open **Audio MIDI Setup** (Cmd+Space, search for it)
2. Click **+** → **Create Multi-Output Device**
3. Check both **BlackHole 2ch** and your speakers
4. Right-click → "Use This Device For Sound Output"

### Recording with Audio

1. Cmd+Shift+5 → Options
2. Under Microphone, select **BlackHole 2ch**
3. Record

### Verify Audio Was Captured

```bash
ffprobe -v error -show_entries stream=codec_type -of default=noprint_wrappers=1 your-video.mov
```

Should show both `codec_type=video` and `codec_type=audio`.

---

## How Media Works

Media files are matched to incidents **by filename**. No field in the incident file needs updating — the system finds media automatically.

| Incident File | Raw Media | Processed Output |
|--------------|-----------|-----------------|
| `2026-01-15-aurora-arrest.md` | `2026-01-15-aurora-arrest.raw.mov` | `2026-01-15-aurora-arrest.mp4` |
| `2026-01-15-aurora-arrest.md` | `2026-01-15-aurora-arrest.raw.png` | `2026-01-15-aurora-arrest.jpg` |

---

## Adding Media: Two Methods

### Method 1: Create the Folder Yourself

Use this when you know the incident ID and want to place the file directly.

1. **Get the incident ID** (the filename without `.md`): `2026-01-15-aurora-arrest`
2. **Create the date folder:**
   ```bash
   mkdir -p raw_media/2026-01/15
   ```
3. **Move and rename the file** (must include `.raw` before the extension):
   ```bash
   mv ~/Downloads/my-clip.mov raw_media/2026-01/15/2026-01-15-aurora-arrest.raw.mov
   ```
4. **Run the pipeline:**
   ```bash
   ./us-ice-witness-repo/bin/run run-media-pipeline.py
   ```

### Method 2: Drop in raw_media Root + Use Helper Script

Use this when you want to skip creating folders manually. The script figures out the folder from the filename.

1. **Rename and drop the file in `raw_media/`** (the root, not a subfolder):
   ```bash
   mv ~/Downloads/my-clip.mov raw_media/2026-01-15-aurora-arrest.raw.mov
   ```
2. **Run the folderize script** to move it to the right folder:
   ```bash
   # Preview first (moves nothing):
   ./us-ice-witness-repo/bin/run folderize_media.py

   # Actually move:
   ./us-ice-witness-repo/bin/run folderize_media.py --execute
   ```
3. **Run the pipeline:**
   ```bash
   ./us-ice-witness-repo/bin/run run-media-pipeline.py
   ```

---

## File Naming

Raw files must match the incident slug and include `.raw` before the extension:

| Raw File | Output |
|----------|--------|
| `2026-01-15-aurora-arrest.raw.mov` | `2026-01-15-aurora-arrest.mp4` |
| `2026-01-15-aurora-arrest.raw.png` | `2026-01-15-aurora-arrest.jpg` |

### Multi-Part Videos

```
raw_media/2026-01/15/
├── 2026-01-15-aurora-arrest:01.raw.mov
├── 2026-01-15-aurora-arrest:02.raw.mov
└── 2026-01-15-aurora-arrest:03.raw.mov
```

Parts concatenate in order into single video. Start at `:01`, no gaps.

---

## Folder Structure

```
raw_media/                    # NOT in git (local backups)
└── 2026-01/
    └── 15/
        └── 2026-01-15-aurora-arrest.raw.mov

docs/media/                   # In git (deployed to site)
└── 2026-01/
    └── 15/
        ├── 2026-01-15-aurora-arrest.mp4
        └── 2026-01-15-aurora-arrest-og-2s-1234567890.jpg
```

---

## Processing Details

### What It Does

**Videos:**
- H.264, 720p max
- Audio normalization (EBU R128)
- Crops 8px edges
- 30fps max
- Web-optimized (faststart)

**Images:**
- JPEG, 1200px max width

**OG Images (videos only):**
- Frame at 2 seconds (customizable)
- 1200x630 for social sharing

### Commands

| Task | Command |
|------|---------|
| Process media | `./us-ice-witness-repo/bin/run process_media.py` |
| Force reprocess | `./us-ice-witness-repo/bin/run process_media.py --force` |
| Full pipeline (process + summary) | `./us-ice-witness-repo/bin/run run-media-pipeline.py` |
| Organize flat files into folders | `./us-ice-witness-repo/bin/run folderize_media.py --execute` |

---

## Media Order

`docs/data/media-order.md` controls gallery display order:

```markdown
# Media Order

2026-01-20-denver-courthouse
2026-01-15-aurora-arrest
2026-01-10-springs-workplace
```

New items auto-append. Edit to reorder.

---

## Custom OG Timestamps

Create `docs/data/og-tweaks.md`:

```markdown
# OG Image Timestamps

```
2026-01-15-aurora-arrest: 5.5
```
```

---

## High Quality Videos

Create `docs/data/high-quality-videos.md` for videos needing less compression:

```markdown
# High Quality Videos

```
2026-01-15-document-closeup
```
```

---

## Custom OG Source Images

Provide a custom image instead of extracting a video frame:

```
raw_media/2026-01/15/2026-01-15-aurora-arrest.raw_og.png
```

Scaled to 1200x630 with letterboxing.

---

## Troubleshooting

**"ffmpeg not found"** — Install ffmpeg (see Requirements above)

**Video not appearing on site** — Check filename matches incident slug, then:
```bash
./us-ice-witness-repo/bin/run generate_summary.py
```

**Missing Python packages** — Install them:
```bash
<your-python> -m pip install pyyaml pillow
```
