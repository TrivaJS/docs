# Caching Example

This example uses a cache-aside workflow with Triva's exported `cache` singleton.

## Example

```javascript
import { build, cache } from 'triva';

const app = new build({
  env: 'production',
  cache: {
    type: 'redis',
    retention: 300000,
    database: {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
  }
});

app.get('/api/reports/:id', async (req, res) => {
  const key = `report:${req.params.id}`;
  const cached = await cache.get(key);

  if (cached) {
    return res.json({ source: 'cache', data: cached });
  }

  const report = await loadReportFromDatabase(req.params.id);
  await cache.set(key, report, 300000);

  res.json({ source: 'database', data: report });
});

app.listen(3000);
```

## Pattern

1. compute a stable cache key
2. check cache first
3. load from the slower source on a miss
4. store the fresh value with a TTL in milliseconds

## Related Docs

- [Database Overview](https://docs.trivajs.com/database/overview)
- [Redis Adapter](https://docs.trivajs.com/database/redis)
- [Database Quick Start](https://docs.trivajs.com/database/quick-start)
