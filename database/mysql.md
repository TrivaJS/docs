# MySQL Adapter

Use MySQL as the cache backend.

## Installation

```bash
npm install mysql2
```

## Configuration

```javascript
import { build, listen } from 'triva';

await build({
  cache: {
    type: 'mysql',
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'mydb'
  }
});

listen(3000);
```

## Connection Options

```javascript
cache: {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'mydb'
}
```

## Usage

```javascript
import { build, cache, get, listen } from 'triva';

await build({
  cache: {
    type: 'mysql',
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'mydb'
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
- Wide adoption
- TTL support
- JSON support
- Persistent storage

## Best Practices

1. **Connection pooling** - mysql2 handles this
2. **Use environment variables** - Store credentials in env vars
3. **Set TTL** - Use TTL for automatic cleanup
4. **Index properly** - Ensure cache table is indexed

```javascript
await build({
  cache: {
    type: 'mysql',
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  }
});
```

## Production Example

```javascript
import { build, cache, get, post, listen } from 'triva';

await build({
  env: 'production',
  cache: {
    type: 'mysql',
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  }
});

post('/api/data', async (req, res) => {
  await cache.set(`data:${req.body.id}`, req.body, 3600);
  res.json({ success: true });
});

get('/api/data/:id', async (req, res) => {
  const data = await cache.get(`data:${req.params.id}`);
  res.json({ data });
});

listen(3000);
```

## Next Steps

- [PostgreSQL Adapter](https://docs.trivajs.com/database/postgresql)
- [MongoDB Adapter](https://docs.trivajs.com/database/mongodb)
- [Quick Start](https://docs.trivajs.com/database/quick-start)
