# Adding Media

## With Claude Code (Recommended)

1. Screen record a video clip (Cmd+Shift+5 on Mac)
2. Save to your `raw_media/` folder
3. Tell Claude:

> "Process the latest screen recording for 2026-01-15-incident-slug"

Claude handles the rest.

## Manual Method

### 1. Save Raw File

Put your raw video/image in `raw_media/`:

```
raw_media/2026-01-15-incident-slug.raw.mov
```

The filename must match your incident slug.

### 2. Process It

```bash
python3 us-ice-witness/scripts/process_media.py
```

Output goes to `docs/media/`.

### 3. Commit and Push

```bash
git add .
git commit -m "Add media for incident"
git push
```

## File Naming

- Videos: `YYYY-MM-DD-slug.raw.mov`
- Images: `YYYY-MM-DD-slug.raw.png`
- Multi-part: `YYYY-MM-DD-slug:01.raw.mov`, `:02.raw.mov`

The slug must match the incident folder name exactly.
