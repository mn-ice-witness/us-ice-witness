# Adding Incidents

## With Claude Code (Recommended)

Open Claude Code in your state repo folder and say:

> "Add this incident: [paste news URL]"

Claude will:
- Find additional sources
- Create the incident file
- Generate the summary JSON
- You just commit and push

## Manual Method

### 1. Create the File

```
docs/incidents/YYYY-MM/YYYY-MM-DD-slug/index.md
```

Example: `docs/incidents/2026-01/2026-01-15-denver-arrest/index.md`

### 2. Use This Template

```yaml
---
date: 2026-01-15
time: "14:30"
location: Downtown Denver
city: Denver
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
- **Name:** John Doe
- **Citizenship:** U.S. Citizen

## Editorial Assessment
**HIGH** - Multiple established news sources.
```

### 3. Generate Summary

```bash
python3 us-ice-witness/scripts/generate_summary.py
```

### 4. Commit and Push

```bash
git add .
git commit -m "Add incident: Denver arrest"
git push
```

## Incident Types

| Type | Use For |
|------|---------|
| `citizens` | U.S. citizens or legal residents affected |
| `observers` | People targeted for filming/protesting ICE |
| `immigrants` | People without legal status |
| `schools-hospitals` | Actions at schools or hospitals |
| `response` | DHS/ICE official statements only |
