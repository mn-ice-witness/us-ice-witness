# US ICE Witness - Master Context for AI Assistants

This is the **master repository** containing all shared code, schemas, and documentation for the US ICE Witness project.

**This project is designed to work with an AI coding assistant**, preferably Claude Code using Opus 4.5. The `dev-docs/` folder contains detailed technical documentation that helps AI assistants understand the project deeply.

---

## Architecture

**One codebase, multiple subdomains:**

- **This repo** (`us-ice-witness`): All site code (HTML/CSS/JS), scripts, schemas, docs
- **State repos** (AL, CO, ME, WA): Data only—incidents, media, state-specific config
- Each state repo links to this repo as `us-ice-witness-repo/`
- State detection is via hostname (subdomain), not URL path

## URL Structure

| Domain | Purpose |
|--------|---------|
| `co.ice-witness.org` | Colorado |
| `al.ice-witness.org` | Alabama |
| `me.ice-witness.org` | Maine |
| `wa.ice-witness.org` | Washington |

---

## Documentation Structure

### user-docs/ (For Humans)

Written for state maintainers—clear, task-focused:
- `setup.md` - Installation and configuration
- `incidents.md` - Managing incident files
- `media.md` - Processing videos and images
- `agent-setup.md` - Configuring AI assistants

### dev-docs/ (For AI Assistants)

Detailed technical reference—AI assistants should read these when helping users:
- `incident-schema.md` - Complete field definitions
- `adding-incidents.md` - Step-by-step workflow
- `adding-video-audio.md` - Media processing details
- `source-tiers.md` - News source credibility
- `hiding-incidents.md` - Underscore method
- `removed-incidents.md` - Removal process
- And many more...

**When helping a user, read the relevant dev-docs/ file for detailed instructions.**

---

## Repository Structure

```
docs/                        # Site code (HTML, CSS, JS)
├── index.html               # Main page
├── css/style.css            # Styles
├── js/                      # JavaScript modules
│   ├── state-config.js      # Detects state from subdomain
│   ├── router.js            # URL routing
│   ├── app.js               # Main app controller
│   └── ...
└── assets/                  # Favicons, OG images

user-docs/                   # Human-readable guides
dev-docs/                    # AI assistant reference

bin/                         # All scripts
├── run                      # Wrapper to use configured Python
├── config.py                # Config loader
├── generate_summary.py      # Generates incidents-summary.json
├── process_media.py         # Processes raw media
└── ...

hooks/
├── pre-commit               # Validates incidents, regenerates summary
└── install-hooks.sh         # Install hooks in a state repo
```

---

## The 5 Incident Categories

There are exactly 5 incident types. Use ONLY these:

| Type | Description |
|------|-------------|
| `citizens` | U.S. citizens OR anyone with valid legal status detained/affected |
| `observers` | People detained/attacked for filming, observing, or protesting ICE |
| `immigrants` | People without legal status: undocumented, asylum-seekers, etc. |
| `schools-hospitals` | Actions at/near schools or hospitals |
| `response` | Federal government (DHS/ICE/CBP) official statements ONLY |

---

## Python Setup

The scripts use Python from `~/.ice-witness.config`. Any Python 3.8+ works—system, Homebrew, or venv.

Config file example:
```yaml
python_exe: /opt/homebrew/bin/python3
```

The value can be a full path or command name (e.g., `python3`, `python-main`).

Required packages: `pip install pyyaml pillow`

---

## Setting Up a State Repo

### With AI Assistant (Recommended)

Tell the AI: "Help me setup this state repo"

### Manual Setup

1. Get the shared codebase (clone nearby + symlink, or clone directly):
   ```bash
   # Option A: Clone nearby + symlink
   git clone https://github.com/mn-ice-witness/us-ice-witness.git ../GIT_US_ICE_WITNESS
   ln -s ../GIT_US_ICE_WITNESS us-ice-witness-repo

   # Option B: Clone directly
   git clone https://github.com/mn-ice-witness/us-ice-witness.git us-ice-witness-repo
   ```

2. Create config files:
   ```bash
   # User config (Python path)
   echo "python_exe: $(which python3)" > ~/.ice-witness.config

   # Project config
   cat > ice-witness.config << EOF
   state_code: CO
   state_name: Colorado
   contact_email: tips@ice-witness.org
   EOF
   ```

3. Install git hooks:
   ```bash
   ./us-ice-witness-repo/hooks/install-hooks.sh
   ```

---

## Adding an Incident

### With AI Assistant (Recommended)

Tell the AI: "Add this incident: [paste news URL]"

### Manual Method

1. Read the schema: `dev-docs/incident-schema.md`
2. Create file: `docs/incidents/YYYY-MM/DD/YYYY-MM-DD-slug.md`
3. Get timestamp: `date +"%Y-%m-%dT%H:%M:%S"` (NEVER make up timestamps)
4. Generate summary: `./us-ice-witness-repo/bin/run generate_summary.py`
5. Commit and push

---

## Processing Media

### With AI Assistant (Recommended)

Tell the AI: "Process the media in raw_media"

### Manual Method

1. Put raw files in `raw_media/YYYY-MM/DD/slug.raw.mov`
2. Run: `./us-ice-witness-repo/bin/run process_media.py`
3. Commit processed files in `docs/media/`

---

## Key Commands

| Task | Command |
|------|---------|
| Generate summary | `./us-ice-witness-repo/bin/run generate_summary.py` |
| Process media | `./us-ice-witness-repo/bin/run process_media.py` |
| Force reprocess | `./us-ice-witness-repo/bin/run process_media.py --force` |
| Install hooks | `./us-ice-witness-repo/hooks/install-hooks.sh` |

---

## Deploying

**Normal workflow: Just push to `main` and the site updates automatically.**

Cloudflare Pages is connected to GitHub and auto-deploys on every push to `main`. No manual intervention is needed.

**IMPORTANT FOR AI ASSISTANTS: Always confirm with the user before:**
- Running any `wrangler` commands
- Pushing commits that trigger Cloudflare deployments
- Making any changes that affect the live site

**Manual deploy (rarely needed—only for initial setup or recovery):**
```bash
# This repo (shared code)
npx wrangler pages deploy docs --project-name=us-ice-witness --branch=main

# State repo (state-specific data)
npx wrangler pages deploy docs --project-name=co-ice-witness --branch=main
```

If the site seems stuck, push again or check Cloudflare Pages dashboard—don't jump to manual wrangler commands.

---

## For AI Assistants: Key Reference Files

When helping users, read these dev-docs as needed:

| Task | Reference File |
|------|----------------|
| Adding incidents | `dev-docs/adding-incidents.md`, `dev-docs/incident-schema.md` |
| Processing media | `dev-docs/adding-video-audio.md`, `dev-docs/screen-recording-workflow.md` |
| Source credibility | `dev-docs/source-tiers.md` |
| Hiding incidents | `dev-docs/hiding-incidents.md` |
| Removing incidents | `dev-docs/removed-incidents.md` |
| No-News-Media incidents | `dev-docs/no-news-media-incidents.md` |
| State setup | `dev-docs/new-state-setup.md` |
