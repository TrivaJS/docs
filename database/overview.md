# Database and Cache Overview

Triva uses one cache API across multiple adapters. Configuration lives under the app's `cache` option, and runtime access happens through the exported `cache` singleton.

## Basic Memory Configuration

```javascript
import { build, cache } from 'triva';

const app = new build({
  cache: {
    type: 'memory',
    retention: 300000
  }
});

app.get('/stats', async (req, res) => {
  const cached = await cache.get('stats:latest');
  if (cached) {
    return res.json({ source: 'cache', data: cached });
  }

  const data = { requests: 42 };
  await cache.set('stats:latest', data, 300000);
  res.json({ source: 'generated', data });
});
```

## Runtime Cache Methods

- `await cache.get(key)`
- `await cache.set(key, value, ttl?)`
- `await cache.delete(key)`
- `await cache.has(key)`
- `await cache.clear()`
- `await cache.keys(pattern?)`
- `await cache.stats()`

## Adapter Configuration

External adapters use `cache.database`:

```javascript
cache: {
  type: 'redis',
  retention: 300000,
  database: {
    host: 'localhost',
    port: 6379
  }
}
```
