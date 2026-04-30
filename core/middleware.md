# Middleware

Middleware in Triva uses the familiar `(req, res, next)` shape and is registered with `app.use()` or directly on routes.

## Basic Middleware

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(3000);
```

## Route-Specific Middleware

```javascript
const requireAuth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.get('/admin', requireAuth, (req, res) => {
  res.json({ ok: true });
});
```

## Constructor-Wired Middleware

Triva can create middleware for throttling and retention from constructor options.

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

Because throttling stores counters through the cache layer, configure `cache` whenever you enable `throttle`.

## `middleware` Helper Export

If you want to create the middleware function yourself, use the exported factory:

```javascript
import { build, middleware } from 'triva';

const app = new build({ cache: { type: 'memory' } });

app.use(middleware({
  throttle: {
    limit: 200,
    window_ms: 60000
  },
  retention: {
    enabled: true,
    maxEntries: 20000
  }
}));
```

## Cookie Parsing

Cookie parsing is available through the exported `cookieParser()` utility.

```javascript
import { build, cookieParser } from 'triva';

const app = new build({ env: 'development' });

app.use(cookieParser());

app.get('/session', (req, res) => {
  res.json({ cookies: req.cookies || {} });
});
```

## Error Tracking

Error tracking is configured separately from middleware registration:

```javascript
const app = new build({
  errorTracking: {
    enabled: true,
    maxEntries: 10000
  }
});
```

## Logging Note

The stable way to add request logging today is explicit middleware you control. Do not document a `logging` constructor block for the current Triva API.

## Related Docs

- [Middleware Overview](https://docs.trivajs.com/middleware/overview)
- [Throttling](https://docs.trivajs.com/middleware/throttling)
- [Error Tracking](https://docs.trivajs.com/middleware/error-tracking)
