# Middleware Overview

Middleware in Triva falls into three buckets:

1. custom functions you register with `app.use(...)`
2. route-specific handlers passed before the final route handler
3. constructor-wired middleware created from `throttle` and `retention` options

## Custom Middleware

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

## Constructor-Wired Middleware

```javascript
const app = new build({
  cache: { type: 'memory' },
  throttle: {
    limit: 100,
    window_ms: 60000
  },
  retention: {
    enabled: true,
    maxEntries: 50000
  }
});
```

Because throttling uses the cache layer, configure `cache` alongside `throttle`.

## Extension Middleware

- CORS: `@trivajs/cors`
- JWT auth helpers: `@triva/jwt`

## Logging Note

Current Triva docs should not advertise a `logging` constructor block. If you need request logging, add it yourself with middleware you control.

## Related Docs

- [Custom Middleware](https://docs.trivajs.com/middleware/custom)
- [Throttling](https://docs.trivajs.com/middleware/throttling)
- [Error Tracking](https://docs.trivajs.com/middleware/error-tracking)
- [CORS](https://docs.trivajs.com/middleware/cors)
