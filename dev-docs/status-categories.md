# Status Categories and Location Formatting

How to categorize affected individuals and format the status line displayed in incident cards.

## Status Line Format

The status line appears at the top of incident cards:

```
[Status], [Location]
```

**Example:** `Citizen, South Minneapolis`

**NOT:** `Citizen/Resident, South Minneapolis (exact address unknown)`

## Status Categories (Exactly 5)

Use exactly ONE of these values for `affected_individual_citizenship`:

| Value | Display Label | Use For |
|-------|---------------|---------|
| `us-citizen` | Citizen | U.S. citizens (born or naturalized) |
| `legal-resident` | Legal Resident | Green card holders, valid work visas, legal permanent residents |
| `asylum-seeker` | Immigrant Pending Status | Asylum seekers, TPS holders, DACA recipients, anyone with temporary/pending status |
| `undocumented` | Immigrant | No current legal immigration status |
| `unknown` | *(not displayed)* | Status not confirmed by sources |

### Additional Values (Non-Display)

| Value | Use For |
|-------|---------|
| `n/a` | Response documents, institutional stories with no affected individual |
| `various` | Multiple affected individuals with different statuses |

### Key Distinctions

**Legal Resident vs Immigrant Pending Status:**
- **Legal Resident** = Has approved, stable status (green card, H-1B, L-1, etc.)
- **Immigrant Pending Status** = Status is temporary or awaiting decision (asylum pending, TPS, DACA)

**When in doubt:** If someone could lose their status due to policy changes or pending decisions, use `asylum-seeker` (displays as "Immigrant Pending Status").

### Examples

| Person | Status Value | Why |
|--------|--------------|-----|
| U.S.-born citizen | `us-citizen` | Born in U.S. |
| Naturalized citizen | `us-citizen` | Completed naturalization |
| Green card holder | `legal-resident` | Permanent resident status |
| H-1B worker | `legal-resident` | Valid work visa |
| Refugee (green card received) | `legal-resident` | Adjusted to permanent status |
| Asylum seeker (pending) | `asylum-seeker` | Awaiting asylum decision |
| TPS holder | `asylum-seeker` | Temporary protected status |
| DACA recipient | `asylum-seeker` | Temporary, could be revoked |
| Refugee (still in refugee status) | `asylum-seeker` | Not yet adjusted to permanent |
| No papers/overstayed visa | `undocumented` | No current legal status |

## Location Formatting

**Keep locations brief.** Just the place name, no extra context.

### DO

```yaml
location: South Minneapolis
location: Frogtown
location: Lake Street
location: Karmel Mall
location: Minneapolis-St. Paul Airport
```

### DON'T

```yaml
location: South Minneapolis (exact address unknown)      # No parenthetical notes
location: South Minneapolis, driving from grocery store  # No activity context
location: Near Target store, off Highway 36             # Too much detail
location: Bus stop at 31st Street and Bloomington Ave   # OK if intersection is the story
```

### When to Include Addresses

- **Named businesses/venues:** Include the name → `Karmel Mall`, `Hola Arepa`
- **Specific intersections:** Only if central to the story → `34th and Park Avenue`
- **Generic locations:** Just the neighborhood → `South Minneapolis`, `Frogtown`
- **Schools/hospitals:** Include name → `Roosevelt High School`, `HCMC`

### Location vs City

The `location` field is for specific location. The `city` field is for the municipality.

```yaml
location: Karmel Mall
city: Minneapolis
```

```yaml
location: Downtown
city: Willmar
```

## Updating Existing Incidents

When you encounter incidents with verbose locations, simplify them:

| Before | After |
|--------|-------|
| `South Minneapolis (exact address unknown)` | `South Minneapolis` |
| `South Minneapolis, driving from grocery store` | `South Minneapolis` |
| `Near Mercado Central, Lake Street` | `Mercado Central` or `Lake Street` |
| `East Side apartment (exact address unknown)` | `East Side` |

## Code Reference

The status label is rendered in `docs/js/lightbox-content.js` line ~130:
```javascript
<span class="tag tag-type">${IncidentParser.formatTypeLabel(incident.type)}</span>
<span class="tag">${incident.location}</span>
```

The citizenship formatting is in `docs/js/parser.js` `formatCitizenshipLabel()`.
