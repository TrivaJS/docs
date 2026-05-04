# Extensions Overview

Official Triva extensions add focused features without changing the core app model.

## Current Packages

- `@trivajs/cors`
- `@triva/jwt`
- `@trivajs/cli`
- `@trivajs/shortcuts`

## Core Principle

Extensions should still feel like Triva:

- keep `new build(...)` as the application entry point
- plug into `app.use()` or route handlers
- avoid replacing the framework's request and response surface

## Related Docs

- [CORS](/extensions/cors)
- [JWT](/extensions/jwt)
- [CLI](/extensions/cli)
- [Shortcuts](/extensions/shortcuts)
