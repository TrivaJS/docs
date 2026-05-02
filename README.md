# Docs Workspace

This folder powers the Triva documentation site.

## Structure

- `index.html` contains the docs shell
- `assets/js/app.js` handles routing, markdown rendering, version switching, and smooth page navigation
- `assets/css/style.css` contains the docs-site layout and homepage styling
- `assets/data/navigation.json` defines the published sidebar navigation
- `assets/data/versions.json` defines available docs versions

## Versioning Model

The docs UI is version-aware.

- `/` renders the current docs landing page
- `/v1/...` is the canonical route shape for published Triva v1 pages
- unversioned internal links are normalized into the active docs version

That means we can add future docs sets without rebuilding the shell. A later release can point its own manifest entry at a separate content root.

## Published vs Source Pages

Not every Markdown file in this folder is meant to be published in the sidebar. The published route set is controlled by `navigation.json`.

The `changes.md` and `roadmap.md` files can stay in the workspace for reference, but they are not part of the public docs navigation.

## Working on Content

Use the real runtime API when updating pages:

- create apps with `new build(...)`
- parse request bodies with `await req.json()` or `await req.text()`
- use `cache.get()`, `cache.set()`, `cache.delete()`, and `cache.keys()`
- configure HTTP or HTTPS through `protocol` and `ssl`

## Useful Routes

- [Getting Started](/getting-started)
- [API Reference](/core/api)
- [Examples](/examples/rest-api)
- [Policies](/policies/contributing)
