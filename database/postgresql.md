# PostgreSQL Adapter

Use PostgreSQL as the cache backend.

## Installation

```bash
npm install pg
```

## Configuration

```javascript
import { build, listen } from 'triva';

await build({
  cache: {
    type: 'postgresql',
    url: 'postgresql://user:pass@localhost:5432/mydb'
  }
});

listen(3000);
```

## Connection String Format

```
postgresql://[user[:password]@][host][:port][/database][?param1=value1&...]
```

Examples:

```javascript
// Local
url: 'postgresql://localhost:5432/mydb'

// With auth
url: 'postgresql://user:pass@localhost:5432/mydb'

// Cloud (Heroku, etc)
url: process.env.DATABASE_URL

// SSL
url: 'postgresql://user:pass@host:5432/mydb?ssl=true'
```

## Usage

```javascript
import { build, cache, get, listen } from 'triva';

await build({
  cache: {
    type: 'postgresql',
    url: 'postgresql://localhost:5432/mydb'
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

- Relational database
- ACID transactions
- TTL support
- JSON support (JSONB)
- Powerful queries
- Persistent storage

## Best Practices

1. **Connection pooling** - pg driver handles this
2. **Use SSL in production** - Add `?ssl=true` to connection string
3. **Set TTL** - Use TTL for automatic expiration
4. **Environment variables** - Store credentials in env vars

```javascript
await build({
  cache: {
    type: 'postgresql',
    url: process.env.DATABASE_URL
  }
});
```

## Production Example

```javascript
import { build, cache, get, post, listen } from 'triva';

await build({
  env: 'production',
  cache: {
    type: 'postgresql',
    url: process.env.DATABASE_URL
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

- [MySQL Adapter](https://docs.trivajs.com/database/mysql)
- [MongoDB Adapter](https://docs.trivajs.com/database/mongodb)
- [Quick Start](https://docs.trivajs.com/database/quick-start)
