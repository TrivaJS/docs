# MongoDB Adapter

Use MongoDB as the cache backend.

## Installation

```bash
npm install mongodb
```

## Configuration

```javascript
import { build, listen } from 'triva';

await build({
  cache: {
    type: 'mongodb',
    url: 'mongodb://localhost:27017/myapp'
  }
});

listen(3000);
```

## Connection String Format

```
mongodb://[username:password@]host[:port][/database][?options]
```

Examples:

```javascript
// Local
url: 'mongodb://localhost:27017/myapp'

// With auth
url: 'mongodb://user:pass@localhost:27017/myapp'

// MongoDB Atlas
url: 'mongodb+srv://user:pass@cluster.mongodb.net/myapp'

// Replica set
url: 'mongodb://host1:27017,host2:27017/myapp?replicaSet=rs0'
```

## Usage

```javascript
import { build, cache, get, listen } from 'triva';

await build({
  cache: {
    type: 'mongodb',
    url: 'mongodb://localhost:27017/myapp'
  }
});

get('/set', async (req, res) => {
  await cache.set('user:123', { name: 'Alice' }, 3600);
  res.json({ success: true });
});

get('/get', async (req, res) => {
  const user = await cache.get('user:123');
  res.json({ user });
});

listen(3000);
```

## Features

- Document storage
- TTL support (automatic expiration)
- Query by key patterns
- Persistent storage
- Scalable

## Best Practices

1. **Use connection pooling** - MongoDB driver handles this automatically
2. **Set TTL** - Use TTL for automatic cleanup
3. **Index keys** - MongoDB automatically indexes the key field
4. **Use environment variables** - Store connection string in env vars

```javascript
await build({
  cache: {
    type: 'mongodb',
    url: process.env.MONGODB_URL
  }
});
```

## Production Example

```javascript
import { build, cache, get, post, listen } from 'triva';

await build({
  env: 'production',
  cache: {
    type: 'mongodb',
    url: process.env.MONGODB_URL
  }
});

post('/api/sessions', async (req, res) => {
  const sessionId = generateId();
  await cache.set(`session:${sessionId}`, req.body, 3600);
  res.json({ sessionId });
});

get('/api/sessions/:id', async (req, res) => {
  const session = await cache.get(`session:${req.params.id}`);
  if (!session) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(session);
});

listen(3000);
```

## Next Steps

- [PostgreSQL Adapter](https://docs.trivajs.com/database/postgresql)
- [Redis Adapter](https://docs.trivajs.com/database/redis)
- [Quick Start](https://docs.trivajs.com/database/quick-start)
