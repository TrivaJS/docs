# Contributing

## Before You Open a Pull Request

- confirm the docs and examples use the current Triva API
- keep examples on `new build(...)`
- parse bodies with `await req.json()` or `await req.text()`
- avoid documenting stale config shapes

## Documentation Changes

When you update docs:

- keep route links aligned with `navigation.json`
- make new Markdown files accessible through the published docs routes
- keep examples short and runnable
- do not add emoji to Markdown content

## Code Changes

For framework changes, include:

- a clear description
- tests when behavior changes
- docs updates when the public surface changes

## Where to Start

- [Support and Issues](/issues)
- [Docs Workspace](/README)
