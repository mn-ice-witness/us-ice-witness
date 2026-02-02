# Preview Deployments

This document explains how to test changes on feature branches without affecting the production site.

## Quick Reference: Preview URL Format

**Pattern:** `<branch-name>.mn-ice-witness-github-io.pages.dev`

Example: `feature/path-based-urls` → **https://feature-path-based-urls.mn-ice-witness-github-io.pages.dev**

Note: The domain includes `-github-io` (not just `mn-ice-files`).

## Cloudflare Pages Configuration

| Setting | Value |
|---------|-------|
| **Project name** | `mn-ice-witness-github-io` |
| **Pages.dev domain** | `mn-ice-witness-github-io.pages.dev` |
| **Custom domain** | `mn-ice-witness.org` |
| **GitHub repo** | `mn-ice-witness/mn-ice-witness.github.io` |
| **Production branch** | `main` |
| **Build output directory** | `docs` |
| **Build command** | (none - static site) |

Access the project at: [Cloudflare Dashboard → Workers & Pages → mn-ice-witness-github-io](https://dash.cloudflare.com)

## How It Works

Cloudflare Pages automatically creates **preview deployments** for every non-main branch. When you push to a feature branch, Cloudflare builds and deploys that branch to a unique URL.

| Branch | URL |
|--------|-----|
| `main` | `mn-ice-witness.org` (production) |
| `feature/path-based-urls` | `feature-path-based-urls.mn-ice-witness-github-io.pages.dev` |
| `fix/video-player` | `fix-video-player.mn-ice-witness-github-io.pages.dev` |

**Key points:**
- Only `main` updates the production site
- Feature branches get their own preview URLs automatically
- Preview URLs have `X-Robots-Tag: noindex` (won't appear in search results)
- Previews work exactly like production (including Cloudflare Functions)

## Finding Your Preview URL

### Option 1: Check Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **mn-ice-witness-github-io**
3. Click **Deployments** tab
4. Find your branch - the preview URL is shown

### Option 2: GitHub Deployment Status

If GitHub integration is set up, Cloudflare posts the preview URL as a deployment status on your commits/PRs.

### Option 3: Predictable URL Pattern

Branch names become subdomains with:
- Lowercase letters
- Non-alphanumeric characters replaced with hyphens

| Branch | Preview Subdomain |
|--------|-------------------|
| `feature/path-based-urls` | `feature-path-based-urls` |
| `fix/video-player` | `fix-video-player` |
| `my_feature` | `my-feature` |

Full URL: `<subdomain>.mn-ice-witness-github-io.pages.dev`

## Workflow

### Testing a Feature Branch

```bash
# Create and switch to feature branch
git checkout -b feature/my-feature

# Make changes...

# Commit and push
git add .
git commit -m "Add feature"
git push -u origin feature/my-feature

# Wait ~1-2 minutes for Cloudflare to build
# Then visit: feature-my-feature.mn-ice-witness-github-io.pages.dev
```

### Sharing Preview Links

Preview URLs are shareable. Send them to others to test:
- All content is available
- Cloudflare Functions work (path-based URLs, OG tags)
- Media files load normally

### Merging to Production

When ready to deploy to production:

```bash
git checkout main
git merge feature/my-feature
git push origin main
```

Only this push to `main` updates `mn-ice-witness.org`.

## Branch Configuration

By default, Cloudflare deploys all branches. To limit which branches get previews:

1. Go to Cloudflare Dashboard → Workers & Pages → Your Project
2. Click **Settings** → **Builds & deployments**
3. Under **Branch deployment controls**, configure:
   - **Production branch:** `main`
   - **Preview branches:** Choose "All non-production branches" or "Custom branches"

### Recommended: Include All Branches

For this project, keeping "All non-Production branches" makes sense since:
- We test media changes frequently
- URL/routing changes need real preview testing
- No sensitive data in previews

## Local Development vs Preview Deployments

| Use Case | Method |
|----------|--------|
| Rapid iteration, debugging | Local: `./bin/run-server.sh` |
| Testing with others, verifying Functions | Preview deployment |
| Final verification before merge | Preview deployment |
| Production | Merge to `main` |

## Troubleshooting

### Preview not building

1. Check Cloudflare Dashboard for build errors
2. Ensure the branch was pushed to the remote
3. Check if branch controls exclude your branch pattern

### Preview URL returns 404

- Build may still be in progress (check dashboard)
- Branch name may have been transformed - check the actual URL in dashboard

### Functions not working in preview

Functions should work identically in previews. If they don't:
1. Check the build logs for errors
2. Ensure `functions/` directory was included in the build

### Preview shows old content

Cloudflare caches aggressively. Try:
1. Hard refresh (Cmd+Shift+R)
2. Open in incognito window
3. Wait a few minutes for cache to clear

## Initial Setup (If Not Already Configured)

If pushes don't trigger automatic deployments, GitHub integration may not be set up:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. Select your project (or create one)
3. Go to **Settings** → **Builds & deployments**
4. Under **Source**, click **Connect to Git**
5. Select **GitHub** and authorize Cloudflare
6. Choose the `mn-ice-witness/mn-ice-witness.github.io` repository
7. Set:
   - **Production branch:** `main`
   - **Build command:** (leave empty - static site)
   - **Build output directory:** `docs`
8. Click **Save and Deploy**

After setup, every push to any branch triggers a deployment automatically.

## Reference

- [Cloudflare Preview Deployments Docs](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Branch Deployment Controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)
- [GitHub Integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
