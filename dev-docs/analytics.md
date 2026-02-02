# Analytics

## Current State

Google Analytics was removed (January 2026) because the gtag script caused CSP errors and triggered "tracker blocked" warnings in privacy browsers (DuckDuckGo, uBlock Origin, etc.), which sometimes blocked media playback.

## Options Considered

### 1. Cloudflare Web Analytics (Recommended if needed)
- Privacy-friendly (no cookies, no personal data, aggregated only)
- Enable from Cloudflare dashboard - no code changes needed
- Free with Cloudflare Pages
- Less likely to be blocked than Google Analytics
- **To enable:** Cloudflare Dashboard → Analytics & Logs → Web Analytics → Enable

### 2. Server-side only (Cloudflare Traffic Analytics)
- No client-side code, nothing to block
- Already available in Cloudflare dashboard
- Only shows requests/bandwidth, not unique visitors

### 3. Self-hosted (Plausible, Umami)
- Privacy-friendly, full control
- Requires hosting/maintenance

## Google Analytics Code (Preserved)

If GA needs to be restored, add to `<head>` of `docs/index.html`:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-N0KGYZ7FQX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-N0KGYZ7FQX');
</script>
```

**Property ID:** `G-N0KGYZ7FQX`

Also requires CSP headers in `docs/_headers`:
```
script-src: https://www.googletagmanager.com https://www.google-analytics.com
connect-src: https://www.google-analytics.com https://analytics.google.com
```
