# Database And Cache Overview

Triva uses a single cache layer that can be backed by different adapters. You configure the adapter in `new build({ cache: ... })` and then use the exported `cache` singleton in your routes.

## Basic Shape

```javascript
import { build, cache } from 'triva';

const app = new build({
  cache: {
    type: 'memory',
    retention: 300000
  }
});

app.get('/reports/:id', async (req, res) => {
  const key = `report:${req.params.id}`;
  const cached = await cache.get(key);

  if (cached) {
    return res.json({ source: 'cache', data: cached });
  }

  const report = await loadReport(req.params.id);
  await cache.set(key, report, 300000);
  res.json({ source: 'origin', data: report });
});
```

## Core Idea

There is no separate application-level `database` client in the Triva API. The documented storage surface is the configured `cache` adapter plus the exported `cache` helper methods.

## Cache Methods

- `cache.get(key)`
- `cache.set(key, value, ttlMs?)`
- `cache.delete(key)`
- `cache.has(key)`
- `cache.clear()`
- `cache.keys(pattern?)`
- `cache.stats()`

TTL values are in milliseconds.

## Adapter Configuration Pattern

Simple adapters:

```javascript
cache: {
  type: 'memory',
  retention: 300000
}
```

Adapters with connection settings:

```javascript
cache: {
  type: 'redis',
  retention: 300000,
  database: {
    url: process.env.REDIS_URL
  }
}
```

## Supported Adapters

- `memory`
- `embedded`
- `sqlite`
- `better-sqlite3`
- `redis`
- `mongodb`
- `postgresql`
- `mysql`
- `supabase`

## Choose The Right Adapter

- use `memory` for development and tests
- use `redis` for shared production caches
- use `mongodb`, `postgresql`, `mysql`, or `supabase` when you want persistence inside existing infrastructure
- use `sqlite`, `better-sqlite3`, or `embedded` for single-node or file-backed setups

## Related Docs

- [Database Quick Start](https://docs.trivajs.com/database/quick-start)
- [Adapter Reference](https://docs.trivajs.com/database/adapters)
