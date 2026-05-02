# Supabase Adapter

Use Supabase as the cache backend.

## Installation

```bash
npm install @supabase/supabase-js
```

## Configuration

```javascript
import { build, listen } from 'triva';

await build({
  cache: {
    type: 'supabase',
    url: 'https://your-project.supabase.co',
    key: 'your-anon-key'
  }
});

listen(3000);
```

## Options

```javascript
cache: {
  type: 'supabase',
  url: 'https://your-project.supabase.co',
  key: 'your-anon-key'
}
```

## Usage

```javascript
import { build, cache, get, listen } from 'triva';

await build({
  cache: {
    type: 'supabase',
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
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

- PostgreSQL-based
- Real-time subscriptions
- Row-level security
- Auto-generated APIs
- Cloud-hosted
- Free tier available

## Getting Credentials

1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy URL and anon/public key

## Best Practices

1. **Environment variables** - Store credentials in env vars
2. **Use service key** - For server-side operations
3. **Set TTL** - Use TTL for automatic cleanup
4. **Monitor usage** - Check Supabase dashboard

```javascript
await build({
  cache: {
    type: 'supabase',
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  }
});
```

## Production Example

```javascript
import { build, cache, get, post, listen } from 'triva';

await build({
  env: 'production',
  cache: {
    type: 'supabase',
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  }
});

post('/api/cache', async (req, res) => {
  await cache.set(req.body.key, req.body.value, 3600);
  res.json({ success: true });
});

get('/api/cache/:key', async (req, res) => {
  const value = await cache.get(req.params.key);
  res.json({ value });
});

listen(3000);
```

## Next Steps

- [PostgreSQL Adapter](https://docs.trivajs.com/database/postgresql)
- [MongoDB Adapter](https://docs.trivajs.com/database/mongodb)
- [Quick Start](https://docs.trivajs.com/database/quick-start)
