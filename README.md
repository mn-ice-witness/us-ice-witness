# US ICE Witness

Main web UI and documentation hub for state-based ICE incident tracking.

## Architecture

- **This repo**: Web UI, state selector, editorial documentation
- **State repos**: Each state has its own repo containing incident data
  - `mn-ice-witness` - Minnesota
  - `co-ice-witness` - Colorado
  - `al-ice-witness` - Alabama
  - (more states as needed)

## For State Maintainers

If you're maintaining a state repo, see:
- [Editorial Guidelines](./docs/editorial-guidelines.md)
- [Incident Schema](./docs/incident-schema.md)
- [Media Workflow](./docs/media-workflow.md)

## Deployment

This repo deploys to `us-ice-witness.org` via Cloudflare Pages.

State repos deploy their content which is fetched by the main SPA.

## State Repo Structure

Each state repo should contain:
```
docs/
├── data/
│   └── incidents-summary.json
├── incidents/
│   └── YYYY-MM/
│       └── DD/
│           └── YYYY-MM-DD-slug.md
└── media/
    └── YYYY-MM/
        └── DD/
            └── YYYY-MM-DD-slug.mp4
```

