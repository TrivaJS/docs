# Better-SQLite3 Adapter

Use this adapter when you want SQLite-style storage with the `better-sqlite3` package.

## Install

```bash
npm install better-sqlite3
```

## Configuration

```javascript
import { build } from 'triva';

const app = new build({
  cache: {
    type: 'better-sqlite3',
    database: {
      filename: './triva.db'
    }
  }
});
```

## Example

```javascript
import { build, cache } from 'triva';

const app = new build({
  cache: {
    type: 'better-sqlite3',
    database: {
      filename: './triva.db'
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

- [SQLite Adapter](https://docs.trivajs.com/database/sqlite)
- [Embedded Adapter](https://docs.trivajs.com/database/embedded)
