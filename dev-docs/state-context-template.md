# State CONTEXT.md Template

Copy this to `CONTEXT.md` in a new state repo and fill in the state-specific values.

---

```markdown
# [STATE NAME] ICE Witness - Context for Claude Code

## CRITICAL: READ THE MASTER CONTEXT FIRST

**STOP. Before doing ANYTHING, you MUST read:**

```
us-ice-witness-repo/CONTEXT.md
```

**That file contains ALL the instructions for:**
- How to add incidents
- Incident schema and required fields
- How to process media
- The 5 incident categories
- Validation rules
- Deployment process

It also points to `us-ice-witness-repo/dev-docs/` which has detailed technical docs on every topic (incident schema, media processing, source tiers, etc.). **Read the relevant dev-doc for whatever task you're doing.**

**This file only contains [STATE NAME]-specific information. The master context has everything else.**

If `us-ice-witness-repo/` doesn't exist, create the symlink first:
```bash
ln -s ../GIT_US_ICE_WITNESS us-ice-witness-repo
```

---

## [STATE NAME] State Info

| Field | Value |
|-------|-------|
| State Code | **XX** |
| State Name | [State Name] |
| Site URL | xx.ice-witness.org |
| Data URL | xx-ice-witness.pages.dev |

## [STATE NAME]-Specific Context

**Key Communities:**
- [City 1] (notes)
- [City 2] (notes)

**Legal Context:** [Any relevant state laws, court rulings, or policies]

## [STATE NAME] News Sources

See `NEWS-SOURCES.md` for state-specific news sources to monitor.

## Quick Reference

**Add an incident:**
```
"Add this incident: [paste news URL]"
```

**Process media (read `us-ice-witness-repo/dev-docs/adding-video-audio.md` for full details):**

1. Put raw video/image in `raw_media/` with correct name (e.g., `YYYY-MM-DD-slug.raw.mov`)
2. Organize into date folders: `./us-ice-witness-repo/bin/run folderize_media.py --execute`
3. Process + generate summary: `./us-ice-witness-repo/bin/run run-media-pipeline.py`
4. Commit the compressed files that appear in `docs/media/`

NEVER commit raw/uncompressed video directly to `docs/media/`. The pipeline compresses videos to 1-6MB. Raw files stay in `raw_media/` which is gitignored.

**Generate summary:**
```bash
./us-ice-witness-repo/bin/run generate_summary.py
```

**Remember:**
- **All detailed instructions are in `us-ice-witness-repo/CONTEXT.md`**
- **Detailed task docs are in `us-ice-witness-repo/dev-docs/`** — read the relevant one for your task
```
