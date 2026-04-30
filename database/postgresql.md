# PostgreSQL Adapter

Use PostgreSQL when you want the cache table to live inside an existing Postgres deployment.

## Install

```bash
npm install pg
```

## Configuration

```javascript
import { build } from 'triva';

const app = new build({
  cache: {
    type: 'postgresql',
    database: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      database: 'triva',
      tableName: 'triva_cache'
    }
  }
});
```

## Example

```javascript
import { build, cache } from 'triva';

const app = new build({
  cache: {
    type: 'postgresql',
    database: {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: process.env.POSTGRES_PASSWORD,
      database: 'triva'
    }
  }
});

app.post('/api/cache', async (req, res) => {
  const body = await req.json();
  await cache.set(body.key, body.value, 3600000);
  res.json({ saved: true });
});

app.get('/api/cache/:key', async (req, res) => {
  const value = await cache.get(req.params.key);
  res.json({ value });
});
```

## Related Docs

- [MySQL Adapter](https://docs.trivajs.com/database/mysql)
- [Supabase Adapter](https://docs.trivajs.com/database/supabase)
