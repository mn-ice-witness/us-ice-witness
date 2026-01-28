# Hiding Incidents (Draft/Unpublished)

How to temporarily hide incidents from the live site without deleting them.

## Quick Method: Underscore Prefix

To hide an incident, prefix its filename with an underscore (`_`):

```bash
# Hide an incident
mv docs/incidents/2026-01/2026-01-24-my-incident.md docs/incidents/2026-01/_2026-01-24-my-incident.md

# Unhide it later
mv docs/incidents/2026-01/_2026-01-24-my-incident.md docs/incidents/2026-01/2026-01-24-my-incident.md
```

Then regenerate the summary:

```bash
python-main scripts/generate_summary.py
```

## How It Works

The `generate_summary.py` script skips any `.md` files whose filename starts with `_`. These files:

- Won't appear in the incidents list
- Won't show in the media gallery
- Won't be included in the JSON summary
- Stay in git history and can be restored anytime

## Use Cases

- **Fixing media**: Need to re-encode video audio before publishing
- **Waiting for verification**: Story needs more sources before going live
- **Timing**: Want to publish multiple related incidents together
- **Errors**: Found an issue that needs fixing before it's seen

## Important Notes

1. **Commit the rename** - The underscore file should be committed so it's hidden on the live site
2. **Media files** - Associated media in `docs/media/` can stay as-is; they just won't be linked
3. **Media order** - The incident may still be listed in `docs/data/media-order.md`; that's fine, it will be ignored if the incident doesn't exist
