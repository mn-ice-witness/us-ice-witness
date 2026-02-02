# No-News-Media Incidents Procedure

When an incident has `trustworthiness: no-news-media`, follow these guidelines:

## Display Behavior

No-news-media incidents are **hidden from the main page** (both media gallery and list view). They only appear on the dedicated `/no-news-media` page, sorted by update date. This separation:
- Keeps the main site focused on incidents with news coverage
- Provides a dedicated space for readers who want to help find press coverage
- Prevents incidents without news coverage from being mixed with those that have it

## Required Elements

### 1. Brief Note + Request for Sources (Top of Body)
Immediately after the title, include a brief message asking for news coverage:

**Use this exact language:**

```markdown
# Title (NO NEWS MEDIA)

***Documented by social media posts. If you know of press coverage, please [contact us](mailto:tips@ice-witness.org).***
```

### 2. State Only Facts We Know
- Document only what can be directly observed or confirmed
- No speculation about what the incident "could represent"
- No editorializing about significance or implications
- No hypothetical scenarios

### 3. Editorial Assessment
Keep it brief and factual:

```markdown
## Editorial Assessment
**NO NEWS MEDIA** - [One sentence stating what we have and what's missing.]
```

## Upgrading to News-Covered

When an incident is upgraded from `trustworthiness: no-news-media` to `low`, `medium`, or `high`:

1. **Update the trustworthiness field** in frontmatter
2. **Remove the (NO NEWS MEDIA) suffix** from the title
3. **Remove the italic plea for information** at the top
4. **Update the Editorial Assessment** to reflect the new rating
5. **If the incident has local media**, manually add its slug to `docs/data/media-order.md`

## What NOT to Include

- Speculation like "this could represent (1)... (2)... (3)..."
- Statements about why we're publishing despite lacking news coverage
- Commentary on the significance if the claim were true
- Multiple paragraphs of analysis

## Example

**Good:**
```markdown
## Editorial Assessment
**NO NEWS MEDIA** - Screenshot from social media. Awaiting news coverage or date confirmation.
```

**Bad:**
```markdown
## Editorial Assessment
**NO NEWS MEDIA** - This could represent: (1) a legitimate warning, (2) rumors, or (3) a fabricated screenshot. We are publishing this because the claim - if true - would represent a significant tactic worth documenting.
```
