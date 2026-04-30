# Redis Adapter

Redis is the most natural shared-cache backend for Triva production deployments.

## Install

```bash
npm install redis
```

## Configuration

```javascript
import { build } from 'triva';

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

The Redis adapter passes the `database` object into `redis.createClient(...)`, so a connection URL is the clearest documented shape.

## Example

```javascript
import { build, cache } from 'triva';

const app = new build({
  cache: {
    type: 'redis',
    database: {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
  }
});

app.post('/sessions', async (req, res) => {
  const { userId } = await req.json();
  const sessionId = `session:${Date.now()}:${userId}`;

  const session = {
    userId,
    createdAt: new Date().toISOString()
  };

  await cache.set(sessionId, session, 3600000);
  res.status(201).json({ sessionId, session });
});

app.get('/sessions/:id', async (req, res) => {
  const session = await cache.get(req.params.id);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json(session);
});
```

## Related Docs

- [Database Overview](https://docs.trivajs.com/database/overview)
- [MongoDB Adapter](https://docs.trivajs.com/database/mongodb)
