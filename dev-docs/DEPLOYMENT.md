# Deployment Architecture

This document explains how the MN ICE Witness site is deployed and served.

## Overview

The site uses a modern JAMstack architecture:

```
Git Push → GitHub (repo) → Cloudflare Pages (build & CDN) → Users
```

- **Source Code**: GitHub repository
- **Hosting**: Cloudflare Pages
- **DNS**: Cloudflare (nameservers pointed from Porkbun)
- **Domain Registrar**: Porkbun (owns mn-ice-witness.org)
- **SSL**: Automatic via Cloudflare

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Developer     │────▶│     GitHub      │────▶│ Cloudflare Pages│
│   git push      │     │   Repository    │     │   (Auto-deploy) │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Users       │◀────│  Cloudflare CDN │◀────│  Edge Caching   │
│                 │     │  (250+ PoPs)    │     │  (Global)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Deployment Flow

### Automatic Deployment

1. Developer pushes to `main` branch on GitHub
2. Cloudflare Pages detects the push via GitHub integration
3. Cloudflare pulls the code and deploys from `docs/` directory
4. Site is live globally within seconds

### No Build Step Required

This is a static HTML/JS/CSS site with no build process:
- **Framework preset**: None
- **Build command**: (empty)
- **Build output directory**: `docs`

## Domain Configuration

### DNS Setup

The domain `mn-ice-witness.org` is configured as follows:

| Component | Provider | Notes |
|-----------|----------|-------|
| Domain Registration | Porkbun | Owns the domain, renews yearly |
| Nameservers | Cloudflare | DNS management delegated to Cloudflare |
| DNS Records | Cloudflare | CNAME records point to Pages |
| SSL Certificate | Cloudflare | Automatic, free Universal SSL |

### DNS Records

```
Type    Name    Target
CNAME   @       mn-ice-witness-github-io.pages.dev
CNAME   www     mn-ice-witness-github-io.pages.dev
```

Note: Cloudflare uses "CNAME flattening" to allow CNAME at the root domain.

### Nameservers at Porkbun

The domain's nameservers at Porkbun point to Cloudflare:
- `nikon.ns.cloudflare.com`
- `stevie.ns.cloudflare.com`

(Your assigned nameservers may differ)

## Cloudflare Pages Project

- **Project name**: `mn-ice-witness-github-io`
- **Production branch**: `main`
- **Preview URL**: `mn-ice-witness-github-io.pages.dev`
- **Custom domain**: `mn-ice-witness.org`

## Verifying Deployment Source

To verify the site is served from Cloudflare (not GitHub Pages):

```bash
# Check HTTP headers for Cloudflare markers
curl -sI https://mn-ice-witness.org | grep -E "(server|cf-)"

# Expected output includes:
# server: cloudflare
# cf-cache-status: DYNAMIC
# cf-ray: <ray-id>

# Check DNS resolution
dig mn-ice-witness.org +short

# Should return Cloudflare IPs (104.x.x.x or 172.67.x.x)
# NOT GitHub Pages IPs (185.199.x.x)
```

## Why Cloudflare Pages?

### Cost Benefits

| Provider | Bandwidth Cost | Notes |
|----------|----------------|-------|
| Cloudflare Pages + R2 | **FREE** | Zero egress fees |
| AWS CloudFront | ~$0.085/GB | Pay per GB |
| Vercel | $0.15/GB | Expensive for video |
| GitHub Pages | Free but limited | 100GB/month soft limit |

### Features

- **Zero egress fees**: Critical for video-heavy site
- **Global CDN**: 250+ edge locations
- **Automatic SSL**: Free Universal SSL certificate
- **Git integration**: Auto-deploy on push
- **Preview deployments**: Each branch gets a preview URL
- **DDoS protection**: Built-in, unmetered

## Pre-commit Hooks

The repository has pre-commit hooks that run before each commit:

1. Regenerates `docs/data/incidents-summary.json` from markdown files
2. Cache-busts `index.html` with timestamp

These run locally before push, not on Cloudflare's build.

## Troubleshooting

### Site not updating after push

1. Check Cloudflare Pages deployments tab for build status
2. Verify the push went to `main` branch
3. Check for build errors in deployment logs

### SSL Certificate Issues

Cloudflare handles SSL automatically. If issues occur:
1. Go to SSL/TLS → Edge Certificates in Cloudflare dashboard
2. Verify certificate status is "Active"
3. SSL provisioning can take up to 15 minutes for new domains

### DNS Propagation

After DNS changes, propagation can take:
- Usually: 5-30 minutes
- Maximum: Up to 24-48 hours (rare)

Check propagation status:
```bash
dig mn-ice-witness.org +short
```

### Checking Deployment Status

```bash
# Verify site is accessible
curl -sI https://mn-ice-witness.org | head -5

# Check which server is responding
curl -sI https://mn-ice-witness.org | grep server
```

## Migration History

The site was migrated from GitHub Pages to Cloudflare Pages for:
1. **Scalability**: Handle traffic spikes without limits
2. **Cost**: Zero bandwidth fees (critical for video content)
3. **Performance**: Global CDN with edge caching
4. **Reliability**: Enterprise-grade infrastructure

Previous setup (deprecated):
- Hosting: GitHub Pages
- DNS: Porkbun nameservers
- A records: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153

## Related Files

- `docs/` - Static site files served by Cloudflare Pages
- `docs/CNAME` - May still exist but is ignored (Cloudflare manages domain)
- `scripts/pre-commit` - Pre-commit hook for JSON generation
- `scripts/generate_summary.py` - Generates incidents-summary.json

## Access & Management

### Cloudflare Dashboard

- Domain zone: `mn-ice-witness.org`
- Pages project: `mn-ice-witness-github-io`
- DNS, SSL, caching settings managed here

### Porkbun

- Domain registration and renewal
- Nameserver configuration (points to Cloudflare)
- DNSSEC must remain OFF (Cloudflare manages DNS)

### GitHub

- Source code repository
- Connected to Cloudflare Pages for auto-deploy
- GitHub Pages can be disabled (no longer used)
