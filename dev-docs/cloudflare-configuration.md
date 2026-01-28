# Cloudflare Configuration

This documents our Cloudflare Pro setup decisions, what we enabled, what we skipped, and cost considerations.

## Plan Details

- **Plan:** Cloudflare Pro ($25/month)
- **Domain:** mn-ice-witness.org
- **Key Benefit:** Unlimited CDN bandwidth included - no overage charges even at viral scale

## What's Enabled

### Speed Optimizations (Speed → Settings)

| Feature | Status | Notes |
|---------|--------|-------|
| Polish | Lossy | Compresses images aggressively |
| WebP | ON | Serves smaller WebP to supported browsers |
| Early Hints | ON | Preloads assets for faster page loads |
| Speed Brain | ON | Speculative prefetch (Beta) |
| Cloudflare Fonts | ON | Optimizes font loading |
| HTTP/2, HTTP/3 | ON | Modern protocols |
| TLS 1.3 | ON | Latest TLS |
| Always use HTTPS | ON | Forces HTTPS |

### Smart Shield (Speed → Smart Shield)

| Feature | Status | Notes |
|---------|--------|-------|
| Smart Tiered Cache | ON | Better cache hit rates |
| Connection Reuse | ON | Reduces origin connections |
| Health Checks | Available | Can enable for origin monitoring |

### Compression

**Brotli** is enabled by default on Pro plans. The toggle was removed from the dashboard in May 2024. To customize, use **Rules → Compression Rules**.

## What's Disabled (Intentionally)

| Feature | Why Disabled |
|---------|--------------|
| **Super Bot Fight Mode** | Causes challenge pages - adds friction for visitors |
| **Rocket Loader** | Can break JavaScript - risky without thorough testing |
| **WordPress APO** | Not using WordPress |

## What's Not Needed

| Feature | Why Skipped |
|---------|-------------|
| Image Transformations | Paid add-on, Polish is sufficient |
| Regional Tiered Cache | Requires upgrade |
| Cache Reserve | Requires upgrade |
| Argo Smart Routing | Paid add-on |
| Prefetch URLs | Enterprise only |

## Deprecated Features

- **Auto Minify** - Removed by Cloudflare in August 2024
- **Brotli toggle** - Removed May 2024 (now always on for Pro)
- **Mirage** - May be folded into Polish or removed

## Security (WAF)

These can be enabled without causing visitor friction:

| Feature | Effect |
|---------|--------|
| Cloudflare Managed Ruleset | Blocks attacks silently |
| OWASP Core Ruleset | Blocks XSS, SQLi silently |

**Avoid:** Any "Bot Fight" or "Challenge" features that show interstitial pages.

## Cloudflare Stream (Video CDN)

### What It Is
Separate paid service for adaptive bitrate video streaming. Automatically adjusts quality for slow connections.

### Pricing
- **Free with Pro:** 100 minutes storage, 10,000 minutes delivery/month
- **$5/month add-on:** 1,000 minutes storage, 5,000 minutes delivery
- **Overage:** $5/1,000 min storage, $1/1,000 min delivery

### Our Decision: NOT USING (for now)

**Why:**
1. **Cost risk at scale** - If site goes viral, Stream charges per minute delivered
   - 2M visitors watching 3 min each = 6M minutes = ~$6,000/month
2. **Current CDN is free** - Regular video files served via CDN have unlimited bandwidth with Pro
3. **Requires re-uploading** - Would need to upload all videos to Stream and change embed codes

**When to reconsider:**
- If viewers on slow connections report buffering issues (adaptive bitrate would help)
- If we want to offload video hosting entirely
- For a small number of high-priority videos only (hybrid approach)

### If We Use Stream Later

Location: **Media → Stream** in Cloudflare dashboard (account level, not domain level)

Could automate via:
- Stream API for uploads
- GitHub Actions to detect new videos and upload
- Update site templates to use Stream embed codes

## Cost Summary

| Scenario | Monthly Cost |
|----------|--------------|
| Current setup (Pro only) | $25 flat |
| Pro + Stream starter | $25 + $5 = $30 |
| Viral traffic (2M visitors) | $25 (CDN is unlimited) |
| Viral + Stream | $25 + potentially $1,000s |

**Bottom line:** The Pro plan's unlimited CDN bandwidth is the safest choice for cost control. Stream adds value (adaptive bitrate) but introduces variable costs.

## Dashboard Navigation

- **Speed optimizations:** Domain → Speed → Settings
- **Smart Shield:** Domain → Speed → Smart Shield
- **Caching rules:** Domain → Caching
- **WAF/Security:** Domain → Security → WAF
- **Stream:** Account level → Media → Stream
- **Billing:** Account → Manage account → Billing

## References

- [Cloudflare Stream Pricing](https://developers.cloudflare.com/stream/pricing/)
- [Auto Minify Deprecation](https://community.cloudflare.com/t/deprecating-auto-minify/655677)
- [Brotli Settings Removal](https://community.cloudflare.com/t/auto-minify-and-brotli-settings-missing-from-dashboard/788599)
