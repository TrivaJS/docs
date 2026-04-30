# Database Quick Start

This guide shows the real Triva storage workflow: configure a cache adapter in the app constructor, then use the exported `cache` object inside your handlers.

## Step 1: Start With Memory

```javascript
import { build } from 'triva';

const app = new build({
  cache: {
    type: 'memory',
    retention: 300000
  }
});

app.listen(3000);
```

## Step 2: Use The Cache API

```javascript
import { build, cache } from 'triva';

const app = new build({
  cache: { type: 'memory' }
});

app.post('/api/users', async (req, res) => {
  const user = await req.json();
  await cache.set(`user:${user.id}`, user, 3600000);
  res.status(201).json(user);
});

app.get('/api/users/:id', async (req, res) => {
  const user = await cache.get(`user:${req.params.id}`);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});
```

## Step 3: Move To Another Adapter

Redis:

```javascript
const app = new build({
  cache: {
    type: 'redis',
    retention: 300000,
    database: {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
  }
});
```

MongoDB:

```javascript
const app = new build({
  cache: {
    type: 'mongodb',
    retention: 300000,
    database: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      database: 'triva_cache',
      collection: 'cache_entries'
    }
  }
});
```

SQLite:

```javascript
const app = new build({
  cache: {
    type: 'sqlite',
    database: {
      filename: './triva.sqlite'
    }
  }
});
```

## Common Operations

```javascript
await cache.set('session:123', { userId: 1 }, 3600000);
const session = await cache.get('session:123');
const exists = await cache.has('session:123');
const keys = await cache.keys('session:*');
await cache.delete('session:123');
const stats = await cache.stats();
```

## Related Docs

- [Database Overview](https://docs.trivajs.com/database/overview)
- [Adapter Reference](https://docs.trivajs.com/database/adapters)
