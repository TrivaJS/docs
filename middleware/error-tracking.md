# Error Tracking

Triva can capture route, middleware, and process-level errors through the exported `errorTracker`.

## Enable It

```javascript
import { build } from 'triva';

const app = new build({
  errorTracking: {
    enabled: true,
    maxEntries: 10000
  }
});
```

## Automatic Capture

Triva automatically captures:

- route handler errors
- middleware errors
- uncaught exceptions
- unhandled promise rejections

## Manual Capture

```javascript
import { build, errorTracker } from 'triva';

const app = new build({
  errorTracking: { enabled: true }
});

app.get('/risky', async (req, res) => {
  try {
    await processData();
    res.json({ ok: true });
  } catch (error) {
    await errorTracker.capture(error, {
      req,
      phase: 'route',
      custom: { endpoint: '/risky' }
    });

    res.status(500).json({ error: 'Processing failed' });
  }
});
```

## Reading Errors

```javascript
const allErrors = await errorTracker.get();
const unresolved = await errorTracker.get({ resolved: false, limit: 50 });
const byId = await errorTracker.getById('err_123');
const stats = await errorTracker.getStats();
```

## Resolving And Clearing

```javascript
await errorTracker.resolve('err_123');
await errorTracker.clear();
```

## Related Docs

- [Core Error Handling](https://docs.trivajs.com/core/error-handling)
- [Production Deployment](https://docs.trivajs.com/deployment/production)
