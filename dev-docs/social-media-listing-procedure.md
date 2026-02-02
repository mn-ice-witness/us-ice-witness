# Social Media Listing Procedure

Generate daily listings of new/updated incidents for social media posts.

## How to Request

Ask Claude: "Give me a social media update for [date]"

## Bluesky Format (300 character limit)

Posts MUST fit within 300 characters total. Use this format with separate NEW and UPDATED sections:

```
NEW:
  - [Most compelling new incident]
  - [Second]

UPDATED:
  - [Most compelling update]
  - [Second]

https://mn-ice-witness.org/new-updated/MM-DD-YYYY
```

**Note:** Do not include the date in the header. The user will specify the date when asking.

## Writing Guidelines

1. **Lead with the most striking detail** - the thing that makes people stop scrolling
2. **Use visceral, specific details** - "chained like Hannibal Lecter" not "mistreated"
3. **Keep bullets SHORT** - 5-8 words max per bullet
4. **Include numbers when striking** - "400K views", "5 days after approval"

## What Gets Included (MUST Match URL Logic)

**CRITICAL:** The SM post must match what `/new-updated/MM-DD-YYYY` returns. The URL filtering logic is in `docs/js/lightbox.js` lines 182-186:

- **NEW**: Incidents where `created:` starts with `YYYY-MM-DD` (the requested date)
- **UPDATED**: Incidents where `last_updated:` starts with `YYYY-MM-DD` AND `created:` does NOT start with that date

**Important:** We filter by the `created` and `last_updated` timestamps in the frontmatter, NOT by the incident `date:` field. An incident from January 9 that was added to the site on January 21 shows up as NEW on January 21.

To find what the URL will return:
```bash
# Find NEW (created on date)
grep -l "created: 2026-01-21" docs/incidents/**/*.md

# Find UPDATED (last_updated on date, but created earlier)
# Check files where last_updated matches but created doesn't
grep -l "last_updated: 2026-01-21" docs/incidents/**/*.md
# Then verify created date is different
```

Only include updates that are substantive story developments (new affected individual accounts, status changes, major new sources). Don't include minor source additions.

## Example Posts

### Good Example
```
NEW:
  - Citizen detained for "accent"
  - Snowplow driver held in El Paso

UPDATED:
  - Viral doorbell video (400K)
  - Noem backtracks on pepper spray

https://mn-ice-witness.org/new-updated/01-18-2026
```

### Another Example
```
NEW:
  - Citizen: "chained like Hannibal Lecter"
  - Parents detained 5 days after I-130

UPDATED:
  - Hmong elder story goes national

https://mn-ice-witness.org/new-updated/01-19-2026
```

## Finding the Day's Updates

Run this to find incidents created or updated on a specific date:
```bash
grep -l "created: 2026-01-19\|last_updated: 2026-01-19" docs/incidents/**/*.md
```

## Individual Incident Posts

For posting about a single incident, ask Claude: "Give me a SM post with url for [incident-slug]"

### Copying Posts to Clipboard

Ask Claude to copy the post to clipboard. Claude will run:
```bash
pbcopy << 'EOF'
NEW:
  - Off-duty cop stopped at gunpoint for papers
  - Toy store audited after ABC interview

UPDATED:
  - Judge orders 12-year-old's return from TX

https://mn-ice-witness.org/new-updated/01-20-2026
EOF
```

The post is now in your clipboard, ready to paste.
