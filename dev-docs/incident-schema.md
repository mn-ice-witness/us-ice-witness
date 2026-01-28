# Incident Markdown Schema

Every incident is a markdown file with YAML frontmatter. This document defines the exact schema.

## ⚠️ Critical: Neutral Language

**Use "Affected Individual(s)" — NOT "Victim(s)"**

This project uses neutral, documentary language. The term "victim" carries emotional weight and implies judgment. Instead:

| Don't Use | Use Instead |
|-----------|-------------|
| `victim_citizenship:` | `affected_individual_citizenship:` |
| `## Victim(s)` | `## Affected Individual(s)` |
| "the victim" | "the affected individual" |
| "victims" | "affected individuals" |

**Why?** We present facts and let readers draw conclusions. Neutral terminology maintains credibility and objectivity.

**Exception:** Preserve "victim" in direct quotes from sources.

See [adding-incidents.md](adding-incidents.md#language-guidelines) for complete language guidelines.

## File Naming

```
docs/incidents/YYYY-MM/YYYY-MM-DD-slug.md
```

Examples:
- `docs/incidents/2026-01/2026-01-07-renee-good-shooting.md`
- `docs/incidents/2025-12/2025-12-10-mubashir-lunch-break.md`

**IMPORTANT:** All incident files MUST be in `docs/incidents/`. The website serves directly from `docs/`.

## Frontmatter Fields

```yaml
---
date: YYYY-MM-DD              # Required. Incident date
time: HH:MM or "unknown"      # Optional. Time of day
location: string              # Required. Specific location
city: string                  # Required. Minneapolis, St. Paul, etc.
type: enum                    # Required. See types below
status: enum                  # Required. ongoing | resolved | under-investigation
affected_individual_citizenship: enum  # Required. See values below
injuries: enum                # Required. none | minor | serious | fatal
trustworthiness: enum         # Required. EXACTLY ONE OF: high | medium | low | unverified (no compound values like "medium-high")
created: YYYY-MM-DDTHH:MM:SS  # Required. When incident was first added to site
last_updated: YYYY-MM-DDTHH:MM:SS  # Required. When last MAJOR update occurred (see rules)
---
```

### `created` and `last_updated` Field Rules

**Format:** Full ISO 8601 timestamp with seconds: `YYYY-MM-DDTHH:MM:SS`

#### ⚠️ MANDATORY: Run the timestamp script (Critical!)

**You MUST run this command and copy-paste its output:**
```bash
./bin/timestamp.sh
```

**Do NOT type a timestamp manually** — LLMs ALWAYS fabricate plausible-looking times (like `12:00:00` or `14:30:00`) that are wrong. Run the script, copy, paste. No exceptions.

| Example | Correct? |
|---------|----------|
| `2026-01-19T14:23:47` | ✅ Actual time when making the change |
| `2026-01-19T12:00:00` | ❌ Rounded time (clearly made up) |
| `2026-01-19T14:30:00` | ❌ Rounded time (clearly made up) |
| `2026-01-19T23:59:59` | ❌ Artificial end-of-day timestamp |

**Why?** Incorrect timestamps break the "Sort by Updated" feature and mislead users.

---

**`created`**: Set to the ACTUAL current time when you first create the file. Never changes after that.

**`last_updated`**: Set to the ACTUAL current time when making a MAJOR story update.

**When adding a new incident:** Set BOTH `created` and `last_updated` to the exact current time.

**When updating an existing incident:**

| Update Type | Change `last_updated`? |
|-------------|------------------------|
| Case development (ruling, release, charges) | ✅ YES |
| Status change (detained → released) | ✅ YES |
| New facts emerge (identity confirmed, details) | ✅ YES |
| Merging duplicate incidents | ✅ YES |
| Adding more sources | ❌ NO |
| Formatting/schema changes | ❌ NO |
| Trustworthiness rating change | ❌ NO |
| Typo fixes | ❌ NO |

See `adding-incidents.md` for detailed guidance.

### Type Values

**⚠️ CRITICAL: There are EXACTLY 5 incident types. Use ONLY these values:**

```
citizens | observers | immigrants | schools-hospitals | response
```

| Value | Use For |
|-------|---------|
| `citizens` | U.S. citizens **OR anyone with valid legal status** (green cards, work visas, work permits, refugees with authorization) — people who have the RIGHT to be here |
| `observers` | People **detained or attacked for filming, observing, or protesting** ICE — targeted for what they were doing |
| `immigrants` | People **without legal status**: undocumented, asylum-seekers with pending cases, those with removal/deportation orders, overstayed visas |
| `schools-hospitals` | Actions at/near schools or hospitals, including patient targeting and workplace audits |
| `response` | **FEDERAL GOVERNMENT ONLY:** DHS/ICE/CBP official statements (e.g., Trump, Noem, Bovino, @DHSgov). NOT for local police, mayors, governors, or other non-federal officials. |

**⚠️ CRITICAL: citizens vs immigrants — THE KEY DISTINCTION:**

| Category | Who belongs here | Examples |
|----------|------------------|----------|
| `citizens` | **Has legal right to be in U.S.** | U.S. citizens (born or naturalized), green card holders, valid work visa holders, valid work permit holders, refugees with work authorization, TPS holders with authorization |
| `immigrants` | **Does NOT have legal status** | Undocumented, asylum-seekers still waiting for decision, people with final removal orders, overstayed visas, pending applications without current authorization |

**Simple test:** Does the person have VALID LEGAL STATUS to be in the U.S.?
- **YES** → `citizens` (even if they're not a U.S. citizen)
- **NO** → `immigrants`

**Do NOT invent types.** Values like `schools`, `workplace-raid`, `citizen-detained`, or any other variation will break filtering.

**Citizens vs Observers — Key Distinction:**
Both categories may involve U.S. citizens being detained. Choose based on WHY they were targeted:
- **`citizens`** = Racial profiling or mistaken identity. Person was just living their life (working, driving, shopping, walking).
- **`observers`** = First Amendment retaliation. Person was actively filming, following, watching, or protesting ICE.

**Multiple Types:**
- Multiple types ARE allowed — use comma-separated values (e.g., `type: citizens, schools-hospitals`)
- **The FIRST type determines the category shown in media cards and the NEW/UPDATED list view**
- Order matters: put the most relevant category first
- Workplace raids of non-U.S. citizens → use `immigrants`

### Affected Individual Citizenship Values

**⚠️ IMPORTANT: Citizenship is NOT a category.** This field is internal metadata about the affected individual. It is NOT displayed in the UI header alongside the type. The 5 `type` values are the ONLY categories shown to users.

| Value | Display Label | Meaning |
|-------|---------------|---------|
| `us-citizen` | Citizen | U.S. citizen (born or naturalized) |
| `legal-resident` | Legal Resident | Green card, visa, legal status |
| `asylum-seeker` | Immigrant Pending Status | Asylum seeker, TPS, DACA, temporary/pending status |
| `undocumented` | Immigrant | No current legal status |
| `unknown` | *(not displayed)* | Status not confirmed |
| `n/a` | *(not displayed)* | Not applicable (e.g., DHS response documents) |
| `various` | *(handled specially)* | Multiple individuals with different statuses |

**Do NOT use:** `refugee` (use `legal-resident` if green card, `asylum-seeker` if still in refugee status), `mixed-status-household` (use `various`), `legal-status` (use `legal-resident`), `us-citizens` plural (use `us-citizen`)

## Body Structure

```markdown
# Incident Title
```

### UNVERIFIED Incidents - Special Formatting

For incidents with `trustworthiness: unverified`, add two special elements:

1. **Title suffix**: Add `(UNVERIFIED)` to the end of the title
2. **Warning message**: Add a bold italic disclaimer between title and Summary

```markdown
# Incident Title (UNVERIFIED)

***No mainstream media has reported on this incident. It is based on social media posts only. If you have a media source, please [contact us](mailto:mnicewitness@gmail.com).***

## Summary
```

This allows us to make editorial judgments about incidents worth documenting while clearly communicating the verification level to readers.

### Updates Section

The Updates section is for **substantive story developments** - things that happened in the real world that change the story. Most incidents won't have an Updates section.

**What GOES in Updates:**
- Court rulings, judge decisions
- Person released or deported
- Autopsy results, medical examiner findings
- Lawsuit filed
- Status changes (ongoing → resolved)
- Major new facts emerge (identity confirmed, new charges)
- Family/affected individual statements

**What does NOT go in Updates:**
- Adding more news sources (just add to Sources)
- Adding video/photo links (just add to Sources)
- Federal response incidents (link in Related Incidents section instead)
- CNN/Bellingcat video analysis (add to Sources, optionally mention in italic note)
- Trustworthiness rating changes
- Formatting fixes

**Format:**
- Date format: **Jan 24** (no times, no year)
- Newest updates first
- Brief description with hyperlink to source
- End each item with a period

```markdown
## Updates
- **Jan 24** - Brief description of [major update](URL).
- **Jan 22** - Earlier [major update](URL).

## Summary
Brief 2-3 sentence summary. First sentence appears in card preview.

## Sources
All sources numbered. Best/most compelling source first (original reporting, key video, outlet that broke story). Every source includes outlet name and date.

1. Instagram Video (Jan 15, 2026): [Shawn Jackson interview](URL)
2. YouTube Video (Jan 14, 2026): [Full press conference](URL)
3. FOX 9 (Jan 15, 2026): [6 children hospitalized after flash bang](URL)
4. Star Tribune (Jan 14, 2026): [ICE agents clash with residents](URL)
5. CNN (Jan 15, 2026): [Minneapolis family describes attack](URL)

## Related Incidents
(Optional - include when there are DHS/federal response incidents or closely connected incidents)

- [DHS Response: Statement Title](#2026-01-XX-dhs-response-incident-id)
- [Related Incident Title](#2026-01-XX-related-incident-id)

Use this section to link to:
- Federal response incidents (type: `response`) that address this incident
- Closely related incidents (same person, same event series)

Do NOT use this section to link to general news sources - those go in Sources.

## Affected Individual(s)
- **Name:** (if public, else "Not disclosed")
- **Age:**
- **Occupation:**
- **Citizenship:**
- **Background:** Brief relevant context

## Timeline
**Keep timelines concise.** Capture only major moments, not every step. A timeline should highlight 3-7 key events, not provide a minute-by-minute narrative. Include: arrival/start, pivotal actions (arrests, use of force, key confrontations), and resolution/departure.

- **HH:MM** - Event 1
- **HH:MM** - Event 2
- **Later** - Event 3

## Official Accounts

### DHS/ICE Statement
Quote or summary of federal position.

### Local Officials
Statements from mayor, governor, police, etc.

## Witness Accounts
Direct quotes or summaries.

## Editorial Assessment
**TRUSTWORTHINESS_LEVEL** - Brief explanation of why this rating, citing the specific criteria met.

**IMPORTANT:** Use exactly one rating value. Do NOT use compound ratings like "medium-high".

**See [Source Credibility Tiers](source-tiers.md)** for guidance on how different source types affect trustworthiness ratings.

Examples:
- **HIGH** - 3 independent sources (Star Tribune, MPR, Fox 9)
- **HIGH** - Detailed Intercept investigation with named affected individual and direct quotes
- **HIGH** - Video evidence + coverage by established local news
- **MEDIUM** - 2 sources (local news + union statement)
- **MEDIUM** - Well reported but no independent firsthand witnesses on scene to corroborate; account relies on affected individual/family statement
- **MEDIUM** - Viral social media with video evidence, but no coverage from established news organizations (see source-tiers.md)
- **LOW** - Single community paper report, needs corroboration
```

## DHS Response Section (within incidents)

When DHS/ICE posts an official response to a specific incident (especially on X @DHSgov), include it in the incident file:

```markdown
## DHS Response
Posted on X (@DHSgov):

> "Quote from their post"

**Note:** [Your factual analysis of whether evidence supports their claim]
```

## Official Response Documents (standalone)

**IMPORTANT: `type: response` is ONLY for federal government (DHS/ICE/CBP) statements.**

Examples of `response`:
- DHS press release justifying arrests
- @DHSgov or @ICEgov tweets about an incident
- Statements from Kristi Noem, Bovino, Trump about MN operations

**NOT `response`** (use `citizens` instead):
- Local police chiefs speaking about civil rights violations
- Mayors or governors criticizing ICE
- Sheriff statements about profiling concerns
- Any non-federal official statement

For DHS/ICE press releases and statements justifying specific arrests, create standalone documents with type `response`:

```markdown
---
date: YYYY-MM-DD
time: unknown
location: DHS Press Release
city: Minneapolis
type: response
status: resolved
affected_individual_citizenship: unknown
injuries: none
trustworthiness: high
last_updated: YYYY-MM-DDTHH:MM:SS
---

# DHS Statement: [Title describing what they're justifying]

## Summary
Brief description of what DHS/ICE claims and who they claim to have arrested.

## Sources
1. DHS.gov (Jan 8, 2026): [DHS Press Release](URL)
2. X Post (Jan 8, 2026): [@DHSgov statement](URL)

## Official Statement
Full quote or detailed summary of their justification.

### Criminal History Cited
List the specific criminal history claims made by DHS/ICE:
- **Name:** Crime claimed

## Fact Check
Analysis of whether the claims can be independently verified.

## Editorial Assessment
Assessment of whether DHS claims match available evidence.
```

### Researching Official Responses

When documenting incidents, search for DHS/ICE official responses:

1. **DHS Press Releases:** https://www.dhs.gov/news-releases/press-releases
2. **ICE News Releases:** https://www.ice.gov/news/releases
3. **X/Twitter accounts:**
   - @DHSgov
   - @ICEgov
   - @DHSBlueCampaign
   - @Abordar (CBP)
4. **Major news coverage:** Search "[incident name] DHS response" or "ICE statement [location]"

Include responses even when claims are disputed - document the official position and note discrepancies.

## Example Minimal Incident

```markdown
---
date: 2026-01-11
time: afternoon
location: Speedway, Snelling & Portland
city: St. Paul
type: observers
status: resolved
affected_individual_citizenship: us-citizen
injuries: minor
trustworthiness: high
created: 2026-01-13T14:30:00
last_updated: 2026-01-13T14:30:00
---

# Bystander Filming Arrest Tackled at Speedway

## Summary
A U.S. citizen filming an ICE arrest was tackled and detained despite complying with orders to back up.

## Sources
1. FOX 9 Video (Jan 11, 2026): [Arrest footage from scene](https://www.fox9.com/...)
2. FOX 9 (Jan 11, 2026): [Video shows bystander tackled at Speedway](https://www.fox9.com/...)

## Affected Individual(s)
- **Citizenship:** U.S. Citizen
- **Status:** Released same day

## Editorial Assessment
**HIGH** - Video evidence, multiple news sources.
```

## Source Formatting Rules

### What Counts as a Source

**A source MUST:**
1. **Be directly about the incident** - The source must contain content specifically about this incident. A business's general homepage or social media profile page is NOT a source.
2. **Have a valid, working link** - Every source must link to a specific page, article, video, or post. No link = not a source.
3. **Be accessible** - If a link requires login or is behind a paywall that prevents viewing the incident content, it should not be listed as a source.

**NOT valid sources:**
- Business homepages (e.g., restaurant's main website)
- General social media profile pages (e.g., @francisburgerjoint Instagram profile)
- Pages that don't mention the incident
- Dead links

**Valid sources include:**
- News articles about the incident
- Specific social media posts about the incident (direct link to post)
- Video embeds of incident footage
- Official statements (with link to statement)

### Format
Every source follows this format:
```
N. Outlet Name (Mon DD, YYYY): [Article/Video Title](URL)
```

- **All sources numbered** starting at 1
- **Outlet name first** (FOX 9, Star Tribune, Instagram Video, etc.)
- **Date in parentheses** in format `(Mon DD, YYYY)` - always include the day
- **Colon** after the closing parenthesis
- **Title in brackets** linked to URL
- **Best/most compelling source first** - Lead with the primary source (original reporting, key video evidence, or the outlet that broke the story). This is often video but can be an article if that's the main reporting.
- **Every source MUST have a link** - no link means it's not a source

### Video Sources
For video content, use platform name + "Video":
```
1. Instagram Video (Jan 15, 2026): [Shawn Jackson interview](URL)
2. YouTube Video (Jan 14, 2026): [Full press conference](URL)
3. Facebook Video (Jan 12, 2026): [Witness footage of arrest](URL)
4. X Video (Jan 13, 2026): [FOX 9 coverage](URL)
5. TikTok Video (Jan 13, 2026): [Witness footage](URL)
6. CBS Video (Jan 14, 2026): [News report with footage](URL)
```

### Social Media (Non-Video) Sources
For social media posts that aren't primarily video:
```
1. X Post (Jan 15, 2026): [@DHSgov statement](URL)
2. Threads (Jan 15, 2026): [@username post](URL)
3. Bluesky (Jan 15, 2026): [@username.bsky.social post](URL)
4. Facebook Post (Jan 15, 2026): [Business name statement](URL)
5. Instagram Post (Jan 15, 2026): [@restaurantname announcement](URL)
```

### Common Mistakes to Avoid

**WRONG formats:**
```
3. [Instagram post](URL) - Francis Burger Joint          ❌ Wrong order, missing date
4. TikTok - @username: [Video](URL)                      ❌ Wrong format entirely
5. Facebook Post: [Description](URL)                     ❌ Missing date
6. Star Tribune (Jan 2026): [Headline](URL)              ❌ Missing day - use full date
7. [News article](URL) (Jan 15, 2026)                    ❌ Outlet name missing, wrong order
8. **VIDEO** Instagram (Jan 15, 2026): [Title](URL)      ❌ Don't prefix with VIDEO
9. Instagram Video (Jan 15, 2026): [Title](URL) - **VIDEO**  ❌ Don't suffix with VIDEO
```

**CORRECT formats:**
```
1. Instagram Post (Jan 15, 2026): [Francis Burger Joint statement](URL)  ✅
2. TikTok Video (Jan 13, 2026): [@username witness footage](URL)         ✅
3. Facebook Post (Jan 14, 2026): [Business announcement](URL)            ✅
4. Star Tribune (Jan 15, 2026): [Headline text here](URL)                ✅
5. Instagram Video (Jan 15, 2026): [Interview with witness](URL)         ✅
```

### Article Sources
For articles, use outlet name:
```
6. FOX 9 (Jan 15, 2026): [6 children hospitalized after flash bang](URL)
7. Star Tribune (Jan 14, 2026): [ICE agents clash with residents](URL)
8. CNN (Jan 15, 2026): [Minneapolis family describes attack](URL)
9. Bring Me The News (Jan 13, 2026): [Federal agents use tear gas](URL)
10. New York Times (Jan 15, 2026): [Couple Says ICE Agents Gassed Them](URL)
```

### Source Priority Order
Order sources by importance/value, not by type. When choosing what goes first:
1. Original reporting that broke the story (often a local news outlet)
2. Primary video evidence (interviews, press conferences, witness footage)
3. Major news outlet coverage with additional details
4. Syndicated coverage (Yahoo, AOL, NewsBreak reprinting original story)
5. Social media shares/reposts

When an incident has multiple videos, order videos by importance:
1. Full interviews / press conferences with affected individual
2. Original source video (posted by witness/affected individual)
3. News outlet video coverage
4. Social media reposts

### Common Outlet Names
Use consistent outlet names:
- `FOX 9` (not Fox 9 or Fox9)
- `Star Tribune` (not StarTribune)
- `Bring Me The News` (not BMTN)
- `CBS Minnesota` (not CBS MN or WCCO)
- `KARE 11` (not Kare11)
- `MPR News` (not Minnesota Public Radio)
- `Pioneer Press` (not St. Paul Pioneer Press)
- `Sahan Journal`
- `Minnesota Reformer`

### What NOT to Include
- Sources without links (no link = not a source)
- Links that don't directly reference the incident (e.g., business homepages, social media profile pages)
- Trailing "- Publication" after the URL
- Unnumbered sources
- Italic lines about "photos/videos referenced above"
- "Social Media" sections with general profile links (only include specific posts about the incident)

## Internal Links to Other Incidents

When linking to another incident within our site (e.g., in "Related incident" or "See also" references), use **relative hash URLs**, NOT markdown file paths.

### Correct Format
```markdown
[Related incident](#2026-01-19-dhs-response-saly-detention)
```

### Wrong Formats
```markdown
[Related incident](2026-01-19-dhs-response-saly-detention.md)  ❌ Links to .md file
[Related incident](http://localhost:8000/#2026-01-19-dhs-response-saly-detention)  ❌ Absolute URL
[Related incident](https://mnicefiles.com/#2026-01-19-dhs-response-saly-detention)  ❌ Absolute URL
```

### Why Hash URLs?
This site is a single-page application. All navigation uses hash-based routing:
- The browser stays on `index.html`
- The hash (`#incident-slug`) tells the app which incident to display
- Linking to `.md` files will show raw markdown, not the formatted incident
