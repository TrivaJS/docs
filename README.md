# Docs Workspace

This directory powers [docs.trivajs.com](https://docs.trivajs.com/getting-started), the public documentation site for Triva.

## What Lives Here

- Product documentation pages in Markdown
- Static assets for the docs UI
- Sidebar/navigation data
- The lightweight HTML app that renders Markdown pages in the browser

## Content Layout

- `getting-started.md`, `installation.md`, `changes.md`, `roadmap.md`: top-level entry pages
- `core/`: API and framework concepts
- `middleware/`: built-in middleware guides
- `database/`: adapter and cache documentation
- `deployment/`: HTTPS and production deployment guides
- `examples/`: runnable patterns and reference implementations
- `extensions/`: official package add-ons
- `policies/`: governance, legal, and security documents
- `assets/`: CSS, JavaScript, and navigation data

## Working Locally

The docs app is static, so any simple file server is enough for local review.

```bash
npx serve docs
```

Then open the local URL from the server output and browse the docs routes normally.

## Updating Navigation

When you add a new page under `docs/`, also update `docs/assets/data/navigation.json` so the page appears in the HTML sidebar and previous/next navigation.

## Contributing

Please review the public contribution guidelines before changing framework docs or policies:

- Contributing guide: [docs.trivajs.com/policies/contributing](https://docs.trivajs.com/policies/contributing)
- Code of conduct: [docs.trivajs.com/policies/code-of-conduct](https://docs.trivajs.com/policies/code-of-conduct)
- Security policy: [docs.trivajs.com/policies/security](https://docs.trivajs.com/policies/security)
