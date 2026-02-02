# Firewall Strategy

This documents why the site may be blocked by corporate/school firewalls and how to address it.

## Why We Get Blocked

Corporate and school firewalls use **URL categorization services** to decide what to allow. New or uncategorized sites are often blocked by default. Sites covering sensitive topics (immigration enforcement, political content) may also be categorized as "controversial" and blocked.

This is NOT a security issue with our site - it's a categorization issue.

## Security Headers (Not the Problem)

Our security headers are properly configured in `docs/_headers` and score **A** on SecurityHeaders.com.

**To verify:** https://securityheaders.com/?q=https://us-ice-witness.org&followRedirects=on

Key headers we set:
- Strict-Transport-Security (HSTS)
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

The CSP includes `'unsafe-inline'` for script-src which caps us at A (not A+). Removing it would require refactoring all inline JavaScript - not worth the effort since headers aren't causing firewall blocks.

## Categorization Services

These services power most corporate firewalls. Submit the site to each to request proper categorization as "News/Media":

| Service | Submit URL | Status |
|---------|------------|--------|
| **Brightcloud (Webroot)** | https://www.brightcloud.com/tools/change-request-url-background.php | Not submitted |
| **Fortinet (FortiGuard)** | https://www.fortiguard.com/webfilter | Not submitted |
| **McAfee/TrustedSource** | https://trustedsource.org/sources/index.pl | Not submitted |
| **Palo Alto** | https://urlfiltering.paloaltonetworks.com | Requires login |
| **Symantec/Broadcom** | https://sitereview.bluecoat.com | Not submitted |

Changes typically propagate within 24-72 hours.

## Checking Current Categorization

To see how a vendor currently categorizes the site:

| Service | Lookup URL |
|---------|------------|
| Brightcloud | https://www.brightcloud.com/tools/url-ip-lookup.php |
| Fortinet | https://www.fortiguard.com/webfilter |
| Cisco Talos | https://talosintelligence.com/reputation_center |

## If Blocking Persists

1. Ask the user which network/firewall is blocking (corporate name, school district, etc.)
2. Identify which categorization vendor that network uses
3. Submit directly to that vendor
4. If categorized as "controversial" or "political," appeal the categorization

## Other Security Checks

| Tool | Purpose | URL |
|------|---------|-----|
| VirusTotal | Check if flagged as malicious | https://www.virustotal.com |
| Google Safe Browsing | Google's blocklist | https://transparencyreport.google.com/safe-browsing |
| SSL Labs | SSL/TLS configuration | https://www.ssllabs.com/ssltest/ |

## What We Cannot Automate

All categorization submissions require:
- CAPTCHAs
- Manual web forms
- Sometimes account creation

There are no APIs available for automated submission.
