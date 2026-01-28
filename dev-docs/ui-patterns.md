# UI Patterns

Reusable patterns and conventions for the site's user interface.

## SVG Icons — DRY Pattern (IMPORTANT)

**NEVER inline SVG paths directly.** Always use the symbol/use pattern for icons.

### Why

- **DRY (Don't Repeat Yourself)** — Define once, use everywhere
- **Maintainable** — Change an icon in one place, updates everywhere
- **Smaller HTML** — References are tiny vs. full path data
- **Consistent** — All icons come from the same source

### How It Works

1. **Define icons once** in `docs/index.html` inside the hidden `<svg>` block
2. **Reference them** anywhere with `<use href="#icon-name"/>`

### Adding a New Icon

1. Add a `<symbol>` to the icon block in `docs/index.html`:
```html
<svg style="display:none">
  <!-- existing icons... -->
  <symbol id="icon-yourname" viewBox="0 0 24 24">
    <path d="..."/>
  </symbol>
</svg>
```

2. Use it anywhere:
```html
<svg width="16" height="16"><use href="#icon-yourname"/></svg>
```

3. Document it in the table below

### DON'T Do This

```html
<!-- BAD: Inline SVG repeated everywhere -->
<svg viewBox="0 0 24 24" width="16" height="16">
  <path d="M8 5v14l11-7z" fill="currentColor"/>
</svg>
```

### DO This Instead

```html
<!-- GOOD: Reference the symbol -->
<svg width="16" height="16"><use href="#icon-play"/></svg>
```

### Copy-to-Clipboard with Feedback

Header anchor links are handled via event delegation in `lightbox.js` (not inline onclick).

**CSS** (in `docs/css/style.css`):
```css
.header-link { color: #ccc !important; text-decoration: none !important; ... }
.header-link:hover { color: #7ba3c9 !important; }
.header-link.copied { color: #1a7f37 !important; }
```

**Event delegation** (in `lightbox.js` renderAboutContent):
- Attaches click listeners to all `.header-link` elements
- Copies URL to clipboard
- Updates browser URL via `history.replaceState`
- Adds `.copied` class briefly for visual feedback

**Routing** (in `app.js`):
- About page section anchors are defined in `App.aboutHashes` array
- `handleInitialHash` and `openFromHash` route these to `Lightbox.openAbout(anchor)`
- Scroll listener updates URL as user scrolls between sections

**HTML usage** (in `about.md`):
```html
<h2 id="section-name">Section Title <a href="#section-name" class="header-link" title="Copy link"><svg width="16" height="16"><use href="#icon-link"/></svg></a></h2>
```

### Example Usage

See `docs/about.md` for a complete implementation with anchored section headers (h2 level only).

## Available Icons

All icons are defined in `docs/index.html`. Reference with `<use href="#icon-name"/>`.

| Symbol ID | Description | Used For |
|-----------|-------------|----------|
| `icon-camera` | Camera outline | Media indicator on list items |
| `icon-eye` | Eye | Viewed indicator |
| `icon-link` | Chain link | Copy link / share buttons |
| `icon-play` | Play triangle | Video play button |
| `icon-pause` | Pause bars | Video pause button |
| `icon-restart` | Circular arrow | Video restart button |
| `icon-speaker` | Speaker with waves | Volume on |
| `icon-mute-x` | Speaker with X | Volume muted |
| `icon-fullscreen-enter` | Expanding corners | Enter fullscreen |
| `icon-fullscreen-exit` | Contracting corners | Exit fullscreen |
| `icon-trust` | Shield with check | Trustworthiness indicator |
| `icon-search` | Magnifying glass | Search button |
| `icon-facebook` | Facebook logo | Social media links |
| `icon-x` | X (Twitter) logo | Social media links |
| `icon-instagram` | Instagram logo | Social media links |
| `icon-threads` | Threads logo | Social media links |
| `icon-bluesky` | Bluesky logo | Social media links |

When adding new icons, add them to `docs/index.html` and document here.

## Markdown File Strategy

**Principle:** Markdown files should contain primarily text/content. Move code (HTML, CSS, SVG) to their proper locations.

### What SHOULD be in markdown files

- Pure markdown syntax (headers, lists, links, bold, italic, blockquotes)
- YAML frontmatter (incident files)
- Minimal HTML for specific needs:
  - `<h2 id="...">` with anchor links (required for copy-link functionality)
  - `<p class="...">` or `<div class="...">` using CSS classes (no inline styles)
  - `<svg>` with `<use href="#icon-name"/>` references (not inline paths)
  - `<em class="incident-note">` for styled notes

### What should NOT be in markdown files

- Inline `style="..."` attributes — use CSS classes instead
- Inline SVG paths — add icons to `index.html` as symbols, use `<use href="#icon-name"/>`
- Repeated styling patterns — extract to CSS classes

### CSS Classes for Markdown Content

| Class | Used In | Purpose |
|-------|---------|---------|
| `.about-intro` | about.md | Intro paragraph styling |
| `.about-last-updated` | about.md | Bold timestamp |
| `.about-follow-label` | about.md | "Follow Us:" label |
| `.about-social` | about.md | Social media links container |
| `.about-callout-box` | about.md | Icon legend box |
| `.about-note` | about.md | Italic note paragraphs |
| `.about-external-callout` | about.md | External link callout |
| `.about-badge` | about.md | Trustworthiness badges base |
| `.about-badge-high/medium/low/unverified` | about.md | Badge colors |
| `.incident-note` | incident files | Styled inline notes |
| `.media-icon` | various | Camera icon color |
| `.viewed-icon` | various | Eye icon color |

## iOS CSS Gotchas

iOS Safari and Chrome (which uses WebKit) have quirks with `position: sticky` and `position: fixed`. Follow these rules to avoid issues.

### Sticky Positioning

**Always use both prefixed and unprefixed:**
```css
.sticky-element {
    position: -webkit-sticky;  /* Required for iOS */
    position: sticky;
    top: 0;
}
```

**Avoid these sticky-breaking patterns:**
- `overflow: hidden`, `overflow: auto`, or `overflow: scroll` on parent elements (use `overflow: visible`)
- If horizontal scroll is needed, explicitly set `overflow-y: visible`:
  ```css
  .scrollable-nav {
      overflow-x: auto;
      overflow-y: visible;  /* Prevents sticky from breaking */
      position: -webkit-sticky;
      position: sticky;
  }
  ```
- `transform` on any ancestor element
- Certain `contain` values on ancestors

### Fixed Positioning

**Use hardware acceleration for stable fixed elements on iOS:**
```css
.fixed-footer {
    position: fixed;
    bottom: 0;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
}
```

This forces GPU compositing which prevents the element from "jumping" during momentum scrolling on iOS.

### Testing

Always test on a real iOS device (or at minimum iOS Simulator). Chrome DevTools mobile emulation does NOT replicate iOS WebKit rendering quirks.
