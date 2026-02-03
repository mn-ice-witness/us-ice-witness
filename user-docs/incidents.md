# Incidents

## Adding an Incident

### 1. Create the File

```
docs/incidents/YYYY-MM/DD/YYYY-MM-DD-slug.md
```

Example: `docs/incidents/2026-01/15/2026-01-15-aurora-arrest.md`

### 2. Use This Template

```yaml
---
date: 2026-01-15
time: "14:30"
location: Downtown Aurora
city: Aurora
type: citizens
status: resolved
affected_individual_citizenship: us-citizen
injuries: none
trustworthiness: high
created: 2026-01-15T14:23:47
last_updated: 2026-01-15T14:23:47
---

# U.S. Citizen Detained at Traffic Stop

## Summary

Brief 2-3 sentences describing what happened.

## Sources

1. Denver Post (Jan 15, 2026): [Article headline](URL)
2. CBS Colorado (Jan 15, 2026): [Video report](URL)

## Affected Individual(s)

- **Name:** John Doe (or "unnamed")
- **Citizenship:** U.S. Citizen

## Editorial Assessment

**HIGH** - Multiple established news sources with video evidence.
```

### 3. Get Timestamp

```bash
date +"%Y-%m-%dT%H:%M:%S"
```

### 4. Commit

```bash
git add .
git commit -m "Add incident: Aurora arrest"
git push
```

The pre-commit hook validates and regenerates `incidents-summary.json`.

---

## Required Fields

| Field | Values |
|-------|--------|
| `date` | `YYYY-MM-DD` |
| `type` | `citizens`, `observers`, `immigrants`, `schools-hospitals`, `response` |
| `status` | `ongoing`, `resolved`, `under-investigation` |
| `trustworthiness` | `high`, `medium`, `low`, `no-news-media`, `removed` |
| `created` | ISO timestamp |
| `last_updated` | ISO timestamp |

## Optional Fields

| Field | Values |
|-------|--------|
| `time` | `"HH:MM"` or `"unknown"` |
| `location` | Specific location |
| `city` | City name |
| `injuries` | `none`, `minor`, `serious`, `fatal` |
| `affected_individual_citizenship` | `us-citizen`, `legal-resident`, `asylum-seeker`, `undocumented`, `unknown`, `n/a`, `various` |
| `notable` | `true` or `false` |

---

## Incident Types

| Type | Use For |
|------|---------|
| `citizens` | U.S. citizens or legal residents affected |
| `observers` | People targeted for filming/protesting ICE |
| `immigrants` | People without legal status |
| `schools-hospitals` | Actions at schools or hospitals |
| `response` | DHS/ICE official statements only |

---

## Editing

1. Edit the markdown file
2. Update `last_updated` timestamp
3. Add entry to `## Updates` section if significant
4. Commit

---

## Hiding (Underscore Method)

Prefix filename with underscore to temporarily hide:

```bash
mv docs/incidents/2026-01/15/2026-01-15-aurora-arrest.md \
   docs/incidents/2026-01/15/_2026-01-15-aurora-arrest.md
git add .
git commit -m "Hide aurora-arrest"
```

To unhide, remove the underscore.

The pre-commit hook detects renames and regenerates the summary.

---

## Deleting

```bash
rm docs/incidents/2026-01/15/2026-01-15-aurora-arrest.md
git add .
git commit -m "Remove aurora-arrest"
```

The pre-commit hook detects deletions and regenerates the summary.

---

## Unverified Incidents

For incidents lacking news coverage:

```yaml
trustworthiness: no-news-media
```

- Hidden from main page
- Visible at `/no-news-media`
- Add `(NO NEWS MEDIA)` to title
- Include plea for information

---

## Removed Incidents

When new information invalidates an incident:

```yaml
trustworthiness: removed
```

- Hidden from main page
- Visible at `/removed`
- Add `(REMOVED)` to title
- Add `## Correction Note` explaining why

Use **removed** (not delete) when incident was published but later found incorrect. Preserves transparency.

---

## Troubleshooting

**Validation errors** - Run manually to see details:
```bash
./us-ice-witness-repo/bin/run generate_summary.py
```

**Changes not appearing** - Regenerate and amend:
```bash
./us-ice-witness-repo/bin/run generate_summary.py
git add docs/data/incidents-summary.json
git commit --amend --no-edit
git push --force
```
