# LLM Search Procedure for Finding New Incidents

Step-by-step guide for AI assistants to search for and document new ICE incidents.

## Ad-Hoc Incident Additions (User Provides a Link)

**⚠️ CRITICAL:** When a user provides a news link and asks you to add an incident, **DO NOT just use that one source.** Always search for additional coverage first.

**Procedure:**
1. Read the provided source to extract key details (names, location, date)
2. Run 2-3 parallel web searches for additional coverage
3. Check major outlets: NYT, WaPo, NBC, CBS, ABC, PBS, AP, local TV
4. Create the incident file with ALL discovered sources

**Why:** Major stories typically have 5-10+ sources. A single-source incident file looks poorly researched. The user expects you to find comprehensive coverage, not just use what they gave you.

**Example:**
- User provides: 1 NYT link about judge ordering ICE director to court
- You should find: NBC, WaPo, CBS, ABC, PBS, local coverage = 8+ sources
- Then create the incident with all sources

See `adding-incidents.md` Step 1.5 for full details.

---

## Daily Search Command

When the user says **"do our daily search"** or similar, follow this exact procedure:

### Phase 1: Gather Context (Before Searching)
1. **Read existing incidents** - Use Explore agent to get current incident count and recent additions
2. **Read `dev-docs/not_use.md`** - Know what stories have been rejected and why
3. **Read unverified incidents** - Check `docs/incidents/` for files with `trustworthiness: unverified` to see if news has broken

### Phase 2: Launch Parallel Search Agents
Launch **4-6 agents simultaneously** with different search strategies:

| Agent | Focus Area | Search Terms |
|-------|------------|--------------|
| 1 | BMTN Daily Lists | `site:bringmethenews.com ICE Minnesota [today/yesterday dates]` |
| 2 | Local TV News | `KARE 11 OR KSTP OR Fox 9 OR CBS Minnesota ICE Minneapolis [dates]` |
| 3 | Sahan Journal + MPR | `site:sahanjournal.com OR site:mprnews.org ICE Minnesota January 2026` |
| 4 | Social Media | `site:x.com OR site:bsky.app ICE Minneapolis Minnesota [dates]` |
| 5 | Video Evidence | `ICE Minnesota video footage January 2026` |
| 6 | Unverified Follow-up | Search for specific unverified incident details (names, locations) |

### Phase 3: Cross-Reference and Report
Each agent should:
1. Cross-reference findings against existing `docs/incidents/` files
2. Cross-reference against `dev-docs/not_use.md`
3. Return structured report with:
   - **New incidents found** (date, location, description, sources)
   - **Already documented** (incident matched existing file)
   - **Add to not_use.md** (evaluated and rejected, with reason)
   - **Updates to existing** (new sources, status changes)
   - **Unverified upgrades** (news found for unverified incidents)

### Phase 4: Output
After agents complete, produce summary table:

```markdown
## Daily Search Results - [Date]

### New Incidents Found
| Date | Location | Description | Video? | Sources | Action |
|------|----------|-------------|--------|---------|--------|

### Existing Incidents Updated
| Incident | Update Type | Details |
|----------|-------------|---------|

### Added to not_use.md
| Story | Reason |
|-------|--------|

### Unverified Status Changes
| Incident | Old Status | New Status | Evidence |
|----------|------------|------------|----------|

### Search Terms Used
[List all search queries run]
```

---

## Daily/Recurring Search Mode

This procedure is designed to be run **1-2 times daily**. For efficient recurring searches:

1. **Focus on the last 24-48 hours** - Prioritize yesterday and today's dates
2. **Check BMTN daily lists first** - Bring Me The News publishes daily roundup articles
3. **Use the Task tool with Explore agent** - Get comprehensive incident summary before searching
4. **Cross-reference quickly** - Many searches will confirm existing coverage; that's expected

### Quick Start for Daily Searches
```
1. Read existing incidents (use Explore agent for summary)
2. Search BMTN for "List of major ICE raids" + [yesterday/today date]
3. Run 4-5 parallel web searches for recent incidents
4. Cross-reference results against existing files
5. Document new incidents, add sources to existing, update not_use.md
```

## Before You Start

1. **Read existing incidents list** - Check `docs/incidents/` to see what's already documented
2. **Read not_use.md** - Check `dev-docs/not_use.md` for stories already evaluated and rejected
3. **Note the current date** - Search results are time-sensitive
4. **Check recent git activity** - `git diff HEAD~5 --name-only` shows recently added incidents

## Search Strategy

### Step 1: Run Multiple Parallel Searches

Use web search tools to run these queries simultaneously:

```
ICE Minneapolis Minnesota [current month year] video evidence
ICE Minneapolis St Paul [current month year] physical abuse brutality
ICE Minnesota citizen detained wrongful arrest [current month year]
ICE raid Minnesota [recent dates]
```

### Step 2: Check Key Sources Directly

Search these specific sites:
- `"Bring Me The News" ICE Minnesota` - Best for daily raid lists
- `"Sahan Journal" ICE Minnesota` - Immigration-focused investigative coverage
- `"Star Tribune" ICE Minneapolis` - Local paper of record
- `"MPR News" ICE Minnesota` - Public radio, often first to report

### Step 3: Search for Video Evidence Specifically

Look for incidents with:
- Cell phone footage
- News station video
- Social media videos picked up by news
- Photo documentation

Priority searches:
```
ICE Minnesota video footage [month year]
ICE Minneapolis assault [month year] video
ProPublica ICE Minnesota [month year]
```

### Step 4: Check for Legal Actions/ACLU

Search for:
```
ACLU ICE Minnesota lawsuit [month year]
ICE Minnesota lawsuit citizen detained
```

### Step 5: Search Social Media Platforms

**CRITICAL:** Social media often has first-hand video evidence before news coverage.

#### X (Twitter)
```
site:x.com ICE Minnesota Minneapolis [month year]
site:twitter.com ICE Minneapolis [month year]
```

#### Bluesky
```
site:bsky.app ICE Minnesota Minneapolis [month year]
```

#### TikTok
```
site:tiktok.com ICE Minnesota Minneapolis [month year]
```

#### Instagram
```
site:instagram.com ICE Minnesota video [month year]
```

#### Threads
```
site:threads.net ICE Minnesota [month year]
```

#### Key Accounts to Monitor
- **@mnicewatch** (Instagram) - MN ICE Watch community tracking
- **@DHSgov** / **@ICEgov** (X) - Official DHS/ICE responses
- **Middle East Eye** (TikTok) - Often covers Minneapolis incidents
- Local reporter accounts on X

#### Important Notes on Social Media
- Social media posts alone are NOT sufficient for HIGH trustworthiness
- Look for videos that were later picked up by news outlets
- When you find a viral video, search for the affected individual's name or location to find news coverage
- If a social media post has video but no news pickup, add to "Needs More Research" and rate MEDIUM at best

### Step 6: Search the General Web

In addition to specific news sites, always search the general web for incidents:
```
"affected individual full name" ICE detained
"affected individual full name" Minnesota
incident location ICE arrest [date]
```

This catches coverage from smaller outlets, syndicated stories, and social media that may not appear in site-specific searches. If a story only appears in ONE source after general web searches, flag it as needing corroboration and rate trustworthiness as MEDIUM at best.

## Evaluating Search Results

### Cross-Reference Against Existing Files

For each potential incident found:

1. **Check by date** - Do we have `docs/incidents/YYYY-MM/YYYY-MM-DD-*.md` for that date?
2. **Check by affected individual's name** - Grep for names in existing files
3. **Check by location** - Search for the street, business, or neighborhood
4. **Check not_use.md** - Is this story already evaluated and rejected?

```bash
# Example checks
grep -ri "person name" docs/incidents/
grep -ri "location" docs/incidents/
grep -i "story keywords" dev-docs/not_use.md
```

### Priority: Video/Photo Evidence

**Highest priority incidents** to document:
- Video showing physical abuse by ICE
- Video of unlawful arrest or detention
- Photo evidence of injuries
- Footage of citizens being stopped/harassed

These provide incontrovertible evidence and should be documented with HIGH trustworthiness if from multiple sources.

### What Qualifies as a New Incident

**DOCUMENT** if:
- U.S. citizen detained, arrested, or harmed
- Legal resident (green card, work visa, work permit) detained, arrested, or harmed
- U.S. citizen subjected to citizenship check (stopped, questioned)
- Bystander/observer arrested for filming or watching
- Non-criminal immigrants without legal status — business owners, workers, asylum seekers
- ICE activity at schools, hospitals, churches
- Video/photo evidence of abuse

**DO NOT DOCUMENT** (add to not_use.md instead):
- Protest-only coverage without a civil rights incident
- Criminal investigations (drug trafficking, weapons)
- Detainees with criminal convictions
- Single unverified social media posts
- Rumors without any news pickup

### Categorizing Incidents: citizens vs immigrants

**⚠️ CRITICAL DISTINCTION — Get this right when creating incident files:**

| Category | Who belongs here | Examples |
|----------|------------------|----------|
| `citizens` | **Has legal right to be in U.S.** | U.S. citizens, green card holders, valid work visa/permit holders, refugees with work authorization |
| `immigrants` | **Does NOT have legal status** | Undocumented, asylum-seekers awaiting decision, people with removal orders, overstayed visas |

**Simple test:** Does the person have VALID LEGAL STATUS?
- **YES** → `type: citizens` (even if they're not a U.S. citizen)
- **NO** → `type: immigrants`

**Common mistakes to avoid:**
- ❌ Legal resident with valid visa → DON'T put in `immigrants`
- ❌ Asylum seeker with pending case (no work authorization) → DON'T put in `citizens`
- ❌ H-2A temporary agricultural workers → These are `citizens` (valid work visa)
- ❌ Person with final removal order → This is `immigrants` (no longer has legal status)

**When in doubt:** Search for the person's immigration status in the sources. If a source says "valid visa," "green card," "legal resident," "work permit" → `citizens`. If it says "undocumented," "removal order," "pending asylum," "overstayed" → `immigrants`.

## Output Format

After completing search, report:

### New Incidents Found
| Date | Location | Brief Description | Video/Photo? | Sources |
|------|----------|-------------------|--------------|---------|

### Already Documented
List incidents found that match existing files

### Added to not_use.md
List stories evaluated and rejected, with reasons

### Needs More Research
List incidents that need additional verification before documenting

## Tips for Effective Searches

1. **Search by date ranges** - "January 15 16 2026" finds recent activity
2. **Use quotes for exact phrases** - "Bring Me The News" ensures that site
3. **Check list articles** - Sites like BMTN often publish "List of major ICE raids on [date]"
4. **Follow up on vague mentions** - If a search mentions an incident briefly, search specifically for it
5. **Look for updates** - Existing incidents may have new information (updated video, affected individual spoke out, lawsuit filed)

## After Searching

1. **Report findings to user** - Summarize what was found
2. **Propose new incident files** - If any qualify, outline what would be documented
3. **Update not_use.md** - Add any evaluated/rejected stories
4. **Update existing incidents** - If new information found for existing files
5. **Add ALL discovered sources** - Even unverified links should be added to incident files

### Updating Incident Content When New Information Emerges

When new sources contain significant new information (court rulings, releases, new charges, affected individual statements), update the incident file accordingly:

1. **Update the Summary** - Reflect major developments (e.g., judge's ruling, release, new charges)
2. **Update Status** - Change `ongoing` to `resolved` if case concluded
3. **Update Timeline** - Add new dated events
4. **Update `last_updated`** - **ONLY for substantive story changes** (see below)

Example: If a judge rules an arrest was unconstitutional, update the summary to mention the ruling, not just add the source.

### When to Update `last_updated` (Critical!)

**This field powers the "Sort by Updated" feature on the website.** Users who sort by "Updated" want to see incidents where something actually happened, not incidents that got more sources added.

| Action | Update `last_updated`? |
|--------|------------------------|
| Judge ruling / court decision | ✅ YES |
| Person released or deported | ✅ YES |
| Status change (ongoing → resolved) | ✅ YES |
| New facts emerge (identity confirmed, details) | ✅ YES |
| Lawsuit filed | ✅ YES |
| **Adding more news sources** | ❌ NO |
| **Adding video/photo links** | ❌ NO |
| **Trustworthiness rating change** | ❌ NO |
| **Formatting/typo fixes** | ❌ NO |

**Example:** You find 3 new news articles about the Garrison Gibson incident. Just add them to Sources — do NOT update `last_updated`. But if one of those articles says the judge released him, THEN update `last_updated` and the Summary.

### Adding Sources to Existing Incidents

**CRITICAL:** When researching, add ALL discovered sources to incident files, even if unverified:

- Add new sources to the END of the Sources section (don't reorder existing sources)
- Include social media links (X, TikTok, Instagram, Threads, BlueSky, Facebook)
- Include international coverage (UK, Canadian, Australian outlets)
- Include commentary/opinion pieces that reference the incident
- Mark video sources with **VIDEO** tag for easy identification

Example format for adding sources:
```markdown
## Sources
1. [Existing source 1](url)
2. [Existing source 2](url)
...existing sources...
15. X - @username (Month Year): [Post description](url)
16. TikTok - @account (Month Year): [Video description](url) - **VIDEO**
17. Instagram Reel (Month Year): [Description](url) - **VIDEO**
18. Threads - @account (Month Year): [Post description](url)
```

This ensures:
- Complete documentation of all coverage
- Easy identification of video sources for media gallery
- Preservation of the historical record

## Key BMTN Daily List URLs

Bring Me The News publishes daily roundup articles with predictable URL patterns:

```
bringmethenews.com/minnesota-news/list-of-major-ice-raids-updates-in-minnesota-on-[day]-jan-[date]
bringmethenews.com/minnesota-news/list-of-ice-raids-protest-updates-in-minnesota-on-[day]-jan-[date]
```

Example searches:
```
site:bringmethenews.com ICE January 17 2026
"Bring Me The News" list ICE raids January 17
```

These daily lists often contain brief mentions of incidents that may warrant their own file. Always check these first for recurring searches.

## Efficiency Tips for Recurring Searches

1. **Run parallel web searches** - Use 4-5 WebSearch calls in a single message for speed
2. **Grep before creating** - Before creating a new incident, grep for affected individual's name/location
3. **Update existing files generously** - Adding sources to existing incidents is valuable work
4. **Track what you've checked** - Report "Already documented" and "In not_use.md" findings
5. **Date-specific searches** - Include specific dates (e.g., "January 16 17 2026") in queries
6. **Note unclear incidents** - Add borderline cases to not_use.md with "may revisit" notes

## High-Value Sources for New Incidents

| Source | Best For | Check Frequency |
|--------|----------|-----------------|
| Bring Me The News | Daily raid lists, quick updates | Every search |
| Sahan Journal | In-depth investigative, immigrant communities | Daily |
| Star Tribune | Paper of record, official statements | Daily |
| MPR News | Breaking news, audio interviews | Daily |
| ICT News | Native American incidents | When relevant |
| ACLU Minnesota | Legal actions, civil rights cases | Weekly |
| CBS Minnesota / KSTP / KARE 11 | Video evidence, local TV coverage | As needed |

## Example Search Session Log

```
Date: 2026-01-17
Searches run:
- ICE Minneapolis January 2026 video evidence ✓
- ICE Minnesota citizen detained January 2026 ✓
- site:bringmethenews.com ICE January 16 17 2026 ✓
- ACLU Minnesota ICE lawsuit January 2026 ✓
- MPR News ICE Minnesota January 16 17 ✓

New incidents found:
- NewsGuild union member detained (Jan 16) - ADDED

Already documented (confirmed good coverage):
- Aliya Rahman (2026-01-13) ✓
- Garrison Gibson (2026-01-12) ✓ - added new sources
- Oglala Sioux detained (2026-01-14) ✓ - added new sources
- El Tapatio Willmar (2026-01-15) ✓

Added to not_use.md:
- Burnsville Salvation Army (Jan 16) - insufficient details
- New Hope apartment ICE presence - no specific affected individuals
- Far-right counter-protest - protest only, no enforcement incident

In not_use.md (already excluded):
- North Minneapolis shooting (Sosa-Celis) - excluded

Needs verification:
- None this session
```
