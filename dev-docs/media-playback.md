# Media Playback

Video and image controls across the site.

## Three Contexts

| Context | Location | Behavior |
|---------|----------|----------|
| **Media Gallery** | Main page grid | Autoplay on scroll, muted, looping, minimal controls |
| **Incident Page** | Lightbox | Auto-starts, muted, basic controls, ends with "scroll for sources" |
| **Fullscreen** | From either | Full controls including time slider |

## Feature Comparison

| Feature | Gallery | Incident | Fullscreen |
|---------|---------|----------|------------|
| Autoplay | On scroll (40% visible) | On open | Continues |
| Muted default | Yes | Yes | Preserves state |
| Loop | Yes | No | No |
| Play/Pause | No | Yes | Yes |
| Time slider | No | No | Yes |
| Restart | No | Yes | Yes |
| Volume toggle | Yes | Yes | Yes |
| Fullscreen | Yes | Yes | Exit button |
| End behavior | Loop | Grayscale + overlay | Grayscale + restart |

---

## Video Loading Strategy

We use native browser loading - the simplest approach that works best.

### How It Works

```html
<video src="video.mp4#t=0.001" poster="og-image.jpg" muted loop playsinline preload="metadata">
```

| Attribute | Purpose |
|-----------|---------|
| `#t=0.001` | Shows first frame (fallback if no poster) |
| `poster` | OG image shown while loading |
| `preload="metadata"` | Loads only duration/dimensions initially |
| `muted` | Required for autoplay on mobile |
| `playsinline` | Prevents fullscreen takeover on iOS |

### Scroll-to-Play

`setupScrollToPlay()` uses IntersectionObserver:
- 40% visible → `video.play()`
- Less than 40% → `video.pause()`

Browser handles buffering and prioritization automatically.

---

## Fullscreen Implementation

### The Problem

Fullscreening a `<video>` directly causes mobile browsers to auto-rotate to landscape.

### The Solution

Fullscreen the container `<div>` instead:

```javascript
const container = video.closest('.local-media-container');
(container || video).requestFullscreen({ navigationUI: 'hide' });
```

### CSS for Container Fullscreen

```css
.local-media-container:fullscreen {
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.local-media-container:fullscreen .local-media-video {
    max-width: 100%;
    max-height: 100%;
}
```

### Browser Compatibility

- Standard: `requestFullscreen()`, `exitFullscreen()`
- WebKit: `webkitRequestFullscreen()`, `webkitExitFullscreen()`
- iOS Safari: `webkitEnterFullscreen()` (video element fallback)

---

## Video End Behavior

### Incident Page
- Grayscale filter applied
- "Scroll for sources below" overlay
- Prompts user to read context

### Fullscreen
- Grayscale filter applied
- Restart prompt (not "scroll for sources")
- Click to restart

---

## Files

| File | Contents |
|------|----------|
| `docs/js/media-gallery.js` | Gallery rendering, scroll-to-play |
| `docs/js/media-controls.js` | Video control UI |
| `docs/js/lightbox.js` | `setupMediaControls()`, `renderVideoElement()` |
| `docs/css/style.css` | `.media-controls`, fullscreen styles |
| `scripts/process_media.py` | Video compression |

## Configuration

| Setting | Location | Value |
|---------|----------|-------|
| Play threshold | `media-gallery.js` | 0.4 (40% visible) |
| Preload | `media-gallery.js` | `metadata` |
