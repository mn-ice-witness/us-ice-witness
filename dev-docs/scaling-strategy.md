# Scaling Strategy

This document tracks our data scaling decisions, current metrics, and future considerations.

## Current State (Jan 27, 2026)

**Project age:** ~2 weeks (launched Dec 2025, active documentation started Jan 13, 2026)

### Data Metrics
- **Total incidents:** 147
- **Summary file size:** 205 KB (`docs/data/incidents-summary.json`)
- **Individual incident files:** 147 markdown files in `docs/incidents/`

## Current Architecture Decision

**Decision:** Keep single `incidents-summary.json` file

**Rationale (Jan 15, 2026):**
- 88KB is easily handled by browsers (50-100ms fetch)
- Single HTTP request is faster than 5 on HTTP/2
- Simple architecture, fewer moving parts
- Incidents with dual categories (e.g., HCMC patient incident is both `immigrants` and `schools-hospitals`) don't require duplication or complex handling

## Future Thresholds

Consider revisiting architecture when:

| Metric | Current | Threshold | Action |
|--------|---------|-----------|--------|
| Total incidents | 147 | 500+ | Consider splitting by category |
| File size | 205 KB | 500 KB+ | Consider splitting or pagination |
| Single category | ~50 | 200+ | Consider sub-categorization |
| Load time | ~150ms | 1s+ | Add loading indicators, consider lazy load |

## Future Options (Not Implemented)

### Option A: Split by Category
Create 5 separate JSON files:
- `incidents-citizens.json`
- `incidents-bystanders.json`
- `incidents-community.json`
- `incidents-schools-hospitals.json`
- `incidents-response.json`

**Pros:** Progressive loading, smaller individual fetches
**Cons:** 5 HTTP requests, dual-category incidents need duplication, more complex code

### Option B: Add Index File
Keep full file, add lightweight `incidents-index.json` (~5KB) with just:
- file paths
- titles
- dates
- types
- notable flag

**Pros:** Can fetch just metadata for overview
**Cons:** Two files to maintain, marginal benefit at current scale

### Option C: Pagination
Load incidents in batches (e.g., 20 at a time) with infinite scroll.

**Pros:** Fast initial load regardless of total count
**Cons:** Complex implementation, harder to search

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-15 | Keep single JSON file | 88KB is small, splitting adds complexity without meaningful benefit |
| 2026-01-27 | Continue single file | 205KB still well under threshold, no performance issues |

---

*Last updated: 2026-01-27*
