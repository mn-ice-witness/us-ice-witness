# Capturing System Audio in Screen Recordings

*Created: 2026-01-16*

## The Problem

macOS screen recording (Cmd+Shift+5) does not capture system audio by default. Videos recorded from news sites, social media, etc. will have no sound unless you set up audio routing.

## Solution: BlackHole

BlackHole is a free, open-source virtual audio driver that routes system audio to screen recording.

### One-Time Setup

1. **Install BlackHole:**
   ```bash
   brew install blackhole-2ch
   ```
   Enter your admin password when prompted.

2. **Reboot your Mac** (required for the audio driver to load)

3. **Create Multi-Output Device** (so you can still hear audio while recording):
   - Open **Audio MIDI Setup** (Cmd+Space, search for it)
   - Click **+** at bottom left → **Create Multi-Output Device**
   - Check both:
     - **BlackHole 2ch**
     - **MacBook Pro Speakers** (or your output device)
   - Optional: Right-click the Multi-Output Device → "Use This Device For Sound Output"

### Recording Workflow

1. Press **Cmd+Shift+5** to open screen recording
2. Click **Options**
3. Under **Microphone**, select **BlackHole 2ch**
4. Select your recording area
5. Start the video you want to capture
6. Click **Record**
7. When done, click the stop button in the menu bar

### Verifying Audio Was Captured

```bash
ffprobe -v error -show_entries stream=codec_type -of default=noprint_wrappers=1 your-video.mov
```

Should show both:
```
codec_type=video
codec_type=audio
```

If only `video` appears, audio was not captured.

## Alternative Options

- **Browser tab recording**: Chrome/Firefox can capture tab audio directly when sharing a tab
- **OBS Studio**: Free, powerful, but still needs BlackHole on macOS
- **Kap**: Free, simple macOS app, still needs BlackHole
- **ScreenFlow** ($169): Captures system audio natively without BlackHole

## Troubleshooting

- **No audio after setup**: Make sure you rebooted after installing BlackHole
- **Can't hear audio while recording**: Use the Multi-Output Device as your system output
- **BlackHole not showing in Options**: Check Audio MIDI Setup to verify it's installed
