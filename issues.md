# Support and Issues

## Where to Report Problems

Use the main repository issue tracker for framework bugs, docs corrections, and feature requests:

- [GitHub Issues](https://github.com/trivajs/triva/issues)

## What to Include

When filing an issue, include:

- Triva version
- Node.js version
- adapter choice if cache is involved
- a short reproduction
- expected behavior
- actual behavior
- stack traces or response payloads when available

## Docs Problems

If a page shows the wrong API shape, call out the exact route or file. The docs site is versioned, so it helps to include the URL you were viewing.

## Before Opening an Issue

- Confirm you are using `new build(...)`, not `await build(...)`
- Parse request bodies with `await req.json()` or `await req.text()`
- Check whether your cache adapter needs an external driver package
- Confirm HTTPS configs include both `ssl.key` and `ssl.cert`

## Related Docs

- [Getting Started](/getting-started)
- [Configuration](/core/configuration)
- [Docs Workspace](/README)
