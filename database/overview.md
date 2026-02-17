# Database & Cache Overview

Triva's unified cache layer supports multiple database adapters for flexible data storage.

## How It Works

Triva uses a single `cache` object that can be backed by different database adapters:

```javascript
import { build, cache, listen } from 'triva';

await build({
  env: 'development',
  cache: {
    type: 'redis',
    url: 'redis://localhost:6379'
  }
});

// Use cache (backed by Redis)
await cache.set('key', 'value', 3600);
const value = await cache.get('key');

listen(3000);
```

## Key Concept

**There is NO separate `database` export.** Everything goes through the `cache` object, regardless of which adapter you use.

## Supported Adapters

Triva supports 9 database adapters:

1. **Memory** - In-memory storage (default)
2. **Embedded** - File-based JSON storage
3. **SQLite** - SQLite database
4. **Better-SQLite3** - Faster SQLite (synchronous)
5. **MongoDB** - MongoDB database
6. **Redis** - Redis cache server
7. **PostgreSQL** - PostgreSQL database
8. **MySQL** - MySQL database
9. **Supabase** - Supabase (PostgreSQL-based)

[Full Adapter List](https://docs.trivajs.com/database/adapters)

## Basic Usage

### Configure in build()

```javascript
import { build, cache, listen } from 'triva';

await build({
  cache: {
    type: 'mongodb',
    url: 'mongodb://localhost:27017/myapp'
  }
});

listen(3000);
```

### Use cache object

```javascript
import { cache } from 'triva';

// Set value
await cache.set('user:123', { name: 'Alice' }, 3600);

// Get value
const user = await cache.get('user:123');

// Delete value
await cache.delete('user:123');

// Clear all
await cache.clear();
```

## Cache Methods

### cache.set(key, value, ttl)

Store a value with optional TTL (seconds).

```javascript
await cache.set('key', 'value', 3600); // 1 hour TTL
```

### cache.get(key)

Retrieve a value.

```javascript
const value = await cache.get('key');
```

### cache.delete(key)

Delete a value.

```javascript
await cache.delete('key');
```

### cache.has(key)

Check if key exists.

```javascript
const exists = await cache.has('key');
```

### cache.clear()

Clear all cached data.

```javascript
await cache.clear();
```

### cache.keys(pattern)

Get all keys matching pattern.

```javascript
const keys = await cache.keys('user:*');
```

### cache.stats()

Get cache statistics.

```javascript
const stats = await cache.stats();
```

## Configuration Options

Different adapters require different configuration:

### Memory (Default)

```javascript
cache: {
  type: 'memory',
  retention: 600  // TTL in seconds
}
```

### Redis

```javascript
cache: {
  type: 'redis',
  url: 'redis://localhost:6379'
}
```

### MongoDB

```javascript
cache: {
  type: 'mongodb',
  url: 'mongodb://localhost:27017/myapp'
}
```

### PostgreSQL

```javascript
cache: {
  type: 'postgresql',
  url: 'postgresql://user:pass@localhost:5432/mydb'
}
```

[All Adapter Configurations](https://docs.trivajs.com/database/adapters)

## Common Patterns

### Session Storage

```javascript
import { build, cache, get, post, listen } from 'triva';

await build({
  cache: {
    type: 'redis',
    url: 'redis://localhost:6379'
  }
});

post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Verify credentials...
  const sessionId = generateSessionId();
  
  await cache.set(`session:${sessionId}`, { username }, 3600);
  
  res.json({ sessionId });
});

get('/profile', async (req, res) => {
  const sessionId = req.headers['x-session-id'];
  const session = await cache.get(`session:${sessionId}`);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json({ user: session.username });
});

listen(3000);
```

### Rate Limiting Data

```javascript
get('/api/data', async (req, res) => {
  const ip = req.socket.remoteAddress;
  const key = `ratelimit:${ip}`;
  
  const count = await cache.get(key) || 0;
  
  if (count > 100) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  await cache.set(key, count + 1, 60);
  
  res.json({ data: 'example' });
});
```

### Caching API Responses

```javascript
get('/api/expensive', async (req, res) => {
  const cacheKey = 'expensive-data';
  
  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.json({ data: cached, cached: true });
  }
  
  const data = await expensiveOperation();
  await cache.set(cacheKey, data, 300);
  
  res.json({ data, cached: false });
});
```

## Choosing an Adapter

### Development

Use **memory** or **embedded** for simplicity:

```javascript
cache: { type: 'memory' }
```

### Production

Use **Redis**, **MongoDB**, or **PostgreSQL** for persistence and scalability:

```javascript
cache: {
  type: 'redis',
  url: process.env.REDIS_URL
}
```

### Embedded Apps

Use **SQLite** or **better-sqlite3** for single-file storage:

```javascript
cache: {
  type: 'sqlite',
  filename: './data.db'
}
```

## Next Steps

- [Quick Start Guide](https://docs.trivajs.com/database/quick-start)
- [Adapter List](https://docs.trivajs.com/database/adapters)
- [MongoDB Adapter](https://docs.trivajs.com/database/mongodb)
- [Redis Adapter](https://docs.trivajs.com/database/redis)
