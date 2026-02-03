# Media

## Requirements

Install ffmpeg for media processing:

| Platform | Command |
|----------|---------|
| macOS | `brew install ffmpeg` |
| Ubuntu | `sudo apt install ffmpeg` |
| Windows | `choco install ffmpeg` |

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

## Workflow

1. **Capture** - Record video or screenshot
2. **Move** - Put file in `raw_media/` with correct name
3. **Process** - Run the pipeline
4. **Commit** - Push processed files

---

## Capturing

### macOS

- **Screen Record:** Cmd+Shift+5 → Record Selected Portion
- **Screenshot:** Cmd+Shift+4

### Windows

- **Screen Record:** Win+G (Xbox Game Bar)
- **Screenshot:** Win+Shift+S

**Tips:**
- Crop tight to the video area
- Keep clips under 30 seconds
- Include captions if visible

---

## File Naming

Raw files must match the incident slug:

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

## raw_media Structure

```
raw_media/
└── 2026-01/
    └── 15/
        └── 2026-01-15-aurora-arrest.raw.mov
```

`raw_media/` is not tracked by git. Keep raw files locally as backups.

---

## Moving Files

```bash
mkdir -p raw_media/2026-01/15
mv "raw_media/Screen Recording.mov" raw_media/2026-01/15/2026-01-15-aurora-arrest.raw.mov
```

---

## Processing

```bash
./us-ice-witness-repo/bin/run process_media.py
```

Force reprocess all:
```bash
./us-ice-witness-repo/bin/run process_media.py --force
```

### What It Does

**Videos:**
- H.264, 720p max
- Audio normalization
- Crops 8px edges
- 30fps max

**Images:**
- JPEG, 1200px max width

**OG Images:**
- Frame at 2 seconds
- 1200x630 for social sharing

---

## Output

```
docs/media/
└── 2026-01/
    └── 15/
        ├── 2026-01-15-aurora-arrest.mp4
        └── 2026-01-15-aurora-arrest-og-2s-1234567890.jpg
```

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

## Troubleshooting

**"ffmpeg not found"** - Install ffmpeg

**Video not appearing** - Check filename matches slug, then:
```bash
./us-ice-witness-repo/bin/run generate_summary.py
```
