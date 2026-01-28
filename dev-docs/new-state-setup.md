# Setting Up a New State Repository

This guide covers all steps to create and deploy a new state ICE Witness site.

## Overview

Each state has:
- A GitHub repository (`mn-ice-witness/{state}-ice-witness`)
- A Cloudflare Pages project (`{state}-ice-witness`)
- A subdomain (`{state}.ice-witness.org`)

The state repos only contain **data** (incidents, media). The shared codebase is served from `us-ice-witness`.

## Prerequisites

- Access to `mn-ice-witness` GitHub organization
- Access to Cloudflare dashboard for `ice-witness.org`
- `CLOUDFLARE_API_TOKEN` with Pages permissions

## Step 1: Create GitHub Repository

```bash
# Create new repo from scratch or clone existing state as template
gh repo create mn-ice-witness/{state}-ice-witness --public

# Clone locally
cd ~/workspace/us-ice-witness
git clone https://github.com/mn-ice-witness/{state}-ice-witness.git GIT_{STATE}_ICE_WITNESS
cd GIT_{STATE}_ICE_WITNESS
```

## Step 2: Create Directory Structure

```bash
mkdir -p docs/data docs/incidents docs/media
```

### Required Files

**docs/_headers** (CRITICAL for CORS):
```
/data/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, OPTIONS
  Access-Control-Allow-Headers: Content-Type
```

**docs/data/incidents-summary.json** (start with empty):
```json
{
  "incidents": [],
  "generated_at": "2026-01-01T00:00:00Z",
  "stats": {
    "total": 0,
    "by_type": {},
    "by_trustworthiness": {}
  }
}
```

**.gitignore**:
```
.DS_Store
*.log
.wrangler/
node_modules/
```

## Step 3: Create GitHub Actions Workflow

**.github/workflows/deploy.yml**:
```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main
      - dev

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy docs --project-name={state}-ice-witness --branch=${{ github.ref_name }}
```

Replace `{state}` with the actual state abbreviation (lowercase).

## Step 4: Configure GitHub Secrets

**CRITICAL**: Both secrets must be set for automated deployments to work.

```bash
# Set the API token (get from Cloudflare dashboard or existing repo)
gh secret set CLOUDFLARE_API_TOKEN --repo mn-ice-witness/{state}-ice-witness

# Set the account ID
gh secret set CLOUDFLARE_ACCOUNT_ID --repo mn-ice-witness/{state}-ice-witness
```

To get existing values:
1. Go to another working state repo's Settings → Secrets → Actions
2. Or create new token at: https://dash.cloudflare.com/profile/api-tokens

### API Token Permissions Required

When creating a new Cloudflare API token:
- **Account** → Cloudflare Pages → Edit
- **Zone** → Zone → Read (optional, for DNS)

## Step 5: Create Cloudflare Pages Project

```bash
# From the state repo directory
npx wrangler pages project create {state}-ice-witness

# Or via dashboard:
# 1. Go to Workers & Pages → Create → Pages
# 2. Connect to GitHub
# 3. Select mn-ice-witness/{state}-ice-witness
# 4. Configure:
#    - Project name: {state}-ice-witness
#    - Production branch: main
#    - Build command: (leave empty)
#    - Build output directory: docs
```

## Step 6: Initial Deployment

```bash
# Deploy manually first to verify everything works
npx wrangler pages deploy docs --project-name={state}-ice-witness --branch=main
```

Verify deployment:
```bash
curl -s https://{state}-ice-witness.pages.dev/data/incidents-summary.json | head -5
```

## Step 7: Configure Subdomain

In Cloudflare Dashboard for `ice-witness.org`:

1. Go to **DNS** → Add record:
   - Type: CNAME
   - Name: `{state}`
   - Target: `us-ice-witness.pages.dev`
   - Proxy: Yes (orange cloud)

2. Go to **Workers & Pages** → `us-ice-witness` → Custom Domains:
   - Add `{state}.ice-witness.org`

## Step 8: Create Supporting Files

**CONTEXT.md** (for Claude Code):
```markdown
# {State} ICE Witness - Context for Claude Code

This is the {State} ICE Witness data repository. It contains only incident data and media files.

## Quick Reference
- State: {State} ({STATE})
- Data location: `docs/incidents/` and `docs/media/`
- Summary JSON: `docs/data/incidents-summary.json`

## For detailed instructions, see the master repository:
- Architecture: `../GIT_US_ICE_WITNESS/dev-docs/architecture.md`
- Adding incidents: `../GIT_US_ICE_WITNESS/dev-docs/adding-incidents.md`
- Incident schema: `../GIT_US_ICE_WITNESS/dev-docs/incident-schema.md`
```

**NEWS-SOURCES.md**:
Create a list of state-specific news sources. See existing state repos for format.

**README.md**:
```markdown
# {State} ICE Witness

Data repository for [{State} ICE Witness](https://{state}.ice-witness.org).

This repo contains incident documentation only. The website code is in [us-ice-witness](https://github.com/mn-ice-witness/us-ice-witness).

## Adding Incidents

See [adding-incidents.md](https://github.com/mn-ice-witness/us-ice-witness/blob/main/dev-docs/adding-incidents.md) in the main repository.
```

## Step 9: Create Symlink to Master Repo

```bash
ln -s ../GIT_US_ICE_WITNESS us-ice-witness
```

## Step 10: Commit and Push

```bash
git add .
git commit -m "Initial setup: {State} ICE Witness data repository"
git push origin main
```

## Verification Checklist

- [ ] GitHub repo created at `mn-ice-witness/{state}-ice-witness`
- [ ] `docs/_headers` file exists with CORS headers
- [ ] `docs/data/incidents-summary.json` exists
- [ ] `.github/workflows/deploy.yml` exists
- [ ] `CLOUDFLARE_API_TOKEN` secret set in GitHub
- [ ] `CLOUDFLARE_ACCOUNT_ID` secret set in GitHub
- [ ] Cloudflare Pages project `{state}-ice-witness` created
- [ ] Manual deployment works: `npx wrangler pages deploy docs --project-name={state}-ice-witness`
- [ ] Data accessible: `curl https://{state}-ice-witness.pages.dev/data/incidents-summary.json`
- [ ] CNAME record added for `{state}.ice-witness.org`
- [ ] Custom domain added to `us-ice-witness` project
- [ ] Site loads: `https://{state}.ice-witness.org`

## Troubleshooting

### CORS Errors
```
Access-Control-Allow-Origin header missing
```
**Fix**: Ensure `docs/_headers` exists with correct content. Redeploy.

### Duplicate CORS Headers
```
'Access-Control-Allow-Origin' header contains multiple values '*, *'
```
**Fix**: Only apply CORS to `/data/*` path, not `/*`:
```
/data/*
  Access-Control-Allow-Origin: *
```

### 404 on incidents-summary.json
**Fix**: Ensure file exists at `docs/data/incidents-summary.json` and is committed.

### GitHub Actions Deployment Failing
```
CLOUDFLARE_API_TOKEN environment variable not set
```
**Fix**: Add both secrets to the GitHub repo:
```bash
gh secret set CLOUDFLARE_API_TOKEN --repo mn-ice-witness/{state}-ice-witness
gh secret set CLOUDFLARE_ACCOUNT_ID --repo mn-ice-witness/{state}-ice-witness
```

### Manual Deployment
If GitHub Actions fails, deploy manually:
```bash
cd GIT_{STATE}_ICE_WITNESS
npx wrangler pages deploy docs --project-name={state}-ice-witness --branch=main
```

## File Structure Reference

```
GIT_{STATE}_ICE_WITNESS/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment
├── docs/
│   ├── _headers                # CORS headers (CRITICAL)
│   ├── data/
│   │   └── incidents-summary.json
│   ├── incidents/
│   │   └── YYYY-MM/
│   │       └── incident-files.md
│   └── media/
│       └── processed-media-files
├── .gitignore
├── CONTEXT.md
├── NEWS-SOURCES.md
├── README.md
└── us-ice-witness -> ../GIT_US_ICE_WITNESS
```
