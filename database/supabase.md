# Supabase Adapter

Use Supabase when you want the cache table inside a Supabase project.

## Install

```bash
npm install @supabase/supabase-js
```

## Configuration

```javascript
import { build } from 'triva';

const app = new build({
  cache: {
    type: 'supabase',
    retention: 300000,
    database: {
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_KEY,
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
    type: 'supabase',
    database: {
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_KEY,
      tableName: 'triva_cache'
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

## Setup Note

The adapter expects a Supabase table such as `triva_cache` with `key`, `value`, and `expires_at` fields.

## Related Docs

- [PostgreSQL Adapter](https://docs.trivajs.com/database/postgresql)
- [Database Overview](https://docs.trivajs.com/database/overview)
