# US ICE Witness - Master Context for Claude Code

This is the **master repository** containing all shared code, schemas, and documentation for the US ICE Witness project.

## Architecture

- **This repo** (`us-ice-witness`): All common code, hooks, scripts, schemas, dev-docs
- **State repos** (AL, CO, ME, WA, etc.): Data only - incidents, media, state-specific news sources
- Each state repo has a symlink `us-ice-witness/` pointing here

## Repository Structure

```
dev-docs/                    # All documentation
├── adding-incidents.md      # How to add incidents
├── incident-schema.md       # Required fields and format
├── source-tiers.md          # Source credibility guidelines
└── state-news-sources-template.md

hooks/                       # Git hooks for state repos
├── pre-commit               # Validates + auto-generates summary
└── install-hooks.sh         # Installs hooks in state repos

scripts/
└── generate_summary.py      # Generates incidents-summary.json
```

## The 5 Incident Categories

There are exactly 5 incident types. Use ONLY these:

| Type | Description |
|------|-------------|
| `citizens` | U.S. citizens OR anyone with valid legal status detained/affected |
| `observers` | People detained/attacked for filming, observing, or protesting ICE |
| `immigrants` | People without legal status: undocumented, asylum-seekers, etc. |
| `schools-hospitals` | Actions at/near schools or hospitals |
| `response` | Federal government (DHS/ICE/CBP) official statements ONLY |

## Adding an Incident (in a state repo)

1. Read the schema: `us-ice-witness/dev-docs/incident-schema.md`
2. Create file: `docs/incidents/YYYY-MM/YYYY-MM-DD-slug/index.md`
3. Get timestamp: Run `date +"%Y-%m-%dT%H:%M:%S"` (NEVER make up timestamps)
4. Generate summary: `python3 us-ice-witness/scripts/generate_summary.py`
5. Commit and push (hooks auto-validate and regenerate summary)

## Scripts and Hooks

**Generate summary (from state repo):**
```bash
python3 us-ice-witness/scripts/generate_summary.py
```

**Install git hooks (from state repo):**
```bash
bash us-ice-witness/hooks/install-hooks.sh
```

## State Data URL Pattern

Each state deploys to: `https://{state-code}-ice-witness.pages.dev`
