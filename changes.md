# Changelog

All notable public-facing changes to Triva are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Documentation expansion for deployment, examples, benchmarks, extensions, and support workflows
- Docs navigation updates so all public Markdown pages are reachable from the HTML docs app

### Changed
- Public docs links now point to canonical routes instead of legacy `v1` and placeholder paths
- The landing site now links to valid docs pages across guides, policies, and adapters

### Fixed
- Broken docs navigation entries that pointed to missing pages
- Missing support and extension routes in the docs site

## [1.0.0] - 2026-02-16

### Added
- Initial stable release
- Function-based API (`build`, `get`, `post`, `put`, `del`, `patch`, `all`, `listen`)
- Built-in middleware for logging, throttling, and error tracking
- Database adapters for MongoDB, PostgreSQL, MySQL, Redis, SQLite, Better-SQLite3, Supabase, Embedded, and Memory
- HTTPS support with optional auto-redirect
- Request and response helpers for common HTTP workflows

## Version History

- [1.0.0] - 2026-02-16 - Initial stable release
- [0.4.0] - Early pre-1.0 milestone release documented in the repository history

[Unreleased]: https://github.com/trivajs/triva/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/trivajs/triva/releases/tag/v1.0.0
