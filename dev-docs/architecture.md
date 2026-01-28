# Architecture Overview

## Purpose

MN ICE Files is a static documentation website that tracks civil rights incidents involving ICE and CBP in Minnesota during Operation Metro Surge (December 2025 - present).

## Design Goals

1. **Factual & Credible** - Multiple sources, neutral language, include official responses
2. **Mobile-First** - Optimized for phones, works on desktop
3. **Fast Loading** - Static files, no backend, Cloudflare Pages hosting
4. **Easy to Update** - Add incidents via markdown files
5. **Immersive** - Videos, images, sources at fingertips

## Technology Stack

- **Hosting**: Cloudflare Pages (from `docs/` folder)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Content**: Markdown files parsed client-side
- **Markdown Parser**: marked.js (CDN)
- **No build step required**

## File Structure

```
GIT_MN_ICE_FILES/
├── CONTEXT.md              # AI assistant instructions
├── dev-docs/               # Developer documentation (this folder)
│   ├── architecture.md     # This file
│   ├── incident-schema.md  # Markdown frontmatter schema
│   ├── adding-incidents.md # How to add new incidents
│   └── research-sources.md # Where to find/verify incidents
├── bin/
│   └── run-server.sh       # Local dev server script
└── docs/                   # Website content (ALL content here)
    ├── index.html          # Main entry point
    ├── css/style.css       # Styles
    ├── js/
    │   ├── app.js          # Main app, loads incidents
    │   ├── parser.js       # Parses markdown frontmatter
    │   └── lightbox.js     # Detail popup
    └── incidents/          # ALL incident markdown files (ONLY location!)
        ├── 2025-12/        # December 2025
        └── 2026-01/        # January 2026
```

**IMPORTANT:** All incident files MUST be in `docs/incidents/`. The website serves directly from the `docs/` folder.

## Data Flow

1. `index.html` loads, includes marked.js from CDN
2. `app.js` initializes, reads `incidentFiles` array
3. For each file, fetches markdown from `docs/incidents/` folder
4. `parser.js` extracts frontmatter (YAML between `---`) and body
5. Incidents grouped by `type` and rendered into sections
6. Click on card → `lightbox.js` opens detail view with full markdown

## Incident Types

| Type | Section | Color |
|------|---------|-------|
| `citizens` | U.S. Citizens Detained | Purple |
| `observers` | Bystanders & Observers | Blue |
| `immigrants` | Community Members | Cyan |
| `schools-hospitals` | Schools/Hospitals | Orange |
| `response` | Official Responses | Gray |

## Trustworthiness Ratings

| Level | Criteria | Color |
|-------|----------|-------|
| `high` | 3+ sources, video/photo evidence | Green |
| `medium` | 2 sources or official statements | Yellow |
| `low` | Single source or social media only | Red |
| `unverified` | Reported but not confirmed | Gray |

## JavaScript Module Reference

This section describes what each JavaScript file does. For LLMs: read this before modifying any JS file.

### `docs/js/app.js` (Main Application - ~420 lines)

**Purpose:** Main application controller. Coordinates all other modules.

**Key Responsibilities:**
- **Initialization**: `init()` orchestrates module startup
- **Data Loading**: `loadIncidents()` fetches incidents-summary.json
- **Search/Filter**: `stem()`, `getFilteredIncidents()`
- **Route Handling**: Delegates to Router, opens appropriate views
- **List Rendering**: `render()`, `renderRow()`, `renderFlatList()`
- **Section Navigation**: `initSectionNav()`, `scrollToSection()`

**Global Object:** `App`

**Key Methods:**
| Method | Purpose |
|--------|---------|
| `init()` | Start the application |
| `loadIncidents()` | Fetch incidents-summary.json |
| `getFilteredIncidents()` | Apply search query to incidents |
| `switchView(view)` | Toggle media/list view |
| `renderMediaGallery()` | Render video card grid |
| `render()` | Render incident list by category |
| `buildUrl(type, slug)` | Build clean path URL |
| `parseUrl()` | Parse current URL into route object |

**Depends On:** `Router`, `ViewState`, `Splash`, `MediaGallery`, `Lightbox`, `Search`, `IncidentParser`

---

### `docs/js/router.js` (URL Routing - ~112 lines)

**Purpose:** Handle path-based URL routing with legacy hash URL support.

**Key Responsibilities:**
- Build clean URLs like `/entry/slug`, `/about/section`, `/list/category`
- Parse URLs into route objects
- Upgrade legacy hash URLs to path-based URLs

**Global Object:** `Router`

**Depends On:** Nothing (standalone)

---

### `docs/js/media-controls.js` (Media Controls - ~313 lines)

**Purpose:** Shared video and image control handlers.

**Key Responsibilities:**
- Video player controls (play/pause, time slider, restart, audio toggle)
- Fullscreen handling with scroll position restore
- Image fullscreen support

**Global Object:** `MediaControls`

**Depends On:** Nothing (standalone)

---

### `docs/js/view-state.js` (View State - ~255 lines)

**Purpose:** Manage view preferences and viewed incident tracking.

**Key Responsibilities:**
- Viewed incidents tracking (localStorage)
- Sort preference (by date vs by updated)
- View toggle (media vs list)
- Clear viewed functionality

**Global Object:** `ViewState`

**Depends On:** `App`, `Router`

---

### `docs/js/splash.js` (Splash Screen - ~112 lines)

**Purpose:** Animated intro screen with 24-hour cooldown.

**Global Object:** `Splash`

**Depends On:** Nothing (standalone)

---

### `docs/js/lightbox-content.js` (Lightbox Content - ~282 lines)

**Purpose:** Content rendering for lightbox.

**Key Responsibilities:**
- Incident content rendering with local media
- About page rendering
- New/updated listing rendering
- Video/image HTML generation
- YouTube embed transformation

**Global Object:** `LightboxContent`

**Depends On:** `App`, `ViewState`, `IncidentParser`, `marked`

---

### `docs/js/media-gallery.js` (Media Gallery - ~329 lines)

**Purpose:** Video/image card gallery rendering.

**Key Responsibilities:**
- Multi-column masonry layout
- Scroll-to-play video autoplay
- Card rendering with controls
- Custom media ordering

**Global Object:** `MediaGallery`

**Depends On:** `App`, `MediaControls`, `ViewState`, `Lightbox`

---

### `docs/js/lightbox.js` (Lightbox Controller - ~633 lines)

**Purpose:** Modal overlay controller for viewing content.

**Key Responsibilities:**
- Open/close with history management
- Incident, about, 404, new/updated views
- Popstate handling for browser back/forward
- Media controls setup
- Share link copying

**Global Object:** `Lightbox`

**Key Methods:**
| Method | Purpose |
|--------|---------|
| `init()` | Setup lightbox event listeners |
| `open(incident)` | Open incident detail view |
| `openAbout(anchor)` | Open about page, optionally scroll to anchor |
| `openNewUpdated(dateStr)` | Open new/updated listing for date |
| `close()` | Close lightbox, handle history |
| `copyShareLink()` | Copy current URL to clipboard |
| `setupVideoControls()` | Initialize video player controls |

**Depends On:** `App`, `IncidentParser`, `marked` (CDN)

---

### `docs/js/parser.js` (Markdown Parser - ~109 lines)

**Purpose:** Parse incident markdown files into structured data.

**Key Responsibilities:**
- Parse YAML frontmatter between `---` markers
- Extract title from first `# Heading`
- Extract summary from `## Summary` section
- Format type labels and citizenship labels

**Global Object:** `IncidentParser`

**Key Methods:**
| Method | Purpose |
|--------|---------|
| `parseIncident(content, filePath)` | Parse markdown into incident object |
| `formatTypeLabel(type)` | Convert type to display label |
| `formatCitizenshipLabel(citizenship)` | Convert citizenship to display |
| `formatDate(dateStr)` | Format YYYY-MM-DD to readable date |

**Depends On:** Nothing (standalone)

---

### `docs/js/search.js` (Search UI - ~85 lines)

**Purpose:** Search modal and query handling.

**Key Responsibilities:**
- Toggle search modal visibility
- Handle search input and clear
- Trigger re-render on query change
- Update result count display

**Global Object:** `Search`

**Key Properties:**
- `Search.query` - Current search query string

**Depends On:** `App` (for re-rendering)

---

### `docs/data/incidents-summary.json`

**Purpose:** Pre-computed incident metadata for fast page load.

**Auto-generated by:** `scripts/generate_summary.py`

**Contains:**
- All incident frontmatter fields
- Extracted title and summary
- Local media paths and aspect ratios
- Media version timestamps for cache busting

**See:** [scaling-strategy.md](scaling-strategy.md) for data architecture decisions

---

### `docs/data/og-tweaks.md`

**Purpose:** Custom timestamps for OG (social preview) image extraction from videos.

**Format:** Markdown with code block containing `slug: timestamp` pairs.

**Example:**
```
2026-01-13-aliya-rahman-car-window-hospitalized: 3.5
```

**Default:** 2.0 seconds if not specified.

**Used by:** `scripts/process_media.py`

**Note:** For complete control over OG images, use custom OG sources instead (see below).

---

### Custom OG Sources (`raw_media/*.raw_og.png`)

**Purpose:** Use a custom image as the OG/social preview instead of extracting a frame from video.

**How it works:**
1. Add a file named `{slug}.raw_og.png` (or `.jpg`) to `raw_media/`
2. Run `process_media.py`
3. The custom image is scaled to 1200x630 and used as the OG image

**Example:** `raw_media/2026-01-24-alex-pretti-shooting.raw_og.png`

**Output:** `docs/media/2026-01-24-alex-pretti-shooting-og-custom-{mtime}.jpg`

**When to use:** When the best frame for social sharing isn't in the video, or you want a specific cropped/edited image.

**Used by:** `scripts/process_media.py`

---

### `docs/data/high-quality-videos.md`

**Purpose:** List of videos that should use less compression for better visual quality.

**Format:** Markdown with code block containing one slug per line.

**Effect:** Videos listed here are encoded at CRF 23 instead of the default CRF 35.

**When to use:** For videos where visual clarity is important (e.g., videos showing key evidence, faces, or text).

**Used by:** `scripts/process_media.py`

---

## CSS Structure

`docs/css/style.css` (~1912 lines) is organized into clearly marked sections:

| Section | Lines | Purpose |
|---------|-------|---------|
| Variables & Reset | 1-48 | CSS custom properties, box-sizing |
| Splash Screen | 50-236 | Animated intro overlay |
| Header | 238-359 | Masthead, stats ribbon |
| Navigation | 361-403 | Section nav pills |
| View Toggle | 405-458 | Media/List toggle buttons |
| Search | 460-639 | Search modal, input |
| Media Gallery | 641-834 | Video card grid |
| Main Content | 836-912 | Content containers |
| Incident Table | 889-1058 | List view rows |
| Lightbox | 1060-1412 | Modal overlay, content |
| Local Media | 1414-1674 | Video player, controls |
| Footer | 1676-1717 | Fixed bottom bar |
| Responsive | 1719-1772 | Media queries |
| New & Updated | 1774-1850 | Date listing styles |
| Header Links | 1852-1912 | Anchor link icons |

Each section starts with a comment banner like:
```css
/* ==================== SECTION NAME ==================== */
```

---

## Python Scripts

### `scripts/generate_summary.py` (~250 lines)

**Purpose:** Generate incidents-summary.json from markdown files.

**When to Run:** Automatically via pre-commit hook, or manually after adding incidents.

**What It Does:**
1. Scans `docs/incidents/` for all `.md` files
2. Parses frontmatter and extracts key fields
3. Detects local media in `docs/media/`
4. Outputs JSON to `docs/data/incidents-summary.json`

---

### `scripts/process_media.py` (~427 lines)

**Purpose:** Compress raw media files for web delivery.

**When to Run:** After adding files to `raw_media/`

**What It Does:**
1. Reads from `raw_media/` (never modifies source)
2. Compresses videos with H.264, normalizes audio
3. Handles multi-part videos (`:01`, `:02` suffix)
4. Outputs to `docs/media/`

---

### `scripts/audit_last_updated.py` (~105 lines)

**Purpose:** Audit `last_updated` timestamps for consistency.

**When to Run:** Periodically to check data quality

## Media Pipeline

### Directory Structure
- `raw_media/` - **Original source files (NEVER modified)**
- `docs/media/` - Processed web-optimized files

### How It Works

1. **Source files are read-only**: The `raw_media/` folder contains original recordings. These files are NEVER touched or modified by the pipeline.

2. **Processing creates new files**: `scripts/process_media.py` reads from `raw_media/` and creates new compressed files in `docs/media/`.

3. **What the pipeline does**:
   - Crops 5px from all edges (removes screen recording artifacts)
   - Compresses video with H.264 (CRF 30)
   - Scales to max 720p height
   - Preserves audio if present in source
   - Optimizes for web streaming (faststart)

4. **Naming convention**:
   - Raw: `<incident-id>.raw.mov` (or .mp4, .png, etc.)
   - Output: `<incident-id>.mp4` (videos) or `<incident-id>.jpg` (images)

### Multi-Part Videos

For long videos split into multiple recordings, use the `:01`, `:02` suffix pattern:
- `2026-01-13-incident-name:01.raw.mov`
- `2026-01-13-incident-name:02.raw.mov`

The pipeline will:
1. Validate the sequence is complete (starts at :01, no gaps)
2. Concatenate the parts in order
3. Process the combined video
4. Output a single file: `2026-01-13-incident-name.mp4`

### Reprocessing Videos

**IMPORTANT: Never use `--force` unless explicitly asked.** The `--force` flag reprocesses ALL videos, which is slow and unnecessary.

To reprocess a single video:
1. Delete the output file in `docs/media/`
2. Run `python-main scripts/process_media.py` (without --force)

The pipeline only processes files where the output is missing or older than the source.

### Audio Note

If your source video has no audio, the processed video will have no audio. The pipeline preserves audio when present but cannot create it. When recording with macOS screen recording (Cmd+Shift+5), you must explicitly enable microphone/audio capture in the recording options.

### Local Media in Incidents

**Do NOT add "Local copy" links in incident markdown files.** The media displays automatically in the lightbox based on filename matching. Users can right-click the video to save it if needed. Example of what NOT to do:

```markdown
- **Video:** [Local copy](media/incident-id.mp4) - Description
```

## Related Documentation

**Code Quality:**
- [code-review-findings.md](code-review-findings.md) - File size analysis, dead code, duplication issues
- [refactoring-plan.md](refactoring-plan.md) - Modular split recommendations for LLM-friendliness

**Technical:**
- [scaling-strategy.md](scaling-strategy.md) - Data scaling decisions and future considerations
- [url-routing.md](url-routing.md) - Path-based URLs and Cloudflare Functions
- [media-controls.md](media-controls.md) - Video player implementation details
- [ui-patterns.md](ui-patterns.md) - Reusable UI patterns

**Content:**
- [incident-schema.md](incident-schema.md) - Markdown frontmatter schema
- [adding-incidents.md](adding-incidents.md) - How to add new incidents
