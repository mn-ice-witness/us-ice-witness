# Incident ID Reassignment

This document explains how to rename an incident's ID (slug) while preserving URL compatibility for already-shared links.

## When to Reassign an ID

Reassign an incident ID when:
- The original ID contains inaccurate characterization (e.g., "deflection" when the person answered)
- The ID doesn't match the incident's focus after content updates
- Typos or formatting issues in the original ID

**Do not reassign** for minor preferences—only when the ID is materially inaccurate.

## The Redirect System

The site uses `docs/data/redirects.json` to map old IDs to new IDs. When someone visits `/entry/old-id`, the Cloudflare Function returns a 301 permanent redirect to `/entry/new-id`.

### redirects.json Format

```json
{
  "redirects": {
    "old-incident-id": "new-incident-id",
    "another-old-id": "another-new-id"
  }
}
```

## Reassignment Procedure

### 1. Add the Redirect

Edit `docs/data/redirects.json` and add the mapping:

```json
{
  "redirects": {
    "2026-01-25-old-name": "2026-01-25-new-name"
  }
}
```

### 2. Rename All Files

Four locations need renaming:

```bash
# Incident markdown
mv docs/incidents/YYYY-MM/OLD-ID.md docs/incidents/YYYY-MM/NEW-ID.md

# Processed video/image
mv docs/media/OLD-ID.mp4 docs/media/NEW-ID.mp4

# OG thumbnail (for videos)
mv docs/media/OLD-ID-og-*.jpg docs/media/NEW-ID-og-*.jpg

# Raw media source
mv raw_media/OLD-ID.raw.mov raw_media/NEW-ID.raw.mov
```

**Note:** The OG thumbnail filename includes a hash (e.g., `-og-2s-1769350319.jpg`). Keep the hash portion intact when renaming.

### 3. Update Incident Content

Edit the renamed markdown file to fix any language that prompted the rename.

### 4. Update Internal Links

Search for references to the old ID in other incident files:

```bash
grep -r "old-id" docs/incidents/
```

Update any `#old-id` links to `#new-id`.

### 5. Regenerate Summary

```bash
python-main scripts/generate_summary.py
```

### 6. Test Locally

```bash
./bin/run-server.sh
```

Test both URLs:
- `/entry/new-id` — Should display the incident
- `/entry/old-id` — Should redirect to the new URL

## Example

Renaming `2026-01-25-dhs-response-bovino-gun-deflection` to `2026-01-25-bovino-pretti-2a-concerns`:

1. Add to redirects.json:
   ```json
   "2026-01-25-dhs-response-bovino-gun-deflection": "2026-01-25-bovino-pretti-2a-concerns"
   ```

2. Rename files:
   ```bash
   mv docs/incidents/2026-01/2026-01-25-dhs-response-bovino-gun-deflection.md \
      docs/incidents/2026-01/2026-01-25-bovino-pretti-2a-concerns.md
   mv docs/media/2026-01-25-dhs-response-bovino-gun-deflection.mp4 \
      docs/media/2026-01-25-bovino-pretti-2a-concerns.mp4
   mv docs/media/2026-01-25-dhs-response-bovino-gun-deflection-og-2s-*.jpg \
      docs/media/2026-01-25-bovino-pretti-2a-concerns-og-2s-*.jpg
   mv raw_media/2026-01-25-dhs-response-bovino-gun-deflection.raw.mov \
      raw_media/2026-01-25-bovino-pretti-2a-concerns.raw.mov
   ```

3. Update internal links in other incidents (e.g., the main Pretti incident's Updates section)

4. Regenerate summary and test

## Technical Details

### How Redirects Work

The redirect logic is in `functions/entry/[slug].js`:

1. Function receives request for `/entry/slug`
2. Fetches `docs/data/redirects.json`
3. If slug exists in redirects, returns 301 redirect to new URL
4. Otherwise, proceeds with normal OG tag injection

### 301 vs 302

We use **301 (permanent)** redirects because:
- Search engines transfer link equity to the new URL
- Browsers cache the redirect, reducing server load
- Signals that the old URL should no longer be used

### Media Order

If the incident appears in `docs/data/media-order.md`, update the ID there too.
