# MySQL Adapter

Use MySQL when you want the cache table to live inside a MySQL deployment.

## Install

```bash
npm install mysql2
```

## Configuration

```javascript
import { build } from 'triva';

const app = new build({
  cache: {
    type: 'mysql',
    database: {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: process.env.MYSQL_PASSWORD,
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
    type: 'mysql',
    database: {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: process.env.MYSQL_PASSWORD,
      database: 'triva'
    }
  }
});

app.post('/api/cache', async (req, res) => {
  const body = await req.json();
  await cache.set(`data:${body.id}`, body, 3600000);
  res.status(201).json(body);
});

app.get('/api/cache/:id', async (req, res) => {
  const value = await cache.get(`data:${req.params.id}`);
  res.json({ value });
});
```

## Related Docs

- [PostgreSQL Adapter](https://docs.trivajs.com/database/postgresql)
- [SQLite Adapter](https://docs.trivajs.com/database/sqlite)
