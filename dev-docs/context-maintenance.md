# Context & Documentation Maintenance

This document explains the CONTEXT.md table-of-contents system and how to maintain it.

## The TOC Approach

### Why This Structure?

LLMs have limited context windows and can miss important rules when they're buried in long documents. This project uses a two-tier documentation system:

1. **CONTEXT.md** - A table of contents with:
   - Critical rules that apply to most tasks (always read)
   - Quick reference mapping tasks → dev-docs
   - Dev-docs index with brief descriptions
   - LLM maintenance instructions

2. **dev-docs/** - Detailed documentation for specific topics

### Benefits

- **LLMs don't miss critical rules** - They're prominently in CONTEXT.md
- **LLMs know where to look** - Quick reference table maps tasks to docs
- **Detail stays accessible** - Deep info is in dev-docs, not lost
- **Smaller context overhead** - CONTEXT.md is ~250 lines, not 500+

### The Contract

An LLM reading only CONTEXT.md should:
- Know ALL rules that apply to most tasks (Critical Rules section)
- Know EXACTLY which dev-doc to read for any specific task
- Never miss important rules because they're buried in detail

---

## When to Update CONTEXT.md

### After Creating a New Dev-Doc

1. Add entry to the **Dev-Docs Index** in the appropriate category
2. If the doc covers a distinct task type, add to **Quick Reference** table
3. If the doc contains rules that apply to many tasks, consider adding to **Critical Rules**

### After Significantly Updating a Dev-Doc

1. Check if the **Dev-Docs Index** description is still accurate
2. Check if any new critical rules emerged that belong in CONTEXT.md

### After Deleting or Renaming a Dev-Doc

1. Remove or update the **Dev-Docs Index** entry
2. Remove or update any **Quick Reference** entries
3. Search CONTEXT.md for other references to the old name

---

## Reindexing Procedure

When the user asks to "reindex the dev-docs" or "update the TOC", follow this procedure:

### Step 1: Inventory Dev-Docs

```bash
ls -1 dev-docs/*.md
```

List all dev-docs and their current count.

### Step 2: Read Each Dev-Doc

For each dev-doc, note:
- Main topic/purpose (1 sentence)
- Any rules that should be in Critical Rules
- What task types it applies to

### Step 3: Compare to CONTEXT.md

Check:
- [ ] Every dev-doc is in the Dev-Docs Index
- [ ] Index descriptions are accurate and current
- [ ] Quick Reference covers all major task types
- [ ] Critical Rules contains all must-never-forget rules
- [ ] No references to deleted/renamed docs

### Step 4: Update CONTEXT.md

Make necessary additions, removals, or corrections.

### Step 5: Report Changes

Tell the user:
- Dev-docs added to index
- Dev-docs removed from index
- Description updates made
- Critical rules added/modified
- Quick reference entries added/modified

---

## What Belongs in Critical Rules

A rule belongs in CONTEXT.md's Critical Rules section if it meets ALL of these criteria:

1. **Frequently violated** - LLMs or humans commonly get this wrong
2. **Broadly applicable** - Applies to many different task types
3. **Serious consequences** - Getting it wrong causes real problems
4. **Easy to forget** - Not obvious or intuitive

### Current Critical Rules

| Rule | Why It's Critical |
|------|-------------------|
| Terminology (entry=incident) | Causes confusion; used interchangeably everywhere |
| Timestamps (use script) | LLMs ALWAYS fabricate timestamps if not reminded |
| incidents-summary.json (don't edit) | Changes get overwritten; frustrating to lose work |
| Trustworthiness (exactly one value) | Common mistake: "medium-high" is invalid |
| Incident types (exactly 5) | Made-up types break the site |
| SVG icons (use pattern) | Inline SVGs create maintenance nightmare |
| Sources must have links | No link = worthless source entry |
| Neutral language | Credibility depends on this |
| Check not_use.md | Prevents re-adding rejected stories |
| last_updated rules | Wrong updates break "Sort by Updated" feature |
| Search for sources (read adding-incidents.md) | LLMs skip source searching; point to Step 1.5 |

### Rules That Don't Belong

- Detailed procedures (belong in dev-docs)
- One-off edge cases (belong in dev-docs)
- Tool-specific instructions (belong in dev-docs)
- Examples and templates (belong in dev-docs)

---

## Dev-Docs Categories

Keep the Dev-Docs Index organized by category:

| Category | What Goes Here |
|----------|---------------|
| **Core Documentation** | Architecture, schemas, procedures used by everyone |
| **Code Quality** | Reviews, refactoring, technical debt |
| **URL & Navigation** | Routing, links, navigation behavior |
| **UI & Media** | Components, icons, video, images |
| **Research & Content** | Finding incidents, sources, editorial rules |
| **Operations & Deployment** | Hosting, testing, monitoring |
| **Social & Outreach** | Social media, marketing, communications |
| **Reference** | Historical, ideas, one-off docs |

When creating a new dev-doc, put it in the most specific applicable category.

---

## File Naming Conventions

Dev-docs should use kebab-case names that describe the content:

| Good | Bad |
|------|-----|
| `url-routing.md` | `urls.md` |
| `adding-incidents.md` | `incidents.md` |
| `media-controls.md` | `video.md` |
| `llm-search-procedure.md` | `search.md` |

Specific > Generic. A doc named `video.md` could be about anything; `media-controls.md` is clear.

---

## Maintenance Checklist

Run through this when doing a full reindex:

- [ ] Count dev-docs matches index count
- [ ] Every dev-doc has an index entry
- [ ] Index descriptions are 5-15 words, accurate
- [ ] Quick Reference covers common tasks
- [ ] Critical Rules are still critical
- [ ] No stale references to renamed/deleted docs
- [ ] Code structure tree is accurate
- [ ] Development commands are current

---

## Version History

| Date | Change |
|------|--------|
| 2026-01-21 | Initial creation of TOC system |
