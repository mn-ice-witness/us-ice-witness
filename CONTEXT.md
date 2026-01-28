# US ICE Witness - Master Context for Claude Code

This is the **master repository** containing all shared code, schemas, and documentation for the US ICE Witness project.

## Architecture

**One codebase, multiple subdomains:**

- **This repo** (`us-ice-witness`): All site code (HTML/CSS/JS), scripts, schemas, dev-docs
- **State repos** (AL, CO, ME): Data only - incidents, media, state-specific news sources
- Each state repo has a symlink `us-ice-witness/` pointing here
- State detection is via hostname (subdomain), not URL path

## URL Structure

| Domain | Purpose |
|--------|---------|
| `mn-ice-witness.org` | Minnesota (original, independent site) |
| `co.ice-witness.org` | Colorado |
| `al.ice-witness.org` | Alabama |
| `me.ice-witness.org` | Maine |

See `dev-docs/cloudflare-configuration.md` for full domain/DNS setup.

## Repository Structure

```
docs/                        # Site code (HTML, CSS, JS)
├── index.html               # Main page
├── about.md                 # About page content
├── css/style.css            # Styles
├── js/                      # JavaScript modules
│   ├── state-config.js      # Detects state from subdomain
│   ├── router.js            # URL routing
│   ├── app.js               # Main app controller
│   └── ...
└── assets/                  # Favicons, OG images

dev-docs/                    # All documentation
├── cloudflare-configuration.md  # Domain/DNS setup
├── adding-incidents.md      # How to add incidents
├── incident-schema.md       # Required fields and format
├── source-tiers.md          # Source credibility guidelines
└── ...

scripts/
└── generate_summary.py      # Generates incidents-summary.json

hooks/
├── pre-commit               # Validates incidents, regenerates summary
└── install-hooks.sh         # Install hooks in a state repo
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

## Setting Up a State Repo

After cloning a state repo, you MUST:

1. **Create the symlink** to the master repo:
   ```bash
   ln -s ../GIT_US_ICE_WITNESS us-ice-witness
   ```

2. **Install git hooks** (REQUIRED for auto-generating incidents-summary.json):
   ```bash
   ./us-ice-witness/hooks/install-hooks.sh
   ```

The pre-commit hook will:
- Validate incident frontmatter against the schema
- Auto-regenerate `docs/data/incidents-summary.json`
- Stage the updated summary file

**Without the hook installed, incidents-summary.json won't update on commit.**

## Adding an Incident (in a state repo)

1. Read the schema: `us-ice-witness/dev-docs/incident-schema.md`
2. Create file: `docs/incidents/YYYY-MM/YYYY-MM-DD-slug/index.md`
3. Get timestamp: Run `date +"%Y-%m-%dT%H:%M:%S"` (NEVER make up timestamps)
4. Generate summary: `python3 us-ice-witness/scripts/generate_summary.py`
5. Commit and push (hooks auto-validate and regenerate summary)

## Deploying

**Deploy site code (this repo):**
```bash
npx wrangler pages deploy docs --project-name=us-ice-witness --branch=main
```

**Deploy state data (from state repo):**
```bash
npx wrangler pages deploy docs --project-name=co-ice-witness --branch=main
```

## Key Documentation

| File | Purpose |
|------|---------|
| `dev-docs/cloudflare-configuration.md` | Domain setup, DNS, redirects |
| `dev-docs/incident-schema.md` | Required fields for incidents |
| `dev-docs/adding-incidents.md` | Step-by-step incident workflow |
| `dev-docs/source-tiers.md` | Source credibility guidelines |
