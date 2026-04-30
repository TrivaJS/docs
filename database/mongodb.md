# MongoDB Adapter

Use MongoDB when you want cache persistence inside a document-oriented deployment.

## Install

```bash
npm install mongodb
```

## Configuration

```javascript
import { build } from 'triva';

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

## Example

```javascript
import { build, cache } from 'triva';

const app = new build({
  cache: {
    type: 'mongodb',
    database: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
      database: 'triva_cache',
      collection: 'sessions'
    }
  }
});

app.post('/api/sessions', async (req, res) => {
  const body = await req.json();
  const sessionId = `session:${Date.now()}`;

  await cache.set(sessionId, body, 3600000);
  res.status(201).json({ sessionId });
});

app.get('/api/sessions/:id', async (req, res) => {
  const session = await cache.get(req.params.id);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json(session);
});
```

## Related Docs

- [Redis Adapter](https://docs.trivajs.com/database/redis)
- [PostgreSQL Adapter](https://docs.trivajs.com/database/postgresql)
