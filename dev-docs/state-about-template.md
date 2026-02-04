# State about.md Template

The about page template lives at `docs/about.md` in this repository. Each state repo should have its own copy at `docs/about.md`.

## Setup

```bash
cp ../GIT_US_ICE_WITNESS/docs/about.md docs/about.md
```

Then customize:
- Replace `[STATE]` with your state name (e.g., "Colorado")
- Replace `[DATE]` with the current date
- Fill in the Background section with state-specific context
- Update Source Tiers with local news outlets
- Add social media links if desired (see HTML comment in template)

**State maintainers have full control over their about page.** The site fetches `about.md` from each state's own deployment, so changes take effect when you commit and push.

See also: [new-state-setup.md](new-state-setup.md) for full setup instructions.
