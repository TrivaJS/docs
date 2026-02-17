# Redis Adapter

Use Redis as the cache backend (recommended for production).

## Installation

```bash
npm install redis
```

## Configuration

```javascript
import { build, listen } from 'triva';

await build({
  cache: {
    type: 'redis',
    url: 'redis://localhost:6379'
  }
});

listen(3000);
```

## Connection String Format

```
redis://[username:password@]host[:port][/db-number]
```

Examples:

```javascript
// Local
url: 'redis://localhost:6379'

// With password
url: 'redis://:password@localhost:6379'

// With database number
url: 'redis://localhost:6379/1'

// Cloud (Redis Labs, etc)
url: 'redis://user:pass@redis-12345.cloud.redislabs.com:12345'
```

## Usage

```javascript
import { build, cache, get, listen } from 'triva';

await build({
  cache: {
    type: 'redis',
    url: 'redis://localhost:6379'
  }
});

get('/set', async (req, res) => {
  await cache.set('key', 'value', 3600);
  res.json({ success: true });
});

get('/get', async (req, res) => {
  const value = await cache.get('key');
  res.json({ value });
});

listen(3000);
```

## Features

- Industry-standard caching
- Extremely fast (in-memory)
- TTL support (native)
- Pub/sub capabilities
- Persistent storage (optional)
- Atomic operations

## Why Redis?

Redis is the recommended adapter for production because:

1. **Speed** - In-memory storage, microsecond latency
2. **TTL** - Native support for expiration
3. **Scalability** - Handles millions of ops/sec
4. **Reliability** - Battle-tested in production
5. **Features** - Rich data structures, pub/sub

## Best Practices

1. **Use Redis in production** - It's built for caching
2. **Set appropriate TTL** - Don't let cache grow indefinitely
3. **Monitor memory** - Redis stores everything in RAM
4. **Use connection pooling** - redis package handles this
5. **Environment variables** - Store connection string in env vars

```javascript
await build({
  cache: {
    type: 'redis',
    url: process.env.REDIS_URL
  }
});
```

## Production Example

```javascript
import { build, cache, get, post, listen } from 'triva';

await build({
  env: 'production',
  cache: {
    type: 'redis',
    url: process.env.REDIS_URL
  }
});

// Cache API responses
get('/api/posts', async (req, res) => {
  const cacheKey = 'posts:all';
  
  let posts = await cache.get(cacheKey);
  if (!posts) {
    posts = await fetchFromDB();
    await cache.set(cacheKey, posts, 300);
  }
  
  res.json({ posts });
});

// Session storage
post('/login', async (req, res) => {
  const sessionId = generateId();
  await cache.set(`session:${sessionId}`, req.body, 3600);
  res.json({ sessionId });
});

listen(3000);
```

## Next Steps

- [MongoDB Adapter](https://docs.trivajs.com/database/mongodb)
- [PostgreSQL Adapter](https://docs.trivajs.com/database/postgresql)
- [Quick Start](https://docs.trivajs.com/database/quick-start)
