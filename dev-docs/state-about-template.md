# State about.md Template

Each state repo should have its own `docs/about.md` file. This is loaded by the site and displayed when users click "About".

**State maintainers are free to edit this file** to include:
- State-specific background and context
- Local news sources and investigations
- State-specific legal context
- Contact information

Copy the template below to `docs/about.md` in your state repo and customize it.

---

```markdown
# About This Site

<p class="about-intro">A free, fact-based documentation of ICE enforcement and its impact on [STATE] communities, maintained by community volunteers. If you find this site useful, please help share. To report an incident (must be sourced by a reputable media outlet), submit a correction, or share additional media for a listed incident, contact us at <a href="mailto:tips@ice-witness.org">tips@ice-witness.org</a> — please include compelling social media links as it's often hard to track those down. <span class="about-last-updated">Last updated: [DATE]</span></p>

<h2 id="using-this-site">Using This Site <a href="#using-this-site" class="header-link" title="Copy link"><svg width="16" height="16"><use href="#icon-link"/></svg></a></h2>

- **NEW/UPDATED toggle** — When enabled, incidents are sorted by when they were added or last updated (e.g., judge ruling, person released). With this off, incidents in list view are sorted by category and then by the date the incident occurred.
- <svg viewBox="0 0 24 24" width="16" height="16" class="media-icon"><use href="#icon-camera"/></svg> **Camera icon** — Incident has video or photo evidence in the media gallery.
- **Greyed out rows** — Incidents you've already viewed appear greyed out to help you track what you've read. <a href="#clear-viewed">Clear history</a>.

<h2 id="background">Background <a href="#background" class="header-link" title="Copy link"><svg width="16" height="16"><use href="#icon-link"/></svg></a></h2>

<!-- Edit this section with state-specific background -->

[Add state-specific background here - legal context, major operations, etc.]

<h2 id="what-this-site-documents">What This Site Documents <a href="#what-this-site-documents" class="header-link" title="Copy link"><svg width="16" height="16"><use href="#icon-link"/></svg></a></h2>

This site compiles sourced, verified incidents from [STATE].

### Categories

Incidents are organized into five categories:

- **Citizens / Legal Residents** — U.S. citizens, green card holders, work visa holders, and authorized refugees detained while going about daily life (working, driving, shopping) — anyone with approved legal status
- **Observers** — People detained while filming, observing, following, or protesting ICE enforcement operations
- **Immigrants** — People without approved legal status, including undocumented immigrants and asylum-seekers with pending cases
- **Schools/Hospitals** — Actions at or near schools, hospitals, and healthcare institutions
- **Response** — Official DHS/ICE statements about specific incidents

<h2 id="trustworthiness">Trustworthiness Ratings <a href="#trustworthiness" class="header-link" title="Copy link"><svg width="16" height="16"><use href="#icon-link"/></svg></a></h2>

Each incident is rated for trustworthiness based on source quality and corroboration:

- <span class="about-badge about-badge-high">HIGH</span> — 3+ sources, video/photo evidence, or detailed investigative reporting with named sources
- <span class="about-badge about-badge-medium">MEDIUM</span> — 2 sources, official statements, or single established source
- <span class="about-badge about-badge-low">LOW</span> — Single smaller source, needs corroboration
- <span class="about-badge about-badge-no-news-media">NO NEWS MEDIA</span> — Reported but not yet confirmed

<h2 id="source-tiers">Source Tiers <a href="#source-tiers" class="header-link" title="Copy link"><svg width="16" height="16"><use href="#icon-link"/></svg></a></h2>

### Tier 1 — Highest Credibility
Major national outlets with editorial standards: Associated Press, Reuters, New York Times, Washington Post, NPR, PBS, ABC/CBS/NBC News, CNN, BBC, ProPublica, The Intercept.

### Tier 2 — Established Regional/Local
<!-- Edit with state-specific outlets -->
[State]-based outlets with established credibility: [List local newspapers, TV stations, public radio].

### Tier 3 — Local/Specialized
Smaller local outlets, advocacy journalism, or outlets with clear perspective but factual reporting.

### Tier 4 — Social Media/Unverified
Raw social media posts, no-news-media claims. Used only to note reports exist, never as primary sourcing.

<h2 id="clear-viewed">Clear Viewed History <a href="#clear-viewed" class="header-link" title="Copy link"><svg width="16" height="16"><use href="#icon-link"/></svg></a></h2>

<button id="clear-viewed-btn" class="clear-viewed-btn">Clear All Viewed Incidents</button>

<script>
document.getElementById('clear-viewed-btn')?.addEventListener('click', function() {
    localStorage.removeItem('viewedIncidents');
    this.textContent = 'Cleared!';
    setTimeout(() => { this.textContent = 'Clear All Viewed Incidents'; }, 2000);
});
</script>
```
