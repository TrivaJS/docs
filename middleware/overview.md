# Middleware Overview

Triva includes production-ready middleware built into the framework.

## What's Included

Triva provides these middleware features:

- **Throttling** - Rate limiting to prevent abuse
- **Logging** - Request/response logging with storage
- **Error Tracking** - Automatic error capture and storage
- **Cookie Parsing** - Parse cookies from requests
- **Redirects** - HTTP to HTTPS redirects

## Built-in vs Extensions

### Built-in Middleware

These are included in Triva core:

- Throttling (rate limiting)
- Logging
- Error tracking
- Cookie parser
- Redirect middleware

### Extensions

These require separate installation:

- CORS - `@triva/cors`
- JWT - `@triva/jwt`
- CLI - `@triva/cli`
- Shortcuts - `@triva/shortcuts`

## Enabling Built-in Middleware

Configure middleware in `build()`:

```javascript
import { build, listen } from 'triva';

await build({
  env: 'development',
  
  // Throttling (rate limiting)
  throttle: {
    enabled: true,
    max: 100,
    window: 60000
  },
  
  // Logging
  logging: {
    enabled: true,
    level: 'info'
  },
  
  // Error tracking
  errorTracking: {
    enabled: true
  },
  
  // Cookie parsing (automatic)
  // No config needed - always enabled
  
  // Redirects
  redirects: {
    enabled: true,
    rules: [
      { from: '/old', to: '/new', code: 301 }
    ]
  }
});

listen(3000);
```

## Custom Middleware

Add your own middleware with `use()`:

```javascript
import { build, use, get, listen } from 'triva';

await build({ env: 'development' });

use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

get('/', (req, res) => {
  res.send('Hello');
});

listen(3000);
```

[Custom Middleware Guide](https://docs.trivajs.com/middleware/custom)

## Middleware Order

Execution order:

1. Built-in redirect middleware (if enabled)
2. Built-in throttle middleware (if enabled)
3. Built-in cookie parser (always)
4. Custom middleware (via `use()`)
5. Route handlers
6. Error tracking (if enabled)

[Middleware Order Details](https://docs.trivajs.com/middleware/order)

## Available Middleware

- [Throttling](https://docs.trivajs.com/middleware/throttling) - Rate limiting
- [Logging](https://docs.trivajs.com/middleware/logging) - Request logs
- [CORS](https://docs.trivajs.com/middleware/cors) - Cross-origin (extension)
- [Error Tracking](https://docs.trivajs.com/middleware/error-tracking) - Error capture
- [Custom Middleware](https://docs.trivajs.com/middleware/custom) - Write your own

## Next Steps

- [Throttling Setup](https://docs.trivajs.com/middleware/throttling)
- [Logging Configuration](https://docs.trivajs.com/middleware/logging)
- [Custom Middleware](https://docs.trivajs.com/middleware/custom)
