# Logging

The current Triva constructor API does not expose a stable `logging` block. If you need request logs today, the recommended pattern is explicit middleware you own.

## Simple Request Logging

```javascript
import { build } from 'triva';

const app = new build({ env: 'development' });

app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    console.log({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration
    });
  });

  next();
});
```

## Structured Logging

```javascript
app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    process.stdout.write(JSON.stringify({
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: Date.now() - startedAt
    }) + '\\n');
  });

  next();
});
```

## Retention And Error Tracking

If you also want in-process visibility for middleware and error data, combine explicit logging with `retention` and `errorTracking`:

```javascript
const app = new build({
  retention: {
    enabled: true,
    maxEntries: 100000
  },
  errorTracking: {
    enabled: true,
    maxEntries: 10000
  }
});
```

## Related Docs

- [Error Tracking](https://docs.trivajs.com/middleware/error-tracking)
- [Custom Middleware](https://docs.trivajs.com/middleware/custom)
