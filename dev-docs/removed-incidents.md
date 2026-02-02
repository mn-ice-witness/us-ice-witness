# Removed Incidents Procedure

How to handle incidents that were previously listed but need to be removed due to new information that contradicts the original reporting.

## When to Remove an Incident

Remove an incident when:
- The source walks back or retracts their original claims
- New information emerges that contradicts the core factual basis
- The affected individual's status/citizenship cannot be verified as originally claimed
- The incident no longer fits the project's documentation criteria based on new facts

**Key distinction from "no-news-media":**
- **No-news-media** = We never had enough evidence to confirm the story
- **Removed** = We DID list the story based on initial reporting, but later information invalidated the core claims

## How to Remove an Incident

### 1. Update the Frontmatter

Change `trustworthiness` from its current value to `removed`:

```yaml
trustworthiness: removed
```

Update `last_updated` with a fresh timestamp:

```bash
./bin/timestamp.sh
```

### 2. Add Correction Note After Title

Add `(REMOVED)` to the title and insert a correction note block:

```markdown
# Original Title Here (REMOVED)

***This incident has been removed from the main listing. See Correction Note below.***

## Correction Note (Date)

**Why this was removed:** [Explain what changed]

**The problem:** [Explain why this invalidates the original reporting]

**What was originally reported:** [Brief summary of original claims]

**What changed:** [What new information emerged]

---
```

### 3. Update Summary Section

Change the heading from `## Summary` to `## Summary (Original)` to clarify this was the original reporting.

### 4. Update Editorial Assessment

Change the assessment to explain the removal:

```markdown
## Editorial Assessment
**REMOVED** - [Explanation of why removed, referencing the contradicting sources]
```

### 5. Add Correction Sources

Add the sources that document the contradicting information:

```markdown
## Sources Added for Correction
XX. [Source Name (Date)](URL) - Brief description
```

### 6. Update the Updates Section

Add an update noting the removal:

```markdown
## Updates
- **[Date]** - **REMOVED** — [Brief reason]. See Correction Note above.
```

## How the System Works

- Removed incidents are filtered out of the main display (same as no-news-media)
- They appear at `/removed` for transparency
- All original slugs/URLs continue to work
- Readers can click through to see the full incident with correction notes

## Files Involved

| File | What Changed |
|------|--------------|
| `docs/js/router.js` | Added `/removed` route |
| `docs/js/app.js` | `getFilteredIncidents()` filters out `removed`; added `getRemovedIncidents()` |
| `docs/js/lightbox.js` | Added `openRemoved()`, `renderRemovedContent()`, `setupRemovedLinks()` |
| `docs/css/style.css` | Added `.about-badge-removed` styling |
| `docs/about.md` | Added Removed Incidents section and link |

## Related Documentation

- `no-news-media-incidents.md` - For incidents that never had enough verification
- `adding-incidents.md` - Standard procedure for adding new incidents
- `source-tiers.md` - Source credibility evaluation
