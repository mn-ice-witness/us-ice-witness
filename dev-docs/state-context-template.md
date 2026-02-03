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

**Process media:**
```
"I put a video in raw_media for the [incident-slug] incident. Process it."
```

**Generate summary:**
```bash
./us-ice-witness-repo/bin/run generate_summary.py
```

**Remember: All detailed instructions are in `us-ice-witness-repo/CONTEXT.md`**
```
