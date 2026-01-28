# Navigation & URL Routing

How URLs and navigation work in this single-page application.

## URL Systems

The site supports two URL systems:

| System | Example | Used For |
|--------|---------|----------|
| **Path-based** | `/entry/2026-01-20-incident` | Social sharing, SEO, bookmarks |
| **Hash-based** | `#2026-01-20-incident` | Legacy support, section scrolling |

Path-based URLs are preferred for sharing. Hash URLs still work for backwards compatibility.

---

## Path-Based URLs (Primary)

### URL Structure

| Content | URL Pattern | Example |
|---------|-------------|---------|
| Media gallery | `/media` | `mn-ice-witness.org/media` |
| List view | `/list` | `mn-ice-witness.org/list` |
| List category | `/list/<category>` | `mn-ice-witness.org/list/citizens` |
| Incident | `/entry/<slug>` | `mn-ice-witness.org/entry/2026-01-20-trump-mistakes-happen` |
| About page | `/about` | `mn-ice-witness.org/about` |
| About section | `/about/<section>` | `mn-ice-witness.org/about/sources-used` |
| New & Updated | `/new-updated/<date>` | `mn-ice-witness.org/new-updated/01-20-2026` |

The bare URL `/` redirects to user's preferred view (`/list` or `/media`) from localStorage.

### Filter Parameter

Add `?filter=new` to enable the NEW/UPDATED checkbox:
- `/?filter=new` - Media view with filter enabled
- `/list?filter=new` - List view with filter enabled

### Cloudflare Functions

Path URLs require server-side handling. Functions intercept requests to:
1. Inject Open Graph meta tags for social previews
2. Return index.html with customized meta tags
3. Let JavaScript display the appropriate content

```
functions/                      # At project root
├── entry/[slug].js            # /entry/<slug>
├── about/[[path]].js          # /about and /about/<section>
├── list/[[category]].js       # /list and /list/<category>
├── media/index.js             # /media
└── new-updated/[date].js      # /new-updated/<date>
```

### Social Media Sharing

When sharing `mn-ice-witness.org/entry/slug`:
1. Crawler requests the URL
2. Function injects incident-specific OG tags
3. Preview shows incident title, description, image

OG image priority: incident .jpg → video thumbnail → site default

### Inter-Incident Links

Markdown files can link to other incidents:
```markdown
See: [DHS Response](/entry/2026-01-18-dhs-response-juan-carlos)
```

These open in the same lightbox with scroll position preserved and back-button support.

---

## Hash-Based URLs (Legacy)

### Hash Types

| Hash | Behavior |
|------|----------|
| (empty) / `#media` | Media gallery view |
| `#list` | List view |
| `#citizens`, `#observers`, etc. | List view + scroll to section |
| `#slug` | Open incident in lightbox |
| `#about` | Open about page |
| `#new-updated-MM-DD-YYYY` | Open daily summary |

Section hashes are defined in `App.sectionHashes` array.

### Backwards Compatibility

Legacy hash URLs automatically redirect to path URLs:
1. `App.parseUrl()` checks for hash if no path match
2. `App.upgradeLegacyUrl()` redirects to clean path URL
3. Old bookmarks continue to work

---

## Local Development

Path URLs require Cloudflare Functions:

```bash
# Full functionality (recommended)
./bin/run-server.sh

# Simple server (path URLs won't work)
./bin/run-server.sh --simple
```

Requirements: Node.js (wrangler auto-installs via npx)

---

## Code Architecture

### Key JavaScript Functions

**Router (router.js)**
- `App.buildUrl(type, slug)` - Build path URLs
- `App.parseUrl()` - Parse current URL into route info

**App (app.js)**
- `handleInitialHash()` - Handle URL on page load
- `openFromHash()` - Handle hashchange events
- `scrollToSection(id)` - Scroll with sticky element offset

**Lightbox (lightbox.js)**
- `open()` vs `show()` pattern - `open*()` pushes history, `show*()` just renders
- Enables correct back-button behavior

### Sticky Element Offsets

Two sticky elements affect scroll calculations:
- `.section-nav` - sticky at `top: 0`
- `.view-toggle` - sticky at `top: 0` (media) or `top: 30px` (list)

`scrollToSection()` accounts for these when calculating scroll position.

---

## Testing

1. Start server: `./bin/run-server.sh`
2. Click incident - URL changes to `/entry/slug`
3. Copy link - copies `/entry/slug` URL
4. Paste URL directly - opens incident
5. Test `/#slug` - should redirect to `/entry/slug`
6. Test inter-incident links and back-button

## Troubleshooting

**Path URLs return 404 locally** - Use `./bin/run-server.sh` (not `--simple`)

**Functions not updating** - Restart dev server (Wrangler caches)

**Social previews not showing** - Use URL debuggers, check Function meta tags, wait for cache
