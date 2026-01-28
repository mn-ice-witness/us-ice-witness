# Cloudflare Configuration

This documents our Cloudflare setup for the ICE Witness network of sites.

## Architecture Overview

**One codebase, multiple subdomains:**

- The `us-ice-witness` Pages project contains all the HTML/CSS/JS code
- State repos (CO, AL, ME) only contain data (incidents, media)
- Subdomains determine which state's data to load
- State detection is via hostname (subdomain), not URL path

## Domain Structure

We own two domain names:
- **mn-ice-witness.org** - Original MN-specific site (independent, established)
- **ice-witness.org** - New domain for multi-state expansion

### URL Scheme

| Domain | Purpose | Data Source |
|--------|---------|-------------|
| `mn-ice-witness.org` | Minnesota (original site) | GIT_MN_ICE_FILES |
| `co.ice-witness.org` | Colorado | co-ice-witness.pages.dev |
| `al.ice-witness.org` | Alabama | al-ice-witness.pages.dev |
| `me.ice-witness.org` | Maine | me-ice-witness.pages.dev |

### Redirects (configured via Cloudflare Rules)

| Domain | Redirects To |
|--------|--------------|
| `ice-witness.org` | `mn-ice-witness.org` |
| `www.ice-witness.org` | `mn-ice-witness.org` |
| `us-ice-witness.org` | `mn-ice-witness.org` |
| `mn.ice-witness.org` | `mn-ice-witness.org` |

## How It Works

1. User visits `co.ice-witness.org/list`
2. Cloudflare serves files from `us-ice-witness` Pages project
3. JavaScript detects hostname → `co`
4. Data fetched from `co-ice-witness.pages.dev/data/incidents-summary.json`
5. Page renders Colorado incidents

## Cloudflare Pages Projects

| Project | Contains | Serves |
|---------|----------|--------|
| `us-ice-witness` | Site code (HTML/CSS/JS) | co.ice-witness.org, al.ice-witness.org, me.ice-witness.org |
| `co-ice-witness` | CO data only | co-ice-witness.pages.dev (data API) |
| `al-ice-witness` | AL data only | al-ice-witness.pages.dev (data API) |
| `me-ice-witness` | ME data only | me-ice-witness.pages.dev (data API) |
| `mn-ice-witness-github-io` | MN full site | mn-ice-witness.org |

## Setting Up Subdomains

### Step 1: Add ice-witness.org to Cloudflare

1. In Cloudflare Dashboard → Add a Site → `ice-witness.org`
2. Update nameservers at your registrar to Cloudflare's

### Step 2: Add Custom Domains to us-ice-witness Project

In Cloudflare Dashboard:
1. Go to Workers & Pages → `us-ice-witness`
2. Custom domains → Add custom domain
3. Add each: `co.ice-witness.org`, `al.ice-witness.org`, `me.ice-witness.org`
4. Cloudflare auto-creates CNAME records pointing to `us-ice-witness.pages.dev`

### Step 3: Set Up Apex/www Redirects

In Cloudflare Dashboard for `ice-witness.org`:
1. Go to Rules → Redirect Rules → Create Rule

**Rule: Apex and www to MN**
- Name: `Redirect to MN`
- When: `(http.host eq "ice-witness.org") or (http.host eq "www.ice-witness.org")`
- Then: Dynamic redirect
- Expression: `concat("https://mn-ice-witness.org", http.request.uri.path)`
- Status: 301

**Rule: mn subdomain to MN**
- Name: `mn subdomain to MN`
- When: `http.host eq "mn.ice-witness.org"`
- Then: Dynamic redirect
- Expression: `concat("https://mn-ice-witness.org", http.request.uri.path)`
- Status: 301

### Step 4: Set Up us-ice-witness.org Redirects

In Cloudflare Dashboard for `us-ice-witness.org`:
1. Go to Rules → Redirect Rules → Create Rule
2. When: `(http.host eq "us-ice-witness.org") or (http.host eq "www.us-ice-witness.org")`
3. Then: Dynamic redirect to `concat("https://mn-ice-witness.org", http.request.uri.path)`
4. Status: 301

## DNS Records

### ice-witness.org Zone

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | co | us-ice-witness.pages.dev | Proxied |
| CNAME | al | us-ice-witness.pages.dev | Proxied |
| CNAME | me | us-ice-witness.pages.dev | Proxied |
| A | @ | 192.0.2.1 | Proxied |
| CNAME | www | ice-witness.org | Proxied |

**Note:** The apex A record is a dummy IP. Redirect Rules handle the actual redirect before any server is reached.

## Speed Optimizations (Pro Plan)

Applied to primary domains:

| Feature | Status |
|---------|--------|
| Polish | Lossy |
| WebP | ON |
| Early Hints | ON |
| Speed Brain | ON |
| Cloudflare Fonts | ON |
| HTTP/2, HTTP/3 | ON |
| TLS 1.3 | ON |
| Always use HTTPS | ON |
| Smart Tiered Cache | ON |

### Disabled (Intentionally)

| Feature | Why |
|---------|-----|
| Super Bot Fight Mode | Causes challenge pages |
| Rocket Loader | Can break JavaScript |

## Security (WAF)

Enabled silently (no visitor friction):
- Cloudflare Managed Ruleset
- OWASP Core Ruleset

## Deploying Changes

### Deploy Code (us-ice-witness)

```bash
# From GIT_US_ICE_WITNESS directory
npx wrangler pages deploy docs --project-name=us-ice-witness --branch=main
```

### Deploy State Data

```bash
# From state repo directory (e.g., GIT_CO_ICE_WITNESS)
npx wrangler pages deploy docs --project-name=co-ice-witness --branch=main
```

## Testing

After deployment:
- `co.ice-witness.org/list` → Should show "CO ICE Witness" and Colorado incidents
- `al.ice-witness.org/list` → Should show "AL ICE Witness" and Alabama incidents
- `ice-witness.org` → Should redirect to mn-ice-witness.org

## Cost Summary

| Component | Cost |
|-----------|------|
| Cloudflare Pro (mn-ice-witness.org) | $25/month |
| Cloudflare Pro (ice-witness.org) | $25/month |
| Pages projects (all) | Free |
| **Total** | ~$50/month |
