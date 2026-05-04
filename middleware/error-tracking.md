# Error Tracking

Triva can capture runtime errors through the `errorTracking` option and the exported `errorTracker` utility.

## Enable Error Tracking

```javascript
const app = new build({
  errorTracking: {
    enabled: true,
    maxEntries: 5000
  }
});
```

## Throwing Errors

```javascript
app.get('/test/error', (req, res) => {
  throw new Error('Test error');
});
```

## Read Captured Errors

```javascript
import { errorTracker } from 'triva';

const unresolved = await errorTracker.get({ resolved: false, limit: 100 });
const stats = await errorTracker.getStats();
```

## Resolve or Clear

```javascript
await errorTracker.resolve('error-id');
await errorTracker.clear();
```
